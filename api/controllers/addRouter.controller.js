import fs from "fs";
import { getTodayFile } from "../index_socket.js";

export const addRouter= async(req, res) =>{
    
    const dataToSave = {
    ...req.body,
    addedBy:req.routerCreds.username,
    branchId: Number(req.body.branchId)
    };
    try {
      const routers = JSON.parse(fs.readFileSync('routers.json', "utf8")).routers;
      const exists = routers.some(r => r.branchId === dataToSave.branchId);
      if (exists) {
        return res.send({ success: false, message: "Branch is already there" });
      }
      routers.push(dataToSave)
      fs.writeFileSync(`routers.json`, JSON.stringify({ routers: routers }, null, 1));

      //////////////////////
      let todayFile = getTodayFile();      
      if (fs.existsSync(todayFile)) {
        const todayRouters = JSON.parse(fs.readFileSync(todayFile, "utf8"));
        const logDate=todayRouters.routers[0].result.logDate;
        const result= {
          logDate,
          branchId: dataToSave.branchId, 
          router: dataToSave.name, 
          branchType: dataToSave.branchType, 
          authType:dataToSave.authType, 
          host: dataToSave.host, 
          routerType: dataToSave.routerType, 
          mikrotik: dataToSave.mikrotik || "no",
          results: {
              isp1: { name: dataToSave.isp1Name, dest: dataToSave.isp1Dest, source: dataToSave.isp1Source, prevStatus: "UP", status: "UP", downTimes: [], upTimes: [], totalDownTime: "", totalDownTimeMins:0 },
              isp2: { name: dataToSave.isp2Name, dest: dataToSave.isp2Dest, source: dataToSave.isp2Source, prevStatus: "UP", status: "UP", downTimes: [], upTimes: [], totalDownTime: "", totalDownTimeMins:0 }
          }
        }
        todayRouters.routers.push({result});
        fs.writeFileSync(todayFile, JSON.stringify({ routers: todayRouters.routers }, null, 1));
      }      
      /////////////////////

      res.status(200).send({success:true, message: "Branch Added"})      
    } catch (error) {
      res.status(200).send({success:true, message: error})      
    }

}