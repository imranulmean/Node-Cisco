import { useEffect, useRef, useState } from "react";
import { Card, Textarea, Label, TextInput, Button, Timeline, Modal, ModalBody, ModalFooter, ModalHeader, Tabs  } from "flowbite-react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import HeaderPublic from "../components/HeaderPublic";


export default function DhcpIpScan(){

    const [sessionToken, setSessionToken]= useState(localStorage.getItem('sessionToken'));
    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    const [loading, setLoading]= useState(false);
    const [scanData, setScanData] = useState([]);
    const [queryString, setQueryString]= useState("");  
  
    useEffect(()=>{
        getData();
    },[])

    const filterList= scanData.length > 0 ? scanData.filter(r=>{
        if(queryString==="" ) return true;
        if( 
            r.nameString.toLowerCase().includes(queryString.toLowerCase()) ||
            r.hostString.toLowerCase().includes(queryString.toLowerCase()) ||
            r.hwString.toLowerCase().includes(queryString.toLowerCase()) ||
            r.ipString.toLowerCase().includes(queryString.toLowerCase()) 
            ) return r
    }) : []; 
    
    const getData = async()=>{
        try {
            setLoading(true);
            const res = await fetch(`${BASE_API}/dhcpIpScan`);
            const data= await res.json();
            if(!data.success){
                alert(data.message);
                return;
            }
            setScanData(data.mappedData)
        } catch (error) {
            alert(error);
        }finally{
            setLoading(false);
        }

    }
 
 const downloadDhcpConfig= async()=>{
    setLoading(true);
    try{
        const res = await fetch(`${BASE_API}/downloadDhcpConfig`, {
            method: "GET",
            headers: { 
                "Content-Type": "application/json",
                "authorization": sessionToken
             }
        });
        const data = await res.json();
        alert(data.message);
        console.log(data);
        if(data.message==='Invalid token' || data.message==='No token'){            
            localStorage.removeItem('sessionToken')
            setSessionToken('')
        }        
        
        await getData();
    }catch(err){
        alert(err.message);        
    }finally{
        setLoading(false);
    }
 }

    return(
        <>
            <HeaderPublic/>
            <div className="w-full p-4 flex flex-col justify-center items-center">
                <div className="w-full flex gap-2 justify-center items-center mt-4">
                    <p className="text-center text-gray-700">Showing ip: {filterList.length}</p>
                    <input type="text" value={queryString} placeholder="Search anything" onChange={(e)=>{setQueryString(e.target.value);}}
                        class="max-w-md w-full px-3 py-2 bg-white-200 border border-gray-400 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 outline:none" 
                    />
                    {
                        sessionToken &&
                        <button onClick={downloadDhcpConfig} disabled={loading}
                                className="p-2 border bg-cyan-900 text-md text-white  rounded-lg">
                                    {loading ? 'loading...' : 'If Data Not updated Click Here'}
                        </button>                         
                    }
                   
                </div>
                <p className="text-center font-bold text-gray-700">To Check Unused IP type #host</p>
                <div className="w-full flex flex-wrap gap-2 justify-center p-4 mt-4">
                    <div className="w-full h-[450px] overflow-y-auto">
                        <table className="w-full text-sm text-left rtl:text-right text-body">
                            <thead className="sticky top-0 bg-gray-900">
                                <tr className="border border-gray-400">
                                    <th className="p-1 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">Name</th>
                                    <th className="p-1 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">Host</th>
                                    <th className="p-1 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">HW</th>
                                    <th className="p-1 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">IP</th>
                                </tr>
                            </thead>
                            <tbody>
                            {filterList.map(scan => (
                                <tr className="bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium">
                                    <td className="p-2 text-center border border-gray-400">{scan.nameString}</td>
                                    <td className="p-2 text-center border border-gray-400">{scan.hostString}</td>
                                    <td className="p-2 text-center border border-gray-400">{scan.hwString}</td>
                                    <td className="p-2 text-center border border-gray-400">{scan.ipString}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>                             
                    </div>
                </div>
            </div>        
        </>

    )    

}