import { useEffect, useRef, useState } from "react";
import { Card, Textarea, Label, TextInput, Button, Timeline, Modal, ModalBody, ModalFooter, ModalHeader, Tabs  } from "flowbite-react";
import { Link, useLocation, useNavigate } from 'react-router-dom';


export default function IpScan(){

    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    const subnets=['255.255.255.0', '255.255.255.192']
    const [network, setNetwork]= useState('');
    const [subnet, setSubnet]= useState(subnets[0]);
    const [secret, setSecret] = useState('');
    const [loading, setLoading]= useState(false);
    const [scanData, setScanData] = useState([]);
  
    const [queryString, setQueryString]= useState("");  

    const filterList= scanData.length > 0 ? scanData.filter(r=>{
        if(queryString==="" ) return true;
        if( r.ip.includes(queryString) ) return r
    }) : []; 
    
    const getData = async(e)=>{
        e.preventDefault();
        try {
            setLoading(true);
            const res = await fetch(`${BASE_API}/ipscan/${network}/${subnet}/${secret}`);
            const data= await res.json();
            if(!data.success){
                alert(data.message);
                return;
            }
            setScanData(data.liveHosts)
        } catch (error) {
            alert(error);
        }finally{
            setLoading(false);
            setSubnet([subnets[0]]);
            setSecret('')
        }

    }
 


    return(
        <div className="w-full p-4 flex flex-col justify-center items-center">
            <form onSubmit={getData} className="flex gap-2">
                <input type="text" value={network} placeholder="Network:192.168.0.0" 
                        required onChange={(e)=>{setNetwork(e.target.value);}}
                        class="w-full px-3 py-2 bg-white-200 border border-gray-400 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 outline:none" 
                />
                <select onChange={(e)=>{ setSubnet(e.target.value)}}
                        class="block w-full px-3 py-2.5 bg-white-200 border border-gray-400 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 outline:none"> 
                    {
                        subnets.map((value)=>{
                            return(
                                <>
                                    <option key={value} value={value}>{value}</option>
                                </>
                            )
                        })
                    }

                </select>                
                {/* <input type="text" value={subnet} placeholder="Subnet:255.255.255.0" onChange={(e)=>{setSubnet(e.target.value);}}
                        required
                        class="w-full px-3 py-2 bg-white-200 border border-gray-400 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 outline:none" 
                /> */}
                <input type="password" value={secret} placeholder="Enter Secret" onChange={(e)=>{setSecret(e.target.value);}}
                        required
                        class="w-full px-3 py-2 bg-white-200 border border-gray-400 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 outline:none" 
                />
                {
                    !loading ? 
                    <button disabled={loading} type="submit" className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-gray-900 px-4 py-2 text-center text-sm font-medium text-gray-100 hover:bg-cyan-900">Submit</button>
                    : <p>Scanning Data</p>    
                }
                
            </form>
            <div>
                <div className="flex gap-2 justify-center items-center mt-4">
                    <p className="text-center">Showing ip: {filterList.length}</p>
                    <input type="text" value={queryString} placeholder="Search IP" onChange={(e)=>{setQueryString(e.target.value);}}
                        class="px-3 py-2 bg-white-200 border border-gray-400 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 outline:none" 
                    />
                </div>
 
                <div className="flex flex-wrap gap-2 justify-center p-4 mt-4 border border-gray-400 rounded-lg">
                {
                    filterList.length>0 && filterList.map((scan)=>{
                        return(
                            <>
                                <div className="p-2 rounded-lg text-gray-900 border border-gray-400 rounded-lg">
                                    {scan.ip}
                                </div>
                            </>
                        )
                    })
                    
                }                    
                </div>
            </div>
        </div>
    )    

}