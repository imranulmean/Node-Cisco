import { useEffect, useRef, useState } from "react";
import DowntimeModal from "./DowntimeModal";
import { TabItem, Tabs, Card, Avatar } from "flowbite-react";
import { Link } from "react-router-dom";
import IspDownSummery from "./IspDownSummery";
import SendMailCompo from "./SendMailCompo";
import { FaCheckSquare } from "react-icons/fa";
import { FaSkullCrossbones, FaSync } from "react-icons/fa";

function Lists({list, openModal}){

    const [queryString, setQueryString]= useState("");  

    const filterList= list.length > 0 ? list.filter(r=>{
        if(queryString==="" ) return true;
        if(
            r.router.toLowerCase().includes(queryString.toLowerCase()) || 
            r.isp1Name.toLowerCase().includes(queryString.toLowerCase()) ||
            r.isp2Name.toLowerCase().includes(queryString.toLowerCase()) ||
            r.branchId.toString().includes(queryString.toLowerCase()) 
            
        )
        return r
    }) : []; 
    return(
        <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-[400px] flex gap-2 items-start">
                <input type="text" value={queryString} placeholder="Search using Name, ID, ISP" onChange={(e)=>{setQueryString(e.target.value);}}
                    class="w-full px-3 py-2 bg-white-200 border border-gray-400 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 outline:none" 
                /> 
                <button onClick={()=>setQueryString("")}
                    className="bg-red-700 text-gray-200 text-sm px-3 py-1 rounded-md mt-1">clear</button>
                <span className="w-[200px] text-sm text-gray-400 mt-2">Showing: {filterList.length}    </span>
            </div>
            <div className="w-full flex flex-wrap justify-center items-center gap-2">
                {
                    filterList.map(d=>{
                        // '❌' : '✅'
                        return(
                            <div className="w-[200px] flex flex-col justify-center items-center border border-gray-400 p-2 rounded-lg">
                                <div className="flex gap-2 justify-center items-center">
                                    <button className="flex flex-col justify-center items-center" 
                                            onClick={() => openModal(d, 'isp1')}>
                                        {
                                            d.isp1Status === "DOWN" ? <FaSkullCrossbones color="red" size="1.3rem"/> : <FaCheckSquare color="green" size="1.3rem"/>
                                        }
                                        <p className="text-sm">{d.isp1Name}</p>
                                    </button>
                                    {
                                        d.isp1Source !== d.host &&
                                        <div>
                                        {
                                            d.error === "Host Unreachable" ? <FaSkullCrossbones color="red" size="1.3rem"/> : <FaCheckSquare color="green" size="1.3rem"/>
                                        }
                                        <p className="text-sm">LAN</p>
                                    </div>
                                    }
                                    {
                                        d.isp1Source !== d.isp2Source &&
                                        <button className="flex flex-col justify-center items-center"
                                                onClick={() => openModal(d, 'isp2')}   >
                                            {
                                                d.isp2Status === "DOWN" ? <FaSkullCrossbones color="red" size="1.3rem"/> : <FaCheckSquare color="green" size="1.3rem"/>
                                            }
                                            <p className="text-sm">{d.isp2Name}</p>
                                        </button>                                    
                                    }

                                </div>
                                <div className="flex flex-col mt-1">
                                    <span className="text-sm text-center"><b>{d.branchId}: {d.router}</b></span>
                                    <p className="text-sm text-center"><b>{d.host}</b></p>
                                    <p className="text-sm text-center"><b>{d.routerType}</b></p>
                                </div>
                                {
                                    d.branchType !== "switch" &&
                                    <Link to={`/mrtg/${d.router}/${d.host}`}
                                        className="w-full text-center bg-green-900 py-1 px-4 text-sm text-white rounded-lg mt-2">MRTG
                                    </Link>
                                }

                            </div>
                        )
                    })
                }                  
            </div>          
        </div>
    )
}

