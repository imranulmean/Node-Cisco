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
    const [duplicateQueryString, setDuplicateQueryString]= useState("");  
    const macMap = new Map();
    const duplicateMac=[];
    const [duplicateMacState, setDuplicateMacState]= useState([]);
  
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
    

    const duplicatefilterList = duplicateMacState.length > 0 ? duplicateMacState.filter(group => {
        if (duplicateQueryString === "") return true;
        
        const query = duplicateQueryString.toLowerCase();
        
        // 1. Check if the group's MAC address matches the query
        if (group.mac && group.mac.toLowerCase().includes(query)) {
            return true;
        }
        
        // 2. Check if any record inside the 'records' array matches the query
        const matchFound = group.records.some(r => 
            (r.nameString && r.nameString.toLowerCase().includes(query)) ||
            (r.hostString && r.hostString.toLowerCase().includes(query)) ||
            (r.hwString && r.hwString.toLowerCase().includes(query)) ||
            (r.ipString && r.ipString.toLowerCase().includes(query))
        );
        
        return matchFound;
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
            data.mappedData.forEach(item => {
                const rawMac = item.hwString?.trim().toLowerCase();
                if (!rawMac) return;
                
                // Remove a leading '#' if it exists so both formats match
                const mac = rawMac.replace(/^#/, '');
                
                if (!macMap.has(mac)) {
                    macMap.set(mac, []);
                }
                macMap.get(mac).push(item);
            });

            macMap.forEach((items, mac) => {
                if (items.length > 1) {
                    duplicateMac.push({
                        mac: mac,
                        records: items 
                    });
                }
            });   
            setDuplicateMacState(duplicateMac)
            
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
            <div className="flex gap-4 px-2 py-6 justify-center items-center">
                <div className="w-full flex flex-col justify-center items-center gap-2">
                    <div className="w-full flex gap-2 justify-center items-center">

                        <input type="text" value={queryString.trim()} placeholder="Search anything" onChange={(e)=>{setQueryString(e.target.value.trim());}}
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
                    <div className="flex gap-2">
                        <p className="block text-center text-gray-700">Showing ip:{filterList.length} </p>
                        <p className="text-center font-bold text-gray-700">To Check Unused IP type #host</p>                        
                    </div>

                    <div className="w-full flex flex-wrap gap-2 justify-center">
                        <div className="w-full h-[450px] overflow-y-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-body">
                                <thead className="sticky top-0 bg-gray-900">
                                    <tr className="border border-gray-400">
                                    <th className="p-1 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">SL</th>
                                        <th className="p-1 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">Name</th>
                                        <th className="p-1 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">Host</th>
                                        <th className="p-1 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">HW</th>
                                        <th className="p-1 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">IP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {filterList.map((scan, index) => (
                                    <tr className="bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium">
                                        <td className="p-2 text-center border border-gray-400">{index+1}</td>
                                        <td className="p-2 text-center border border-gray-400">{scan.nameString.trim()}</td>
                                        <td className="p-2 text-center border border-gray-400">
                                            {
                                                scan.hostString.includes('#') ? 
                                                <span className="text-red-800 font-bold">Disabled:{scan.hostString.trim()}</span> 
                                                : 
                                                <span>{scan.hostString.trim()}</span>                                            
                                            }
                                        </td>
                                        <td className="p-2 text-center border border-gray-400">{scan.hwString.trim()}</td>
                                        <td className="p-2 text-center border border-gray-400">{scan.ipString.trim().replace(/undefined|fixed-address|;/g, '')}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>                             
                        </div>
                    </div>
                </div>

                {/* /////////Duplicate Macs /////         */}
                {
                    duplicateMacState.length>0 &&
                    <div className="w-full flex flex-col justify-center items-center gap-2">
                        <input type="text" value={duplicateQueryString.trim()} placeholder="Search anything" onChange={(e)=>{setDuplicateQueryString(e.target.value.trim());}}
                            class="max-w-md w-full px-3 py-2 bg-white-200 border border-gray-400 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 outline:none" 
                        />
                        <h1 className="text-lg text-gray-900">Find Duplicate Mac</h1>
                        <div className="w-full flex flex-wrap gap-2 justify-center">
                            <div className="w-full h-[450px] overflow-y-auto">
                                <table className="w-full text-sm text-left rtl:text-right text-body">
                                    <thead className="sticky top-0 bg-gray-900">
                                        <tr className="border border-gray-400">
                                        <th className="p-1 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">SL</th>
                                            <th className="p-1 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">mac</th>
                                            <th className="p-1 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">Name</th>
                                            <th className="p-1 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">Host</th>
                                            <th className="p-1 font-medium text-center bg-gray-900 text-gray-200 border border-r border-gray-400">IP</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {duplicatefilterList.map((mac, index2) => (
                                        <tr className="bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium">
                                            <td className="p-2 text-center border border-gray-400">{index2+1}</td>
                                            <td className="p-2 text-center border border-gray-400">{mac.mac.trim()}</td>
                                            <td className="p-2 text-center border border-gray-400">
                                            {
                                                mac.records.map((record,index2)=>(
                                                    <>
                                                        {record.nameString}<br/>
                                                    </>
                                                ))
                                            }                                            
                                                            
                                            </td>
                                            <td className="p-2 text-center border border-gray-400">
                                            {
                                                mac.records.map((record,index2)=>(
                                                    <>
                                                        {
                                                            record.hostString.includes('#') ?
                                                                <span className="text-red-800 font-bold">{record.hostString} </span>   
                                                            :
                                                            <span> {record.hostString} </span>      
                                                        }
                                                        <br/>
                                                    </>
                                                ))
                                            }                                            
                                                            
                                            </td> 
                                            <td className="p-2 text-center border border-gray-400">
                                            {
                                                mac.records.map((record,index2)=>(
                                                    <>
                                                        {record.ipString.trim().replace(/undefined|fixed-address|;/g, '')}<br/>
                                                    </>
                                                ))
                                            }                                            
                                                            
                                            </td>                                                                                
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>                             
                            </div>
                        </div>
                    </div>                 
                }
            </div>

        </>

    )    

}