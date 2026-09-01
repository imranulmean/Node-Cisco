import multer from 'multer'
import fs from 'fs/promises';
import path from "path";
import { getSession } from './login.controller.js';
import { addDownTime } from './saveDb.controller.js';
import moment from 'moment';

const localFolder='public/localFolder';

const storageLocal = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, localFolder);
    },
    filename: (req, file, cb) => {
        // cb(null, ${new Date().getTime()}-${file.originalname});
        // const savedFile=`${new Date().getTime()}-${file.originalname}`;
        const savedFile=`${file.originalname}`;
        cb(null, savedFile);
    },
});


const uploadLocalMul = multer({ storage:storageLocal });  

export const uploadLocal = async(req, res)=>{    
    uploadLocalMul.array("files")(req, res, async (err) => {
        try {
            if (err) {
                console.error("Multer Error:", err);
                return res.status(500).json({ error: err.message });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: "No files uploaded" });
            }

            if(req.body.sourceUrl && req.body.sourceUrl==='addDowntime'){
                if(!req.body.sessionToken){
                    await fs.unlink(req.files[0].path);
                    return res.json({ success: true, message: "No Session Found", docs:[] });
                }
                const sessionData= getSession(req.body.sessionToken);
                const {success, message, docs}= await addDownTime(req.files[0].path, sessionData);
                res.json({success, message, docs});                
            }
            else{
                res.json({ success: true, message:"Files Uploaded Success"});
            }
            
        } catch (error) {
            res.status(500).json({ success: false, message: "Error saving data" });
        }
    });
}
export const getLocalFiles= async (req, res) =>{
    const localFilesFolder=localFolder;
    const localFiles=[];
    try {
      const entries = await fs.readdir(localFilesFolder, { withFileTypes: true });
      for (const entry of entries) {
        const filePath = path.join(localFilesFolder, entry.name);
        const stats = await fs.stat(filePath);
        localFiles.push({
            filleName:entry.name,
            url: `/localFolder/${entry.name}`,
            sizeBytes: stats.size,
            sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
          });        
      }
      res.send({message:"success", localFiles});
    } catch (err) {
      console.error(err.message);
    }  
}

export const getDowntimeFiles= async (req, res) =>{
    const downtimeFolder='downtime_folder';
    const downtimeFiles=[];
    try {
      const entries = await fs.readdir(downtimeFolder, { withFileTypes: true });
      const sorted= entries.sort((a,b)=>{
        const dateA= moment(a.name, 'DD-MM-YYYY.json');
        const dateB= moment(b.name, 'DD-MM-YYYY.json');
        return dateA - dateB;
      })
      const filteredEntry= sorted.slice(0, sorted.length - 1)
      for (const entry of filteredEntry) {
        const filePath = path.join(downtimeFolder, entry.name);
        const stats = await fs.stat(filePath);
        const filleName = entry.name
        downtimeFiles.push({
            filleName:filleName.split('.')[0],
            sizeBytes: stats.size,
            sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
          });        
      }
      res.send({message:"success", downtimeFiles});
    } catch (err) {
      console.error(err.message);
    }  
}
