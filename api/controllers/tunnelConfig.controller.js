import fs from "fs";

const inputFile = "public/localFolder/subBranchTunnels.json";
export const getTunnelConfig = async(req, res)=>{
    try {        
        const tunnels = JSON.parse(fs.readFileSync(inputFile, "utf8")).subBranchTunnels;
        res.json({success:true, tunnels});

    } catch (error) {
        res.json({success: false, message:error.message});
    }    
} 

let saveQueue = Promise.resolve();

export const saveTunnelConfig = async(req, res)=>{
    try {        
        //////////////////////
        saveQueue = saveQueue.then(async () => {
            const newConfig = req.body;
        
            if ( newConfig?.SL === undefined || newConfig?.SL === null || String(newConfig.SL).trim() === ""){
              return res.status(400).json({
                success: false,
                message: "SL is required.",
              });
            }
        
            const fileContent = fs.readFileSync(inputFile, "utf8");
            const data = JSON.parse(fileContent);
        
            const index = data.subBranchTunnels.findIndex(
              (item) => String(item.SL) === String(newConfig.SL)
            );
        
            let action;
        
            if (index !== -1) {
              // Existing SL: update that record.
              data.subBranchTunnels[index] = {
                ...data.subBranchTunnels[index],
                ...newConfig,
                addedBy: newConfig.addedBy,
              };
        
              action = "updated";
            } else {
              // New SL: add a new record.
              data.subBranchTunnels.push({
                ...newConfig,
                addedBy: newConfig.addedBy,
              });
              action = "added";
            }
        
            fs.writeFileSync(inputFile, JSON.stringify(data, null, 2),"utf8");
        
            return res.json({
              success: true,
              action,
              message: `Configuration ${action} successfully.`,
              tunnels: data.subBranchTunnels,
            });
          });
        
          try {
            await saveQueue;
          } catch (error) {
            console.error("Error saving tunnel config:", error);
        
            res.status(500).json({
              success: false,
              message: "Failed to save configuration.",
            });
          }        

    } catch (error) {
        res.json({success: false, message:error.message});
    }    
} 