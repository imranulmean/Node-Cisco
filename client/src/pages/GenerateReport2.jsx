import { Datepicker } from "flowbite-react";
import { Button, Checkbox, Label, TextInput, Select } from "flowbite-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import Header from "../components/Header";
import Report2 from "../components/Report2";

export default function GenerateReport2(){

    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    const isps = ['ALAP','BDCOM','LINK3','BRACNET','SQUARE','IOL','A.D.N','PCL','AMBER-IT', 'AGNI', 'KSNetwork', 'Alap'];
    const [ispName, setIspName]= useState(isps[0]);
    const [branchName, setBranchName]= useState('All');
    const [branchId, setBranchId]= useState(0);
    const [loading, setLoading]= useState(false);
    const [routerTableData, setRouterTableData] = useState([]);
    const [reportData, setReportData]=useState();
    const [dateStrings, setDateStrings]= useState({fromStr:'', toStr:''});
    const { pathname } = useLocation();
    const fromUrl = pathname.split('/')[1];
    const [filteredIsps, setFilteredIsp]= useState(isps);

    useEffect(()=>{
        setReportData([]);
        getData();
      },[pathname])

    const handleBranchChange= (bId) =>{
        let selectedIsp=[];
        setBranchId(bId);
        setFilteredIsp(isps);
        if(Number(bId) !== 0){
            let filteredBranch=[];
            filteredBranch= routerTableData.filter((branch)=> {
                if( branch.branchId===Number(bId)){
                    return branch
                }                
            });
            console.log(filteredBranch)
            selectedIsp.push(filteredBranch[0].isp1Name)
            selectedIsp.push(filteredBranch[0].isp2Name)
            setFilteredIsp(selectedIsp);
        }

    }  
    const getData = async()=>{
        setLoading(true);
        try{
            const res = await fetch(`${BASE_API}/allrouters`);
            const data= await res.json();      
            setRouterTableData(data.routers);    
        }catch(err){
            alert(err);
        }finally{
            setLoading(false);            
        }
      }    

    const generateReport2 = async()=>{
        const fromStr= document.getElementById('fromDate').value
        const toStr= document.getElementById('toDate').value
        
        setDateStrings({fromStr, toStr})
        // convert string → Date
        const fromDate = new Date(fromStr);
        const toDate = new Date(toStr);
        toDate.setHours(23, 59, 59, 999);

        const params= new URLSearchParams({
            ispName,
            branchId,
            fromDate,
            toDate,
            fromUrl
        }).toString();        
        try{
            setLoading(true);
            const res=await fetch(`${BASE_API}/generateReport2?${params}`);
            const data= await res.json();
            setReportData(data.data);
        }catch(err){
            alert(err)
        }finally{
            setLoading(false);
        }

    }

    return(
        <>
            <AdminHeader/>
            <div className="w-full p-4 print:hidden">
                <span class="text-cyan-900 self-center text-md text-heading font-semibold whitespace-nowrap">Generate Report</span>
                <div className="flex gap-2">
                    <div>
                        <Label>ISP 1</Label>
                        <Select required
                            onChange={(e)=> setIspName(e.target.value)}
                        >
                            {filteredIsps.map(i=>(
                            <option key={i} value={i}>{i}</option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Label>Branch</Label>
                        <Select required
                            onChange={(e)=> handleBranchChange(e.target.value)}
                        >
                            <option key='All' value='0'>All</option>
                            {routerTableData.map(i=>(                                
                                    <>                                        
                                        <option key={i.branchId} value={i.branchId}>{i.name}</option>
                                    </>
                            ))}
                        </Select>
                    </div>                    
                    <div>
                        <Label>From Date</Label>
                        <Datepicker id="fromDate" maxDate={new Date()} />       
                    </div>
                    <div>
                        <Label>To Date</Label>
                        <Datepicker id="toDate" maxDate={new Date()}/>
                    </div>
                    {
                        !loading ?
                        <button onClick={generateReport2}
                                className="text-sm rounded-md bg-green-900 px-2 mt-6 text-white"
                        >
                            Generate
                        </button> : <p className="text-xs text-green-600">Process...</p>
                    }                    
                </div>               
            </div>        
            {
                reportData?.length > 0 ? (
                <Report2 ispName={ispName} data={reportData} dateStrings={dateStrings} fromUrl={fromUrl}/>
                ) : (
                <p>No data to display.</p>
                )
            }          
        </>
    )
}