function AutoScrollList({ children }) {
    const intervalRef = useRef(null);
    // console.log(window.innerWidth)
    const start = () => {
        
        if (window.innerWidth < 2000) return;
        stop();
        window.scrollTo(0, 0);
        intervalRef.current = setInterval(() => {
            const scrollTop = window.scrollY;            
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

            if (scrollTop >= maxScroll) {
                window.scrollTo(0, 0);
            } else {
                window.scrollBy(0, 1);
            }
        }, 200);
    };

    const stop = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // start only once when first mounted
    useEffect(() => {
        const timer = setTimeout(() => {
            start();
        }, 1500);
        return () => {
            clearTimeout(timer);
            stop();
        };
    }, []); // ← empty dependency, only runs once on mount

    useEffect(() => {
        let idleTimer;
    
        const onActivity = () => {
            stop();
            clearTimeout(idleTimer);
            idleTimer = setTimeout(start, 10 * 1000); // ← resume after 2s of no activity
        };
    
        window.addEventListener('mousemove', onActivity);
        window.addEventListener('wheel', onActivity);
    
        return () => {
            window.removeEventListener('mousemove', onActivity);
            window.removeEventListener('wheel', onActivity);
            clearTimeout(idleTimer);
        };
    }, []);

    return (
        <div className="flex flex-wrap justify-center items-start gap-2 mt-2">
            {children}
        </div>
    );
}



