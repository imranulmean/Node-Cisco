import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import http from 'http';
import cors from 'cors';

import ping from "ping";
import { Client } from "ssh2";
import XLSX from "xlsx";
import fs from "fs";
import dotenv from 'dotenv';
import moment from 'moment';
import { backups, pushConfig2 } from './controllers/pushConfig.controller.js';


dotenv.config();
const __dirname = path.resolve();
let upDownInfo=[];

const app = express();
const server= http.createServer(app);

app.use(cors({
  origin: '*'
}));
app.use(express.json());
app.use(cookieParser());

///////////////////////
// --- CALCULATION LOGIC ---
function calculateISPStats(ispData, currentStatus) {
  const now = moment();
  const timeStr = now.format('MMMM Do YYYY, h:mm:ss a');
  const sixPM = moment().hour(18).minute(0).second(0);
  
  if (currentStatus !== ispData.prevStatus) {
      if (currentStatus === "DOWN") {
          ispData.downTimes.push(timeStr);
      } else if (currentStatus === "UP") {
          ispData.upTimes.push(timeStr);
      }
      ispData.prevStatus = currentStatus;
  }
  ispData.status = currentStatus;

  let totalMs = 0;
  const downs = ispData.downTimes || [];
  const ups = ispData.upTimes || [];

  for (let i = 0; i < downs.length; i++) {
      const start = moment(downs[i], "MMMM Do YYYY, h:mm:ss a");
      let end;
      if (ups[i]) {
          end = moment(ups[i], "MMMM Do YYYY, h:mm:ss a");
      } else {
          end = now.isAfter(sixPM) ? sixPM : now;
      }
      if (start.isValid() && end.isValid()) {
          const diff = end.diff(start);
          if (diff > 0) totalMs += diff;
      }
  }

  const duration = moment.duration(totalMs);
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  ispData.totalDownTime = `${hours} hr : ${minutes.toString().padStart(2, '0')} min`;

  return ispData;
}

function exportToExcel(finalResult) {
  const rows = finalResult.map(item => {
    const r = item.result; 
    return {
      branchId: r?.branchId || "", 
      name: r?.router || "",
      host: r?.host || "",
      isp1Name: r?.results?.isp1?.name || "",
      isp1Status: r?.results?.isp1?.status || "UNKNOWN",
      isp1Down: r?.results?.isp1?.totalDownTime || "",
      isp2Name: r?.results?.isp2?.name || "",
      isp2Status: r?.results?.isp2?.status || "UNKNOWN",
      isp2Down: r?.results?.isp2?.totalDownTime || "",
      error: r?.results?.error || "OK",
      routerType: r?.routerType || "UNKNOWN"
    };
  });
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ISP Status");
  XLSX.writeFile(workbook, "isp_status.xlsx");
  console.log("✅ Excel Updated isp_status.xlsx");
}

async function isRouterAlive(host) {
  try {
      const res = await ping.promise.probe(host, { timeout: 2 });
      return res.alive;
  } catch (e) { return false; }
}

function pushConfig(router, commands) {
  return new Promise((resolve) => {
    console.log(`🔐 Trying to enter ${router.router}`);
    const conn = new Client();
    let index = 0;
    let ispIndex = 1;
    const resData = { isp1Status: "DOWN", isp2Status: "DOWN", error: "" };

    // 🕒 THE WATCHDOG: If this isn't resolved in 30 seconds, kill it.
    const watchdog = setTimeout(() => {
      console.log(`⚠️ ${router.router} got stuck. Forcing resolution.`);
      conn.end();
      resData.error="Got stuck. Forcing resolution."
      resolve(resData); 
    }, 30000);    

    conn.on("ready", () => {
      console.log(`✅ Connection Established: ${router.router}`);
      conn.shell((err, stream) => {
        if (err) { 
          clearTimeout(watchdog);
          console.log(`Shell Error: ${err.message}`);
          resData.error = err.message; 
          return resolve(resData); 
        }
        
        const send = () => { 
          if (index < commands.length){
              stream.write(commands[index] + "\n"); 
          } 
          else{
              setTimeout(() => {
                  stream.write("exit\n");
                }, 500);                
          }
        };
        send();

        stream.on("data", data => {
          const text = data.toString();
          // process.stdout.write(text);
          if (text.includes("% Authorization failed")) {
            resData.error = "AUTHORIZATION_FAILED";
            stream.end();
          }
          if (text.includes("Success rate")) {
            const match = text.match(/Success rate is (\d+) percent/);
            resData[`isp${ispIndex}Status`] = (match && Number(match[1]) > 0) ? "UP" : "DOWN";
            resData.error = "OK";
            index++; ispIndex++;
            stream.write("\n");
            setTimeout(send, 300);
            return;
          }
          if (text.trim().endsWith("#") && !commands[index]?.startsWith("ping")) {
             resData.error = "OK";
            index++; setTimeout(send, 200);
          }
        });
        stream.on("close", () => { 
          clearTimeout(watchdog);
          conn.end(); 
          resolve(resData); 
      });
      });
    }).on("error", err => {
      clearTimeout(watchdog);
      resData.error = err.message;
      resolve(resData);
    }).connect({
      host: router.host,
      username: router.authType === "acs" ? process.env.ACS_USER : process.env.LOCAL_USER,
      password: router.authType === "acs" ? process.env.ACS_PASS : process.env.LOCAL_PASS,
      readyTimeout: 10000,
      algorithms: {
          kex: ["diffie-hellman-group14-sha1", "diffie-hellman-group1-sha1"],
          cipher: ["aes128-cbc", "aes256-cbc", "aes128-ctr", "aes256-ctr"],
          serverHostKey: ["ssh-rsa"]
      }
    });
  });
}

