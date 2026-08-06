import ping from "ping";
import { Client } from "ssh2";
import fs from 'fs/promises';
import path from 'path';
import { saveSession } from "./saveDb.controller.js";

async function isRouterAlive(host) {
    try {
        const res = await ping.promise.probe(host, { timeout: 2 });
        return res.alive;
    } catch (e) { return false; }
  }
 
function pushConfig(router, commands, mode, routerCreds) {
  return new Promise((resolve) => {
    const conn = new Client();
    const resData = { error: "", output: "" };

    const watchdog = setTimeout(() => {
      resData.error = "Router did not respond";
      conn.end();
      resolve(resData);
    }, 15 * 1000);

    conn.on("ready", () => {
      conn.shell({ term: "vt100" }, (err, stream) => {
        if (err) {
          clearTimeout(watchdog);
          resData.error = err.message;
          conn.end();
          return resolve(resData);
        }

        let index = 0;
        let waiting = false;
        let buffer = "";

        const sendNext = () => {
          if (index >= commands.length) {
            // if(mode ==='push'){
            //   stream.write("end\n");
            // }              
            stream.write("exit\n");
            return;
          }
          waiting = true;
          const cmd = commands[index];
          stream.write(cmd + "\n");
        };

        stream.on("data", (data) => {
          const text = data.toString();
          buffer += text;
          resData.output += text;
          // process.stdout.write(text);

          // Prompt detected
          if (text.includes("% Authorization failed")) {
            resData.error = "AUTHORIZATION_FAILED";
            stream.end();
          }
          // ❌ INVALID INPUT DETECTION
          if (text.includes("% Invalid input detected ")) {
            // Store the error so it shows up in your React Textarea/Frontend
            resData.error = `Invalid Command: ${commands[index]}`;
            stream.end();
            return;
          }            

          if (waiting && /\r?\n.*[#>]\s*$/.test(buffer)) {
            waiting = false;
            buffer = "";
            index++;
            setTimeout(sendNext, 300);
          }
        });

        stream.on("close", () => {          
          clearTimeout(watchdog);
          conn.end();
          console.log("Connection Closed")
          resolve(resData);
        });

        // Wait for initial prompt before first command
        setTimeout(sendNext, 800);
      });
    });

    conn.on("error", (err) => {
      clearTimeout(watchdog);
      resData.error = err.message;
      resolve(resData);
    });

    conn.connect({
      host: router.host,
      username: router.authType === "acs" ? routerCreds.username : process.env.LOCAL_USER,
      password: router.authType === "acs" ? routerCreds.password : process.env.LOCAL_PASS,
        readyTimeout: 10000,
        algorithms: {
            kex: ["diffie-hellman-group14-sha1", "diffie-hellman-group1-sha1"],
            cipher: ["aes128-cbc", "aes256-cbc", "aes128-ctr", "aes256-ctr"],
            serverHostKey: ["ssh-rsa"]
        }
    });
  });
}
 
export const backups= async (req, res) =>{
  const backupFolder='client/public/backups';
  const backupLinks=[];
  try {
    const entries = await fs.readdir(backupFolder, { withFileTypes: true });
    for (const entry of entries) {
      backupLinks.push(`/backups/${entry.name}`);
    }
    res.send({message:"success", backupLinks});
  } catch (err) {
    console.error(err.message);
  }  
}

export const pushConfig2 =  async(req, res)=>{
    let routerRes={};
    const {routerData, parsedCommands, mode} = req.body;
    /////////////////// Session Data ///////////
    const sessionUsername= req.routerCreds.username;
    const sessionRouter= routerData;
    let sessionCommands= parsedCommands.map((p)=>{
      return {
        command:p,
        time: new Date()
      }
    })
    const sessionStartTime= new Date();
    /////////////////// Session Data ///////////

    const routerAlive=await isRouterAlive(routerData.host)
    if(!routerAlive) {
      routerRes.output="Router Not reachable",
      routerRes.error="Router Not reachable"
      return res.status(400).send({success:false, routerRes})
    }
      
    routerRes = await pushConfig(routerData, parsedCommands, mode, req.routerCreds)

    // ✅ BACKUP MODE
    if (mode === "backup" && routerRes.output) {
      try {
        // const backupFolder = path.join(process.cwd(), "client", "public");
        const backupFolder='client/public/backups';
        const fileName = `${routerData.branchId}-${routerData.router}-${routerData.host}.txt`;
        const filePath = path.join(backupFolder, fileName);
        await fs.writeFile(filePath, routerRes.output, "utf8");
      } catch (err) {
        console.error("Backup failed:", err.message);
      }
    }
    // await saveSession(sessionUsername, sessionRouter, sessionCommands, sessionStartTime)  
    res.send({message:"success", routerAlive, routerRes});
} 