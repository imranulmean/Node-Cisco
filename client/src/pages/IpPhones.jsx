import { Card } from "flowbite-react";
import { useEffect, useState } from "react";
import { FaPhoneSquareAlt } from "react-icons/fa";
import { phones } from "../phones";

export default function IpPhones(){

    const [ipPhones, setIpPhones]= useState([]);
    const BASE_API=import.meta.env.VITE_API_BASE_URL;

    const [modes, setModes]=useState({Name:'Name', Designation:'Designation', Department: 'Department', Extension: 'Extension'})
    const [queryMode, setQueryMode]= useState('Name');
    const [queryString, setQueryString]= useState("");    

    useEffect(() => {
        if (!ipPhones || ipPhones.length === 0) return;

        if ($.fn.dataTable.isDataTable('#bulkActionTable')) {
          $('#bulkActionTable').DataTable().destroy();
        }
        // new DataTable('#bulkActionTable');   
        new DataTable('#bulkActionTable', {
            paging: false,
            scrollCollapse: true,
            scrollY: '60vh'
        });            
        
      }, [ipPhones]);     

    useEffect(()=>{
      getData();
    },[])
  
    const getData = async()=>{
    //   const res = await fetch(`${BASE_API}/getPhoneList`);
    //   const data= await res.json();
    //   setIpPhones(data.phones);
    setIpPhones(phones);
    } 
    const filterPhones= ipPhones.length > 0 ? ipPhones.filter(r=>{
        if(queryString==="" ) return true;
        if(queryMode==="Extension") r[queryMode] = r[queryMode].toString();
        return r[queryMode]?.toLowerCase().includes(queryString.toLowerCase())
    }) : [];       

    return(
        <>
            <div className="flex flex-col p-4 items-center">
                <span class="text-cyan-900 self-center text-3xl text-heading font-semibold whitespace-nowrap mb-2">AIBL IP Phone List</span>
                <div className="flex gap-2 max-w-sm justify-center">
                    <select onChange={(e)=>{ setQueryMode(e.target.value); setQueryString(""); }}
                            class="block w-full px-3 py-2.5 bg-white-200 border border-gray-200 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 outline:none"> 
                        {
                            Object.entries(modes).map(([key,value])=>{
                                return(
                                    <>
                                        <option value={value}>{key}</option>
                                    </>
                                )
                            })
                        }

                    </select>
                    <input type="text" value={queryString} placeholder="Search" onChange={(e)=>{setQueryString(e.target.value);}}
                        class="block w-full px-3 py-2.5 bg-white-200 border border-gray-200 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 outline:none" 
                    />                    
                </div>
                <p className="mt-2 text-cyan-900">Showing:{filterPhones.length}</p>                
                <div className="flex flex-wrap justify-center gap-2 py-10 rounded-lg">
                    {
                        filterPhones.map(f =>{
                            return(
                                // shadow-[2px_2px_0px_0px_green]
                                <div className="shadow-[2px_2px_1px_0px_#164E63] w-[250px] bg-white px-2 py-4 border border-cyan-900 rounded-lg hover:bg-green-900 hover:text-gray-100">
                                    <div className="flex flex-col items-start gap-2">
                                        <FaPhoneSquareAlt  color="#164E63" size="1.3em" />
                                        <p>{f.Name}</p>
                                        <p>{f.Designation}</p>
                                        <p>{f.Extension}</p>
                                        <p>{f.Department}</p>
                                    </div>
                                </div>
                            )
                        })
                    } 
                </div> 
            </div>
       
            {/* <Card className="p-4">
                <div className="flex flex-col gap-4 border border-green-900 p-4 rounded-lg">
                    <span class="text-cyan-900 self-center text-3xl text-heading font-semibold whitespace-nowrap">AIBL IP Phone List</span>
                    <div className="">
                        <table id="bulkActionTable" class="cell-border display nowrap compact">
                            <thead>
                                <tr>
                                    <th>Serial</th>
                                    <th>Name</th>
                                    <th>Designation</th>
                                    <th>Extension</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    ipPhones.map((d, index)=>{ 
                                        return(
                                            <tr>
                                                <td>{index+1}</td>
                                                <td>{d.Name}</td>                                    
                                                <td>{d.Designation}</td>
                                                <td>{d.Extension}</td>                             
                                            </tr> 
                                        )                                            
                                    })
                                }
                            </tbody>
                        </table>  
                    </div>
                </div>               
            </Card>  */}
        </>
    )
}