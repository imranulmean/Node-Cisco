import { useEffect, useRef, useState } from "react";
import { Card, Textarea, Label, TextInput, Button, Timeline, Modal, ModalBody, ModalFooter, ModalHeader, Tabs  } from "flowbite-react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import TerminalModal from "./TerminalModal"; 

export default function BulkAction(){

    const [routerTableData, setRouterTableData] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [commands, setCommands] = useState([]);
    const [outputs, setOutputs] = useState([]);
    const [routerErrs, setRouterErrs] = useState([]);
    const [loading, setLoading] = useState(false);    
    const [ins, setIns]= useState([]);
    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    let sessionToken= localStorage.getItem('sessionToken')
    
// ... existing states ...
const [selectedTerminalRouter, setSelectedTerminalRouter] = useState(null);
const [showTerminal, setShowTerminal] = useState(false);

// 2. Add function to open terminal
const openTerminal = (router) => {
    setSelectedTerminalRouter(router);
    setShowTerminal(true);
};

    useEffect(() => {
        if (!routerTableData || routerTableData.length === 0) return;
    
        // Destroy existing DataTable (important)
        if ($.fn.dataTable.isDataTable('#bulkActionTable')) {
          $('#bulkActionTable').DataTable().destroy();
        }
        // new DataTable('#bulkActionTable');   
        new DataTable('#bulkActionTable', {
            paging: false,
            scrollCollapse: true,
            scrollY: '60vh'
        });            
        
      }, [routerTableData]);     

    useEffect(()=>{
      getData();
    },[])
  
    const getData = async()=>{
      const res = await fetch(`${BASE_API}/allrouters`);
      const data= await res.json();
      const formatted = data.routers.map(item => {
        const r = item;
        return {
          branchId: r.branchId,
          router: r.name,
          branchType: r.branchType,
          host: r.host,
          routerType: r.routerType,
          authType: r.authType,
          
          isp1Name: r.isp1Name,
          isp1Source:r.isp1Source,
          isp1Dest:r.isp1Dest,
    
          isp2Name: r.isp2Name,
          isp2Source:r.isp2Source,
          isp2Dest:r.isp2Dest,        
        };
      });
    
      setRouterTableData(formatted);    
    }

    const handleCheckbox = (e, router) => {
        if (e.target.checked) {
          setIns((prev) => [...prev, router]);
        } else {
          setIns((prev) =>
            prev.filter((r) => r.host !== router.host)
          );
        }
      };

    const openBulkWindow =  async()=>{
        setOpenModal(true);
    }
    const closeModal =() =>{
        setOpenModal(false);
        setCommands([])
    }

    const handleChange = (e) => {
        setCommands(e.target.value);
      }    

    const sendCommand = async (mode) => {
        if(ins.length<1){
            alert("Router list Not Empty");
            return;            
        }
        if(commands=="" && commands.length<1){
            alert("Not Empty");
            return;
        }
        
        setLoading(true);
        setOutputs([]);
        setRouterErrs([]);
        
        const userCommands = commands.split("\n").map(cmd => cmd.trim()).filter(Boolean);
    
        for (const router of ins) {
            const parsedCommands = ["terminal length 0", ...userCommands];
        
            const payload = {
                routerData: router,
                parsedCommands,
                mode
            };
        
            try {
                const res = await fetch(`${BASE_API}/pushConfig`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "authorization": sessionToken
                     },
                    body: JSON.stringify(payload)
                });
        
                const data = await res.json();
        
                const cleanedOutput = (data.routerRes.output || "")
                    .replace(/\r/g, "")
                    .trim();
        
                setOutputs(prev => [
                    ...prev,
                    `===== ${router.router} (${router.host}) =====\n${cleanedOutput}`
                ]);
        
                if (data.routerRes.error) {
                    setRouterErrs(prev => [
                    ...prev,
                    `${router.router}: ${data.routerRes.error}`
                    ]);
                }
        
            } catch (err) {
                setRouterErrs(prev => [
                    ...prev,
                    `${router.router}: ${err.message}`
                ]);
            }
        }
    
        setLoading(false);
    };     

    const combinedOutput = outputs.join("\n\n");
    const combinedErrors = routerErrs.join(" | ");    

    return(
        <div className="w-full p-4">
            <button onClick={openBulkWindow} 
                className="inline-flex items-center rounded-lg border border-gray-300 bg-gray-900 px-4 py-2 text-center text-sm font-medium text-gray-100 hover:bg-blue-900">
                Open Bulk Window
            </button>
            {/* <button
                onClick={() => {
                    if (ins.length === routerTableData.length) {
                        setIns([]); // uncheck all
                    } else {
                        setIns(routerTableData); // check all
                    }
                }}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-gray-900 px-4 py-2 text-center text-sm font-medium text-gray-100 hover:bg-blue-900">
                {ins.length === routerTableData.length ? "Uncheck All" : "Check All"}
            </button>             */}
            {/* <Link to='/addRouter'>Add New Router</Link> */}
            <TerminalModal 
                show={showTerminal} 
                router={selectedTerminalRouter}
                sessionToken={sessionToken}
                onClose={() => setShowTerminal(false)} 
            />            
            <Modal size='xxl' show={openModal} onClose={() => setOpenModal(false)}>
                <ModalBody>
                    <div className="w-full">
                        <div className="mb-2 block">
                            <Label htmlFor="comment">Input Command</Label>
                        </div>
                        <Textarea onChange={handleChange} id="comment" placeholder="Set Commands here" required rows={4} />
                    {
                        !loading &&
                        <div className="flex gap-2 p-2">
                            <Button onClick={closeModal} disabled={loading}>Close</Button>
                            <button onClick={()=>sendCommand('push')} disabled={loading}
                                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-700">
                                    Send Command
                            </button>
                            <button onClick={()=>sendCommand('backup')} disabled={loading}
                                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-700">
                                    Get backup
                            </button>                            
                            <button onClick={()=>setOutputs([])} disabled={loading}
                                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-700">
                                    Clear Output
                            </button>                         
                        </div>
                    }                        
                        <h1>
                            Output
                            {routerErrs.length > 0 && (
                                <span style={{ color: "red" }}>
                                {" "}Error: {combinedErrors}
                                </span>
                            )}
                        </h1>

                        <Textarea className="bg-gray-900 text-white placeholder-gray-500"
                            value={combinedOutput} placeholder="Output will be shown here" rows={10}/>
                    </div>                    
                </ModalBody>
                <ModalFooter>
                    {
                        loading &&
                        <h2>Loading Data</h2>
                    }
                   
                </ModalFooter>            
            </Modal>             
            <table id="bulkActionTable" class="cell-border display nowrap compact">
                <thead>
                    <tr className="text-sm text-gray-700">
                        <th></th>
                        <th>Action</th>
                        <th>id</th>
                        <th>Name</th>
                        <th>Branch<br/>Type</th>
                        <th>host</th>
                        <th>Router Type</th>
                        <th>Auth</th>
                        <th>ISP1 Name</th>
                        <th>ISP2 Name</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        routerTableData.map(d=>{ 
                            return(
                                <tr className='text-sm text-gray-800'>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={ins.some((r) => r.host === d.host)}
                                            onChange={(e) => handleCheckbox(e, d)}
                                        />
                                    </td>
                                    <td>
                                        <button onClick={() => openTerminal(d)} 
                                                className="px-2 text-xs text-blue-800 rounded"
                                        >
                                            Terminal Shell {'>>'}
                                        </button>                                        
                                    </td>
                                    <td>{d.branchId}</td>
                                    <td>{d.router}</td>
                                    <td>{d.branchType}</td>
                                    <td>{d.host}</td>
                                    <td>{d.routerType}</td>
                                    <td>{d.authType}</td>
                                    <td>
                                        <p>{d.isp1Name}</p>
                                        <p>src:{d.isp1Source}</p>
                                        <p>dst:{d.isp1Dest}</p>                           
                                    </td>                                
                                    <td>
                                        <p>{d.isp2Name}</p>
                                        <p>src:{d.isp2Source}</p>
                                        <p>dst:{d.isp2Dest}</p>
                                    </td>                          
                                </tr> 
                            )                                            
                        })
                    }
                </tbody>
            </table>   
        </div>
    )    

}