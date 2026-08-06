import { useState, useEffect } from "react";
import moment from 'moment';
import Header from "../components/Header";

export default function RouterSessions(){
    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    let sessionToken= localStorage.getItem('sessionToken')
    const [routerSessions, setRouterSessions]= useState([]);

    useEffect(()=>{
        getRouterSessions();
      },[])    
    
    useEffect(()=>{
        // Destroy existing DataTable (important)
        if (!routerSessions || routerSessions.length === 0) return;
        if ($.fn.dataTable.isDataTable('#routerSessionsTable')) {
            $('#routerSessionsTable').DataTable().destroy();
          }
  
          new DataTable('#routerSessionsTable', {
            //   paging: false,
              scrollCollapse: true,
              ordering: false
            //   scrollY: '60vh'
          });         
        
      },[routerSessions])    
    const getRouterSessions = async()=>{
        try {
            const res = await fetch(`${BASE_API}/getRouterSessions`, {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    "authorization": sessionToken
                 }
                });
            const data= await res.json();
            if(data['tokenSuccess']==false){
                alert(data.message);
                return;
            }
            console.log(data);
            setRouterSessions(data.message)

                        
        } catch (error) {
            alert(error)
        }

      }     
    return(
        <>
            <Header/>
            <div className="p-4">
                <table id="routerSessionsTable" class="cell-border display nowrap compact">
                        <thead>
                            <tr>
                                <th>branch</th>
                                <th>id</th>
                                <th>host</th>
                                <th>startTime</th>
                                <th>endTime</th>                        
                                <th>commands</th>
                                <th>user</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                routerSessions.map(d=>{ 
                                    return(
                                        <tr>
                                            <td>{d.branch}</td>
                                            <td>{d.branchId}</td>
                                            <td>{d.host}</td>                                    
                                            <td>{moment(d.startTime).format("MMMM Do YYYY, h:mm:ss a")}</td>
                                            <td>{moment(d.endTime).format("MMMM Do YYYY, h:mm:ss a")}</td>
                                            <td>
                                                {
                                                    d?.commands.length>0 && d.commands.map((c)=>(
                                                        <>
                                                            <p className="max-w-[400px] break-all whitespace-normal">{c.command.replace(/\x1B\[[0-9;]*[A-Za-z]/g, "")}</p>
                                                            <p>{moment(c.time).format("MMMM Do YYYY, h:mm:ss a")}</p>
                                                        </>
                                                    ))
                                                }
                                            </td>                        
                                            <td>{d.user}</td>
                                        </tr> 
                                    )                                            
                                })
                            }
                        </tbody>
                </table> 
            </div>
        </>
    )
}