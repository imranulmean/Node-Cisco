import { useEffect, useRef, useState } from "react";
import { Card, Textarea, Label, TextInput, Button, Timeline, Modal, ModalBody, ModalFooter, ModalHeader, Tabs  } from "flowbite-react";

export default function Backups(){

    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    const [routerTableData, setRouterTableData] = useState([]);

    useEffect(() => {
        if (!routerTableData || routerTableData.length === 0) return;
    
        // Destroy existing DataTable (important)
        if ($.fn.dataTable.isDataTable('#backupTable')) {
          $('#backupTable').DataTable().destroy();
        }
    
        // Initialize AFTER rows exist
        new DataTable('#backupTable');
        
      }, [routerTableData]);     
  

    useEffect(()=>{
        getData();
      },[])
    
      const getData = async()=>{
        const res = await fetch(`${BASE_API}/backups`);
        const data= await res.json();
        const formatted = data.backupLinks
      
        setRouterTableData(formatted);    
      }

      return(
        <>
         
            <table id="backupTable" class="cell-border display nowrap compact">
                <thead>
                    <tr>                        
                        <th>Backuplink</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        routerTableData.map(d=>{ 
                            return(
                                <tr>
                                    <td><a href={d} target="_blank">{d}</a></td>
                                </tr> 
                            )                                            
                        })
                    }
                </tbody>
            </table>   
        </>
    )   

}