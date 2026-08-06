import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import moment from 'moment';

async function deleteFull() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const deletedFolderLoc = path.join(__dirname, 'Test Folder');
  console.log('deletedFolderLoc:', deletedFolderLoc);

  try {
    const entries = await fs.readdir(deletedFolderLoc, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(deletedFolderLoc, entry.name);
      if (entry.isDirectory()) {
        await fs.rm(fullPath, { recursive: true, force: true });
      } else {
        await fs.unlink(fullPath);
      }
    }
    console.log('Folder emptied successfully');
  } catch (err) {
    console.error(err.message);
  }
}

setInterval(()=>{
    const now= moment();
    const parsedNow= now.format('MMMM Do YYYY, h:mm:ss a')
    console.log(parsedNow)
    const sixPM = moment().hour(18).minute(0).second(0);
    const isAfter6= now.isAfter(sixPM);
    const thursday=now.day() === 4;
    if(thursday && isAfter6){
        deleteFull();
    }
}, 1*1000)

