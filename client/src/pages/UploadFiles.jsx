import { useEffect, useRef, useState } from "react";
import { Card, Button, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import axios from "axios";
import HeaderPublic from "../components/HeaderPublic";
import UploadFileCompo from "../components/UploadFileCompo";

export default function UploadFiles(){

    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    const [localFiles, setLocalFiles]=useState([]);

    const fileUploadOptions = {
      multiple: false,
      accept: "*"
    };
    const [fileUploadDone, setFileUploadDone]= useState(false);
  
    useEffect(()=>{
      getFiles();
    },[fileUploadDone])
  
    
    const getFiles = async() =>{
      const res= await fetch(`${BASE_API}/getLocalFiles`);
      const data=await res.json();        
      setLocalFiles(data.localFiles);    
    }

    return(
        <>
          <HeaderPublic/>
          <div className="p-4 flex gap-4 justify-center">
            <UploadFileCompo options={fileUploadOptions} setFileUploadDone={setFileUploadDone} />  
            {
              localFiles.length<1 ? 
              (
                <p>No files</p>
              ):(
                <Card >
                <div className="flow-root">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {
                      localFiles.map(d=>{ 
                          return(
                              <li className="pb-0 pt-3 sm:pt-4">
                                <div className="flex items-center space-x-4">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      <a href={d.url} target="_blank">{d.filleName}</a>
                                    </p>
                                  </div>
                                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                    {d.sizeMB} MB
                                  </div>
                                </div>
                              </li>
                          )                                            
                      })
                    }            
  
                  </ul>
                </div>
              </Card>                
              )
            }            
            {/* //////////////////////// */}
          </div>    
        </>
    )
}