export default function MonitoringCompo({ data, timer, serverUptime, refreshButton, loading, socketRef }) {

    let sessionToken= localStorage.getItem('sessionToken')
    const [selectedTerminalRouter, setSelectedTerminalRouter] = useState(null);
    const [branches, setBranches]= useState([]);
    const [subs, setSubs]= useState([]);
    const [switches, setSwitches]= useState([]);    
    const [showModal, setshowModal] = useState(false);
    const [selectedISP, setSelectedISP] = useState('');
    const [showOnlySummary, setShowOnlySummary] = useState(false);


    const loopBacks=[
        {ispName:'ALAP', legacy:'10.154.0.97', sdwan:'10.41.209.214'},
        {ispName:'BDCOM', legacy:'10.154.0.33', sdwan:'10.255.31.122'},
        {ispName:'LINK3', legacy:'10.154.1.233', sdwan:'10.4.9.42'},
        {ispName:'BRACNET', legacy:'10.154.0.161', sdwan:'172.35.85.50'},
        {ispName:'SQUARE', legacy:'10.154.1.161', sdwan:'10.220.154.66'},
        {ispName:'IOL', legacy:'10.154.1.97', sdwan:'10.100.22.2'},
        {ispName:'A.D.N', legacy:'10.154.2.1', sdwan:'10.168.227.46'},
        {ispName:'PCL', legacy:'10.154.2.129', sdwan:'10.186.0.34'},
        {ispName:'AMBER-IT', legacy:'10.154.1.33', sdwan:'10.122.12.42'},
        {ispName:'AGNI', legacy:'10.154.2.177', sdwan:'10.100.134.10'},
        {ispName:'KSNetwork', legacy:'10.154.2.65', sdwan:'10.1.4.18'}        
    ]

    const dcDevices=[
        {deviceName:'LAN Internet Router Pri', host:'172.30.2.25'},
        {deviceName:'LAN Internet Router Sec', host:'172.30.2.26'},
        {deviceName:'LAN Dist SW Pri', host:'172.23.22.252'},
        {deviceName:'LAN Dist SW Sec', host:'172.23.22.253'}                
    ]    

    useEffect(() => {
        
        if (!data || data.length === 0){
            setBranches([]);
            setSubs([])
            setSwitches([]);
            return;
        }             
        let br=data.filter(d=>{
            if(d.branchType==='branch') return d;
        });        
        let subBr=data.filter(d=>{
            if(d.branchType==='sub') return d;
        });
        let sw=data.filter(d=>{
            if(d.branchType==='switch') return d;
        });        

        setBranches(br);
        setSubs(subBr)
        setSwitches(sw);

      }, [data]);

    // 2. Add function to open terminal
    const openModal = (router, isp) => {
        setSelectedTerminalRouter(router);
        setshowModal(true);
        setSelectedISP(isp)
    };       


    return(
        <div className="p-4">
            <div className="text-md text-gray-900">
            <FaSync className="inline-block mr-1" style={{ animation: 'spin 5s linear infinite' }} /> <span className="font-semibold">Refreshing in: {timer}s, {serverUptime}</span>

                {
                    loading &&
                    <p>Loading...</p>
                }           
            </div>
            {
                data.length > 0 &&
                <IspDownSummery data={data} loopBacks={loopBacks} openModal={openModal}/> 
            }
            <button onClick={()=>setShowOnlySummary(prev=>!prev)}
                className="w-full text-center bg-green-900 py-1 px-4 text-sm text-white rounded-lg mt-2"
            >HiT Me !!!</button>
            <DowntimeModal 
                    show={showModal} 
                    router={selectedTerminalRouter}
                    isp={selectedISP}
                    onClose={() => setshowModal(false)} 
                />
            {
                !showOnlySummary && 
                <Tabs aria-label="Tabs with underline" variant="underline">
                <TabItem active title={`Branch (${branches.length})`}>
                    {/* <div                 
                        className="flex flex-wrap justify-center items-center gap-2 mt-2">
                        <Lists list={branches} openModal={openModal}/>
                    </div>                                          */}
                        <AutoScrollList key={`branch-${branches.length}`}>
                            <Lists list={branches} openModal={openModal}/>
                        </AutoScrollList>                    
                </TabItem>
                <TabItem  title={`Sub Branches (${subs.length})`}>
                    {/* <div className="flex flex-wrap justify-center items-center gap-2 mt-2">
                        <Lists list={subs} openModal={openModal}/>
                    </div> */}
                        <AutoScrollList key={`sub-${subs.length}`}>
                            <Lists list={subs} openModal={openModal}/>
                        </AutoScrollList>                         
                </TabItem>
                <TabItem  title={`HO Switches (${switches.length})`}>
                    <div className="flex flex-wrap justify-center items-center gap-2 mt-2">
                        <Lists list={switches} openModal={openModal}/>
                    </div>
                </TabItem>                
                <TabItem  title={`Loopback IPs`}>
                    <div className="flex flex-wrap gap-2">
                        {
                            loopBacks.map(d=>{
                                return(
                                    <div className="w-[200px] flex flex-col justify-center items-center border border-gray-600 p-2 rounded-lg">
                                        <div className="flex flex-col gap-1 mt-1">
                                            <span className="text-sm text-center"><b>{d.ispName}</b></span>
                                            <p className="text-sm text-center"><b>Legacy: {d.legacy}</b></p>
                                            <p className="text-sm text-center"><b>Sdwan: {d.sdwan}</b></p>
                                        </div>                                
                                    </div>
                                )
                            })
                        } 
                    </div>
                </TabItem>  
                <TabItem  title={`DC Devices MRTG`}>
                    <div className="flex flex-wrap gap-2">
                        {
                            dcDevices.map(d=>{
                                return(
                                    <Link to={`/mrtg/${d.deviceName}/${d.host}`}
                                     className="w-[200px] flex flex-col justify-center items-center border border-gray-600 p-2 rounded-lg">
                                        <div className="flex flex-col gap-1 mt-1">
                                            <span className="text-sm text-center"><b>{d.deviceName}</b></span>
                                            <p className="text-sm text-center"><b>{d.host}</b></p>
                                        </div>                                
                                    </Link>
                                )
                            })
                        } 
                    </div>
                </TabItem>  
                    <TabItem  title={`Send Mail`}>
                        {
                            branches.length>0 &&
                            <SendMailCompo mainData={data} branches={branches} subBranches={subs} socketRef={socketRef}/>
                        }                            
                    </TabItem>                     
            </Tabs>                  
            }
  
        </div>
    )

}