async function processRouter(routerItem) {
  const router = routerItem.result; // This is a reference to the object inside routerItem
  const alive = await isRouterAlive(router.host);
  
  // We assume DOWN unless proven otherwise
  let fresh = { isp1Status: "DOWN", isp2Status: "DOWN", error: "" };

  if (alive) {
      if (router.mikrotik === "yes") {
          const i1 = await isRouterAlive(router.results.isp1.source);
          const i2 = await isRouterAlive(router.results.isp2.source);
          fresh = { isp1Status: i1 ? "UP" : "DOWN", isp2Status: i2 ? "UP" : "DOWN", error: "" };
      } else {
          const cmds = [
              "terminal length 0", 
              `ping ${router.results.isp1.dest} source ${router.results.isp1.source} repeat 2 timeout 1`, 
              `ping ${router.results.isp2.dest} source ${router.results.isp2.source} repeat 2 timeout 1`
          ];
          // pushConfig returns { isp1Status, isp2Status, error }
          fresh = await pushConfig(router, cmds);            
      }
  } else {
      fresh.error = "Host Unreachable";
      console.log(`${router.router} is down`)
  }

  // --- CRITICAL UPDATES ---
  // 1. Update the error field explicitly
  router.results.error = fresh.error || "OK";
  
  // 2. Pass the results to calculateISPStats which updates arrays and totalDownTime
  // We update the existing objects so we don't lose 'name', 'dest', etc.
  router.results.isp1 = calculateISPStats(router.results.isp1, fresh.isp1Status);
  router.results.isp2 = calculateISPStats(router.results.isp2, fresh.isp2Status);

  // Because 'router' is a reference to 'routerItem.result', 
  // routerItem is now fully updated with the new values.
  return routerItem; 
}

async function runWithConcurrency(items, limit, worker) {
  const results = [];
  let index = 0;
  async function next() {
      if (index >= items.length) return;
      const current = index++;
      results.push(await worker(items[current]));
      await next();
  }
  await Promise.all(Array.from({ length: limit }, next));
  return results;
}

async function main() {
  if (running) return;
  running = true;
  console.log('--- Processing Cycle Start ---');
  
  const todayFile = `${moment().format('DD-MM-YYYY')}.json`;
  const data = JSON.parse(fs.readFileSync(todayFile, "utf8"));
  
  const updated = await runWithConcurrency(data.routers, 15, processRouter);
  upDownInfo=updated;
  
  fs.writeFileSync(todayFile, JSON.stringify({ routers: updated }, null, 1));
  console.log(`File Written to ${todayFile}`)
  // exportToExcel(updated);
  
  console.log('--- Cycle Complete ---');
  console.log('--- Next Cycle Start in 10s ---');
  setTimeout(()=>{
      running = false;
  },10*1000)
  
}

// --- INITIALIZATION & INTERVAL ---
let running = false;
const routers = JSON.parse(fs.readFileSync('routers.json', "utf8")).routers;

function checkAndRun() {
  const formatToday = moment().format('DD-MM-YYYY');
  if (!fs.existsSync(`${formatToday}.json`)) {
      console.log(`Creating ${formatToday}.json`);
      const initial = routers.map(rt => ({
          result: {
              branchId: rt.branchId, router: rt.name, authType:rt.authType, host: rt.host, routerType: rt.routerType, mikrotik: rt.mikrotik || "no",
              results: {
                  isp1: { name: rt.isp1Name, dest: rt.isp1Dest, source: rt.isp1Source, prevStatus: "UP", status: "UP", downTimes: [], upTimes: [], totalDownTime: "" },
                  isp2: { name: rt.isp2Name, dest: rt.isp2Dest, source: rt.isp2Source, prevStatus: "UP", status: "UP", downTimes: [], upTimes: [], totalDownTime: "" }
              }
          }
      }));        
      fs.writeFileSync(`${formatToday}.json`, JSON.stringify({ routers: initial }, null, 1));
  }
  main();
}

// Start immediately and then every 5 minutes

checkAndRun();

setInterval(()=>{
  const nowTime = moment();
  const nowTimeStr = nowTime.format('MMMM Do YYYY, h:mm:ss a');
  const tenAm = moment().hour(10).minute(0).second(0);
  const sixPm=moment().hour(18).minute(5).second(0);
  const isAfter10 = nowTime.isAfter(tenAm);
  const isAfter6 = nowTime.isAfter(sixPm);
  console.log(nowTimeStr, isAfter10 , isAfter6)
  if( isAfter10 && !isAfter6){
      checkAndRun();
  }
}, 1000);

///////////////////////////

app.get('/upDownInfo', (req,res)=>{
  res.send({
    message:upDownInfo.length,
    infos:upDownInfo
  });
})

app.get('/allRouters', (req, res)=>{
  res.send({
    routers
  });
})

app.post('/pushConfig', pushConfig2);
app.get('/backups', backups);

server.listen(3000, () => {
  console.log('Server is running on port 3000!');
});



app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

