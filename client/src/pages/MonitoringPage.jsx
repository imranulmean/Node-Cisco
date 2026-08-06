import Header from "../components/Header";
import { useState, useEffect, useRef } from "react";
import MonitoringCompo from "../components/MonitoringCompo";
import HeaderPublic from "../components/HeaderPublic";
import moment from "moment";
import { io } from 'socket.io-client';


export default function MonitoringPage(){

    let sessionToken= localStorage.getItem('sessionToken')
    const [routerTableData, setRouterTableData] = useState([]);
    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    const [secondsLeft, setSecondsLeft] = useState(60);
    const [loading, setLoading]=useState(false);    
    const [serverUptime, setServerUptime]= useState('');

    const socketRef = useRef(null);
  
  
    useEffect(()=>{

      getData();
      socketRef.current = io(BASE_API);
      socketRef.current.on("up-down-report", (data) => {
        setSecondsLeft(60)
        getData();
    });       
      // const fetchInterval = setInterval(() => {
      //   getData();
      //   setSecondsLeft(60); 
      // }, 60 * 1000);
  
      const timerInterval = setInterval(() => {
        setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
  
      return () => {
        // clearInterval(fetchInterval);
        clearInterval(timerInterval);
      };    
    },[])
  
    function convertDownTimeToNumber(str) {
      if (!str) return 0;
    
      const match = str.match(/(\d+)\s*hr\s*:\s*(\d+)\s*min/);
    
      if (!match) return 0;
    
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
    
      return Number(`${hours}.${String(minutes).padStart(2, "0")}`);
    }  
  
    const getData = async()=>{
      try {
        setLoading(true);
        const res = await fetch(`${BASE_API}/upDownInfo`);
        const data= await res.json();
        const formatted = data.infos.map(item => {
          const r = item.result;
          return {
            branchId: r.branchId,
            router: r.router,
            branchType: r.branchType,
            host: r.host,
            routerType: r.routerType,
            
            isp1Name: r.results.isp1.name,
            isp1Source:r.results.isp1.source,
            isp1Dest:r.results.isp1.dest,
            isp1Status: r.results.isp1.status,
            isp1DownTimes:r.results.isp1.downTimes,
            isp1UpTimes:r.results.isp1.upTimes,
            isp1DownTime: r.results.isp1.totalDownTime,
            isp1DownNum: convertDownTimeToNumber(r.results.isp1.totalDownTime),
            isp1LastDownTime: r.results.isp1.lastDownTime,
            isp1LastDownTimeMins: r.results.isp1.lastDownTimeMins,
      
            isp2Name: r.results.isp2.name,
            isp2Source:r.results.isp2.source,
            isp2Dest:r.results.isp2.dest,        
            isp2Status: r.results.isp2.status,
            isp2DownTimes:r.results.isp2.downTimes,
            isp2UpTimes:r.results.isp2.upTimes,
            isp2DownTime: r.results.isp2.totalDownTime,
            isp2DownNum: convertDownTimeToNumber(r.results.isp2.totalDownTime),
            isp2LastDownTime: r.results.isp2.lastDownTime || "",
            isp2LastDownTimeMins: r.results.isp2.lastDownTimeMins || 0,            
      
            error: r.results.error
          };
        }).sort((a, b) => a.branchId - b.branchId);
        let ips= formatted.map(item=>{
          return item.host
        })
        setRouterTableData(formatted);
        const systemUptimeDuration= moment.duration(data.systemUptimeDuration)
        let day = Math.floor(systemUptimeDuration.asDays());
        let upTimeHrs  = systemUptimeDuration.hours();
        let upTimeMins = systemUptimeDuration.minutes();
        setServerUptime(`${day} d ${upTimeHrs} hr : ${upTimeMins.toString().padStart(2, '0')} min`);
      } catch (error) {
        alert(error);
      }finally{
        setLoading(false);
      }
    }

    const refreshButton=()=>{
      getData();
    }    

    return(
        <>
          <HeaderPublic />
          <MonitoringCompo 
                      data={routerTableData} 
                      timer={secondsLeft} 
                      serverUptime={serverUptime} 
                      refreshButton={refreshButton} 
                      loading={loading}
                      socketRef={socketRef}
                      />            
        </>
    )
}