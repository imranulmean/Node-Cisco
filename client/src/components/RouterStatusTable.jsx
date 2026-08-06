import { useEffect, useRef, useState } from "react";
import DowntimeModal from "./DowntimeModal";


export default function RouterStatusTable({ data, timer, refreshButton, loading  }) {

    const [selectedTerminalRouter, setSelectedTerminalRouter] = useState(null);
    const [showModal, setshowModal] = useState(false);
    const [selectedISP, setSelectedISP] = useState('');
    const emails={
        'ALAP':'helpdesk@alap.com.bd',
        'BDCOM':'helpdesk@bdcom.com',
        'LINK3':'support@link3.net',
        'BRACNET':'support@bracmail.net',
        'SQUARE':'support.data@squaregroup.com',
        'IOL':'sc@iolbd.net',
        'A.D.N':'support@adnsl.net',
        'ADN':'support@adnsl.net',
        'PCL' :'noc@pmcon.net',
        'AMBER-IT':'support@amberit.com.bd',
        'AGNI':'customer.care@agni.com',
        'KSNetwork':'support@ksnetworkbd.com',
        'KS':'support@ksnetworkbd.com' 
    }

    useEffect(() => {
        if (!data || data.length === 0) return;
    
        // Destroy existing DataTable (important)
        if ($.fn.dataTable.isDataTable('#example')) {
          $('#example').DataTable().destroy();
        }    
        // Initialize AFTER rows exist
        // new DataTable('#example');
        new DataTable('#example', {
            paging: false,
            scrollCollapse: true,
            scrollY: '60vh'
        });        
      }, [data]);

    // 2. Add function to open terminal
    const openModal = (router, isp) => {
        setSelectedTerminalRouter(router);
        setshowModal(true);
        setSelectedISP(isp)
    };       
      

    return(
        <div className="p-4">
            <div className="absolute text-md text-gray-900">
                {/* Refreshing in: <span className="font-bold">{timer}s</span> */}
                {
                    !loading &&
                    <button onClick={refreshButton}
                            className="px-2 py-1 text-xs bg-gray-900 text-white rounded hover:bg-blue-900"
                        >
                            Refresh Data
                    </button>                 
                }

                {
                    loading &&
                    <p>Loading...</p>
                }           
            </div> 
            <DowntimeModal 
                    show={showModal} 
                    router={selectedTerminalRouter}
                    isp={selectedISP}
                    onClose={() => setshowModal(false)} 
                />                 
            <table id="example" class="cell-border display nowrap compact">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Branch <br/> Type</th>
                        <th>host</th>
                        <th>Type</th>
                        <th>ISP1 Name</th>
                        <th>ISP1 <br/> Timings</th>  
                        <th>ISP1 <br/>❌ Sort</th>  
                        <th>ISP2 Name</th>                    
                        <th>ISP2 <br/> Timings</th>
                        <th>ISP2 <br/>❌ Sort</th>
                        <th>Error</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        data.map(d=>{ 
                            return(
                                <tr>
                                    <td>{d.branchId}</td>
                                    <td>{d.router}</td>
                                    <td>{d.branchType}</td>
                                    <td>{d.host}</td>                                    
                                    <td>{d.routerType}</td>
                                    <td>
                                        <p><b>{d.isp1Name}</b></p>
                                        <p>src:{d.isp1Source}</p>
                                        <p>dst:{d.isp1Dest}</p>
                                        <p>Stat:<b>{d.isp1Status}</b></p> 
                                        <a href={`mailto:${emails[d.isp1Name]}`}
                                           className="px-2 py-1 text-xs bg-red-900 text-white rounded hover:bg-blue-900" >Send Mail
                                        </a>
                                    </td> 
                                    <td>
                                        <p>❌: {d.isp1DownTimes.length}</p>
                                        <p>✅: {d.isp1UpTimes.length}</p>
                                        <p>Total ❌ Time</p>
                                        <p>{d.isp1DownTime}</p>
                                        <button onClick={() => openModal(d, 'isp1')}
                                                className="px-2 py-1 text-xs bg-gray-900 text-white rounded hover:bg-blue-900"
                                            >
                                                Show Details
                                        </button>
                                    </td>   
                                    <td>{d.isp1DownNum}</td>                             
                                    <td>
                                        <p><b>{d.isp2Name}</b></p>
                                        <p>src:{d.isp2Source}</p>
                                        <p>dst:{d.isp2Dest}</p>
                                        <p>Stat:<b>{d.isp2Status}</b></p>
                                        <a href={`mailto:${emails[d.isp2Name]}`}
                                           className="px-2 py-1 text-xs bg-red-900 text-white rounded hover:bg-blue-900" >Send Mail
                                        </a>
                                    </td>                                
                                    <td>
                                    <p>❌: {d.isp2DownTimes.length}</p>
                                    <p>✅: {d.isp2UpTimes.length}</p> 
                                        <p>Total ❌ Time</p>
                                        <p>{d.isp2DownTime}</p>
                                        <button onClick={() => openModal(d, 'isp2')}
                                                className="px-2 py-1 text-xs bg-gray-900 text-white rounded hover:bg-blue-900"
                                            >
                                                Show Details
                                        </button>                                      
                                    </td>
                                    <td>{d.isp2DownNum}</td>
                                    <td className="w-10 max-w-10 truncate">{d.error}</td>                                
                                </tr> 
                            )                                            
                        })
                    }
                </tbody>
            </table>    
        </div>
    )

}