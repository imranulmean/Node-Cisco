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

import { Server } from "socket.io";

import { backups, pushConfig2 } from './controllers/pushConfig.controller.js';
import { authMiddleware, checkSession, loginController, logout, socketSession } from './controllers/login.controller.js';
import { addRouter } from './controllers/addRouter.controller.js';
import mongoose from 'mongoose';
import { saveSession, saveToDb, getRouterSessions, addDownTime, generateReport2 } from './controllers/saveDb.controller.js';
import { getDowntimeFiles, getLocalFiles, uploadLocal, uploadPic } from './controllers/upload.controller.js';
import { snmpStatus } from './controllers/snmp.controller.js';
import { deleteAllMail, deleteSentMail, getSentMails, sendMail } from './controllers/mail.controller.js';
import administrationRoutes  from './routes/administration.route.js';
import scheduleRoutes  from './routes/schedule.route.js';
import { Schedule } from './models/schedule.model.js';
import { ipscan } from './controllers/ipscan.controller.js';

dotenv.config();
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log('MongoDb is connected');
  })
  .catch((err) => {
    console.log(err);
  });

const __dirname = path.resolve();
let upDownInfo=[];

const app = express();
const server= http.createServer(app);

// Initialize Socket.io and attach it to the same server
app.use(cors({
  origin: '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const io = new Server(server, {
    cors: {
      origin: "*", // Replace '*' with your specific React URL for better security
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  app.set("io", io)
  function stripAnsiAndControls(str) {
    // Remove ANSI escape sequences like \x1b[D
    return str.replace(/\x1B\[[0-9;]*[A-Za-z]/g, "");
  }

  const getCreds = (router, routerCreds) => {
    if (router.authType === "acs")      
      return { username: routerCreds.username, password: routerCreds.password };
    if (router.routerType === "mikrotik") 
      return { username: process.env.MIKROTIK_USER,  password: process.env.MIKROTIK_PASS };
    return { username: process.env.LOCAL_USER,     password: process.env.LOCAL_PASS };
  };  

io.on("connection", (socket) => {
    const ip = socket.handshake.headers["x-forwarded-for"]?.split(",")[0].trim() ||
              socket.handshake.address;
    console.log("Clients:", io.engine.clientsCount);
    console.log("Client IP:", ip);    
    let conn = new Client();
    let shellStream;
    
    /////////////////////////////
    let commandBuffer = "";
    let sessionCommands = []; 
    let sessionRouter;
    let sessionStartTime;
    let sessionUsername;
    // Triggered when user selects a router in the React UI
    socket.on("start-ssh", (router, sessionToken) => {
        const routerCreds= socketSession(sessionToken)
        if(!routerCreds){
          socket.emit("output", "Authentication failed\r\n");
          socket.disconnect(true);
          return;
        }

        sessionUsername=routerCreds.username
        sessionRouter=router;

      conn.on("ready", () => {
        socket.emit("output", `\r\n*** Connection Established: ${router.router} ***\r\n`);
        sessionStartTime=new Date();
        conn.shell({ term: 'xterm-color', cols: 80, rows: 24 }, (err, stream) => {

          let lastRouterLine = "";

          if (err) {
            socket.emit("output", `\r\n*** Shell Error: ${err.message} ***\r\n`);
            return;
          }
          shellStream = stream;
  
          // Pipe Router Data -> Frontend
          stream.on("data", (data) => {
            socket.emit("output", data.toString());
          });
  
          stream.on("close", () => {
            conn.end();
            socket.emit("output", "\r\n*** Session Closed ***\r\n");
          });
        });
      }).on('error', (err) => {
        socket.emit("output", `\r\n*** SSH Error: ${err.message} ***\r\n`);
      }).connect({
        host: router.host,
        // username: router.authType === "acs" ? routerCreds.username : process.env.LOCAL_USER,
        // password: router.authType === "acs" ? routerCreds.password : process.env.LOCAL_PASS,
        username: getCreds(router, routerCreds).username,
        password: getCreds(router, routerCreds).password,
        readyTimeout: 10000,
        algorithms: {
            kex: ["diffie-hellman-group14-sha1", "diffie-hellman-group1-sha1"],
            cipher: ["aes128-cbc", "aes256-cbc", "aes128-ctr", "aes256-ctr"],
            serverHostKey: ["ssh-rsa"]
        }
      });
    });
  
    // Frontend Keystrokes (including Tab, Enter, Arrows) -> Router
    socket.on("TestSocket",(data)=>{
        console.log(data)
        socket.emit('output',`Real time Communication is OK`);
    })
    socket.on("input", (data) => {
      if (shellStream) {
        shellStream.write(data);

        ////////////Getting User Command to save in DB/////////
        // ENTER pressed → command complete
        if (data.includes("\r") || data.includes("\n") ) {
          const cmd = commandBuffer.trim();
          if (cmd.length > 0) {
            sessionCommands.push({
              command: cmd,
              time: new Date()
            });
          }
          commandBuffer = "";
        }
        // Backspace
        else if (data === "\u007f") {
          commandBuffer = commandBuffer.slice(0, -1);
        }
        // Normal characters
        else {
          const clean = stripAnsiAndControls(data);
          commandBuffer += clean;
        }        
        ///////////////////////////////////////
        
      }
    });
  
    // Handle terminal resizing from frontend
    socket.on("resize", (size) => {
      if (shellStream) {
        shellStream.setWindow(size.rows, size.cols, 0, 0);
      }
    });
  
    socket.on("disconnect", async () => {
      console.log("User closed terminal tab");
      if(sessionCommands.length>0){
        await saveSession(sessionUsername, sessionRouter, sessionCommands, sessionStartTime)  
        if (shellStream) shellStream.end();
      }

      conn.end();
    });
  });

///////////////////////
// --- CALCULATION LOGIC ---

function parseDowntime(millisecond){
  const duration = moment.duration(millisecond);
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  return `${hours} hr : ${minutes.toString().padStart(2, '0')} min`;
}

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
      // if (now.isAfter(sixPM)) {
      //     ups[i] = sixPM.format("MMMM Do YYYY, h:mm:ss a");
      //     end = moment(ups[i], "MMMM Do YYYY, h:mm:ss a");
      // } else {
      //     end = now;
      // }
      end = now;
    }
    if (start.isValid() && end.isValid()) {
        const diff = end.diff(start);
        if (diff > 0) {
          totalMs += diff;
          ispData.lastDownTimeMins = ups[i] ? 0 : Math.floor(diff / (1000 * 60));
          ispData.lastDownTime = ups[i] ? "" : parseDowntime(diff) ;
        }
    }
  }

  ispData.totalDownTime = parseDowntime(totalMs);
  ispData.totalDownTimeMins = Math.floor(totalMs / (1000 * 60));

  return ispData;
}

async function isRouterAlive(host) {
  try {

      const res = await ping.promise.probe(host.trim(), { timeout: 2 });
      return res.alive;
  } catch (e) { return false; }
}

function pushConfig(router, commands) {
  return new Promise((resolve) => {
    // console.log(`🔐 Trying to enter ${router.router}`);
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
    //   console.log(`✅ Connection Established: ${router.router}`);
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
      if (router.mikrotik === "yes" || router.authType==='telnet' || router.routerType === "legacy") {

        //////////Only for Tontor bazar //////////
        if(router.host === '192.168.142.1'){
          const cmds = [
              "terminal length 0", 
              `ping ${router.results.isp1.dest} source ${router.results.isp1.source} repeat 2 timeout 1`, 
              `ping ${router.results.isp2.dest} source ${router.results.isp2.source} repeat 2 timeout 1`
          ];
          // pushConfig returns { isp1Status, isp2Status, error }
          fresh = await pushConfig(router, cmds);             
        }
        else{
          const i1 = await isRouterAlive(router.results.isp1.source);
          const i2 = await isRouterAlive(router.results.isp2.source);
          fresh = { isp1Status: i1 ? "UP" : "DOWN", isp2Status: i2 ? "UP" : "DOWN", error: "" };          
        }        
        
      } else {
          const cmds = [
              "terminal length 0", 
              // `ping ${router.results.isp1.dest} source ${router.results.isp1.source} repeat 2 timeout 1`, 
              // `ping ${router.results.isp2.dest} source ${router.results.isp2.source} repeat 2 timeout 1`
              `ping 10.154.5.8 source ${router.results.isp1.source} repeat 2 timeout 1`, 
              `ping 10.154.5.8 source ${router.results.isp2.source} repeat 2 timeout 1`
          ];
          // pushConfig returns { isp1Status, isp2Status, error }
          fresh = await pushConfig(router, cmds);            
      }
  } else {
      fresh.error = "Host Unreachable";
      // console.log(`${router.router} is down`)
  }

  router.results.error = fresh.error || "OK";
  router.results.isp1 = calculateISPStats(router.results.isp1, fresh.isp1Status);
  if(router.results.isp1.source !== router.results.isp2.source){
    router.results.isp2 = calculateISPStats(router.results.isp2, fresh.isp2Status);
  }
  

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

// --- INITIALIZATION & INTERVAL ---
let running = false;
const routers = JSON.parse(fs.readFileSync('routers.json', "utf8")).routers;
let todayFile;
let lastClearedDate = null; // track last cleared date

export function getTodayFile() {
  for (let i = 0; i <= 2; i++) {
    const file = `downtime_folder/${moment().subtract(i, 'days').format('DD-MM-YYYY')}.json`;
    if (fs.existsSync(file)) {
      return file;
    }
  }
  return `downtime_folder/${moment().format('DD-MM-YYYY')}.json`;
}

async function clearMailLogIfNewDay() {
  const mailDay = moment().format('DD-MM-YYYY');  
  if (lastClearedDate !== mailDay) {
    lastClearedDate = mailDay;
    const deleted = await deleteAllMail();
    console.log(`MailLog cleared: ${deleted.deletedCount} records removed`);
  }
}

async function main() {
    running = true;
    console.log('--- Processing Cycle Start ---');    
    // todayFile = `downtime_folder/${moment().format('DD-MM-YYYY')}.json`;
    todayFile = getTodayFile();
    const data = JSON.parse(fs.readFileSync(todayFile, "utf8"));
    
    const updated = await runWithConcurrency(data.routers, 15, processRouter);
    upDownInfo=updated;
    
    fs.writeFileSync(todayFile, JSON.stringify({ routers: updated }, null, 1));
    io.emit('up-down-report');
    console.log(`File Written to ${todayFile}`)   
    console.log('--- Cycle Complete ---');
    console.log('--- Next Cycle Start in 10s ---');
    setTimeout(()=>{
        running = false;
    },10*1000)
    
  }

  function checkAndRun() {

    // todayFile = `downtime_folder/${moment().format('DD-MM-YYYY')}.json`;
    todayFile = getTodayFile();
    const logDate = new Date();    
    if (!fs.existsSync(todayFile)) {
        console.log(`Creating ${todayFile}`);
        const initial = routers.map(rt => ({
            result: {
                logDate,
                branchId: rt.branchId, 
                router: rt.name, 
                branchType: rt.branchType, 
                authType:rt.authType, 
                host: rt.host, 
                routerType: rt.routerType, 
                mikrotik: rt.mikrotik || "no",
                results: {
                    isp1: { name: rt.isp1Name, dest: rt.isp1Dest, source: rt.isp1Source, prevStatus: "UP", status: "UP", downTimes: [], upTimes: [], totalDownTime: "", totalDownTimeMins:0 },
                    isp2: { name: rt.isp2Name, dest: rt.isp2Dest, source: rt.isp2Source, prevStatus: "UP", status: "UP", downTimes: [], upTimes: [], totalDownTime: "", totalDownTimeMins:0 }
                }
            }
        }));        
        fs.writeFileSync(todayFile, JSON.stringify({ routers: initial }, null, 1));
    }
    if(upDownInfo.length<1 && fs.existsSync(todayFile)){
      const {routers} = JSON.parse(fs.readFileSync(todayFile, "utf8"));
      upDownInfo=routers;
    }
    main();
  }

// Start immediately and then every 5 minutes

setInterval(async () => {
    if (running) return;

    const nowTime = moment();
    const schedule = await Schedule.findOne();

    if (!schedule || !schedule.isActive){
      console.log(`schedule active: ${schedule?.isActive}`)
      upDownInfo=[]
      return;
    } 

    const todayStr = nowTime.format('YYYY-MM-DD');
    if (schedule.offDays.includes(todayStr)) {
        console.log(`Holiday: ${nowTime.format('MMMM Do YYYY, h:mm:ss a')}`);
        upDownInfo=[]
        return;
    }

    const workingDays = schedule.workingDays;
    
    if (!workingDays.includes(nowTime.day())) {
        console.log(`Off day: ${nowTime.format('MMMM Do YYYY, h:mm:ss a')}`);
        upDownInfo=[]
        return;
    }

    const startTime = moment().hour(schedule.startHour).minute(0).second(0);
    const endTime   = moment().hour(schedule.endHour).minute(5).second(0);

    if (nowTime.isAfter(startTime) && nowTime.isBefore(endTime)) {
        checkAndRun();
    } else {
        upDownInfo=[]
        console.log(nowTime.format('MMMM Do YYYY, h:mm:ss a'));
    }

}, 1000);
 
///////////////////////////
app.get('/upDownInfo', (req,res)=>{
  const systemUptimeDuration = moment.duration(process.uptime() * 1000);

  res.send({
    message:upDownInfo.length,
    infos:upDownInfo,
    systemUptimeDuration
  });
})

app.get('/allRouters', (req, res)=>{
  res.send({
    routers
  });
})

app.post('/login', loginController);
app.get('/logout', logout);
app.get('/checkSession/:token', checkSession);
app.post('/pushConfig', authMiddleware, pushConfig2);
app.get('/backups', backups);
app.post('/addRouter', authMiddleware, addRouter);
app.get('/generateReport2', generateReport2);
app.get('/getRouterSessions', authMiddleware, getRouterSessions);
app.post('/addDownTime', authMiddleware, addDownTime);

//////////////Save Loacl uploaded Files ////
app.get("/getLocalFiles", getLocalFiles);
app.post("/uploadLocal", uploadLocal);
app.post("/uploadPic", uploadPic);

app.get('/ipscan/:network/:subnetMask/:secretCode', ipscan);

///////////// Get Downtime Files and save Downtime ////
app.get('/getDowntimeFiles', getDowntimeFiles);
app.post('/saveToDb', saveToDb);

//////////////SNMP ////
app.get('/snmpStatus/:host',snmpStatus);

//////////////Send Mail ////////
app.post("/sendMail", authMiddleware, sendMail);
app.get('/getSentMails', getSentMails);
app.delete('/deleteSentMail/:branchId', deleteSentMail);

/////////////// Administration Routes ///////////
app.use('/administration', administrationRoutes);
app.use('/schedule', scheduleRoutes);

app.get('/getPhoneList', (req, res)=>{  
  const { phones }= JSON.parse(fs.readFileSync(`downtime_folder/phones.json`,'utf8'));
  res.json({success:true, phones});
})

app.get('/getBranchContacts', (req, res)=>{  
  const { branchContact }= JSON.parse(fs.readFileSync(`branch_contacts.json`,'utf8'));
  res.json({success:true, branchContact});
})

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

