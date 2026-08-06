import { useEffect, useRef, useState } from "react";
import { Card, Button, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import axios from "axios";

export default function UploadFileCompo({options, setFileUploadDone, sourceUrl}){

    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    const fileInputRef = useRef(null);
    const [files, setFiles]=useState([]);
    const [loading, setLoading]=useState(false);
    const [progress, setProgress] = useState(0);
    const [totalFileSize, setTotalFileSize] = useState(0);
    const sessionToken= localStorage.getItem('sessionToken')

      const getTotalFileSize = (fileList) => {
        if (!fileList || !fileList.length) {
          setTotalFileSize(0);
          return;
        }      
        const totalSizeBytes = Array.from(fileList).reduce(
          (acc, file) => acc + file.size,
          0
        );      
        const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
        setTotalFileSize(totalSizeMB);
      };    

    const serverUpload = async (uploadDestination) => {
      if(files.length<1){
      alert('Please Select File')
      return;
      }
      setLoading(true);
      setProgress(0);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      if(sessionToken){
        formData.append("sessionToken", sessionToken);
      }
      if(sourceUrl){
        formData.append("sourceUrl", sourceUrl);
      }
      try {
          const res = await axios.post(`${BASE_API}/${uploadDestination}`,formData,{
              onUploadProgress:(event)=>{
              if (event.lengthComputable) {
                  const percent = Math.round((event.loaded / event.total) * 100);
                  setProgress(percent);
              }
              }
          })
         alert(res.data.message);
    
      } catch (err) {
        console.error(err);
        alert(err);
      } finally {
        setLoading(false);
        setFiles([]);
        setProgress(0);
        setTotalFileSize(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setFileUploadDone(true);
      }
    };   
    return(
        <>
        {
          sessionToken &&
          <Card className="w-[400px]">
            <div>
              <input type="file" {...options}
                      onChange={(e) => {
                        const selectedFiles = e.target.files;
                        setFiles(selectedFiles);
                        getTotalFileSize(selectedFiles);
                      }}
                    ref={fileInputRef} disabled={loading}/>
              <p>Total Selected Size:{totalFileSize} MB</p>
              {loading && 
                  <div>
                      <progress value={progress} max="100" />        
                  </div>
                  
              } 
              <div className="flex gap-2 p-2">            
                <Button color='light' onClick={()=>serverUpload('uploadLocal')} disabled={loading}>Upload File</Button>              
              </div> 
            </div>
          </Card >            
        }
 
        </>
    )
}