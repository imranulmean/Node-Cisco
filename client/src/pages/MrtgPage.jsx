import { Card } from "flowbite-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BandwidthChart from "../components/BandwidthChart";
import HeaderPublic from "../components/HeaderPublic";
import moment from 'moment';
import { FaRegClock, FaPercentage, FaSimCard, FaAtom } from "react-icons/fa";


const buildChartData = (iface) => {
    const result = [];
  
    iface.inMb.forEach((item, index) => {
      result.push({
        time: item.time, // already formatted from backend
        in: item.bw,
        out: iface.outMb[index]?.bw || 0
      });
    });
  
    return result;
  };

export default function MrtgPage(){

    const [data, setData] = useState({});
    const [health, setHealth] = useState({});
    const [memoryPool, setMemoryPool] = useState({});
    const [deviceSerial, setDeviceSerial] = useState({});
    
    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    const {router, host} = useParams();
    useEffect(() => {
        getSnmp();
        const fetchInterval = setInterval(() => {
            getSnmp();
          }, 30*1000);  
          return () => {
            clearInterval(fetchInterval);
          };                 
    }, []);       
  
    const getSnmp=()=>{
        fetch(`${BASE_API}/snmpStatus/${host}`)
        .then((res) => res.json())
        .then((res) => {
          console.log(res)
          setHealth(res.health || {}); 
          setMemoryPool(res.memoryPool || {})
          setDeviceSerial(res.deviceSerial || {})
          setData(res.data);                   
        });
    }
    
    const parsedTime=(uptimeParam)=>{
        let uptimeDuration = moment.duration(uptimeParam * 10);
        let day = Math.floor(uptimeDuration.asDays());
        let upTimeHrs  = uptimeDuration.hours();
        let upTimeMins = uptimeDuration.minutes();
        return (`${day} d ${upTimeHrs} hr : ${upTimeMins.toString().padStart(2, '0')} min`);
    }

    return (
        <>
        <HeaderPublic/>       
        <div className="p-4">
            <div className="flex flex-col gap-1 mb-4  border border-green-900 rounded-lg">
                <h2 className="text-center p-4"><b>{router}: {host}</b></h2>
                <div className="w-full flex justify-center gap-2 p-4">
                    <div className="w-1/4 bg-green-900 text-gray-200 p-4 border rounded-lg flex flex-col items-center justify-center">
                        <FaRegClock size="1.3rem"/>
                        <p className="mt-2">Uptime</p>
                        <p>{parsedTime(health?.uptime)}</p>
                    </div>
                    <div className="w-1/4 bg-green-900 text-gray-200 p-4 border rounded-lg flex flex-col items-center justify-center">
                        <FaAtom size="1.3rem"/>
                        <p className="mt-2">Device</p>
                        <p>Model: {deviceSerial?.model}</p>
                        <p>serial_number: {deviceSerial?.serial_number}</p>
                    </div>                    
                    <div className="w-1/4 bg-green-900 text-gray-200 p-4 border rounded-lg flex flex-col items-center  justify-center">
                        <FaPercentage size="1.3rem"/>
                        <p className="mt-2">CPU 1 Min: {health?.cpu_1min} %</p>
                        <p>CPU 5 Min: {health?.cpu_5min} %</p>      
                    </div>
                    <div className="w-1/4 bg-green-900 text-gray-200 p-4 border rounded-lg flex flex-col items-center  justify-center">
                        <FaSimCard size="1.3rem"/>
                        <p className="mt-2">Memory Pool</p>
                        <p>Free: {(memoryPool?.pool_free / 1024 / 1024).toFixed(2)} MB</p>
                        <p>Used: {(memoryPool?.pool_used / 1024 / 1024).toFixed(2)} MB</p>
                    </div>            
                </div>
                <h2 className="text-center p-4">Description: {health?.sysDescr}</h2>
            </div>

            <div className="flex justify-center">            
                <div className="flex flex-wrap gap-2 justify-center">
                    {Object.keys(data).map((iface) => (
                    <div className="w-[400px] flex flex-col border border-gray-500 mb-2 p-2 rounded-lg">
                        <BandwidthChart
                            key={iface}
                            title={`${iface} (${data[iface].alias})`}
                            data={buildChartData(data[iface])}
                        />
                    </div>    

                    ))}
                </div>
            </div>  
        </div>
      
        </>
    );
}