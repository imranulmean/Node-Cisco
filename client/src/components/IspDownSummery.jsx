import { useEffect, useRef, useState } from "react";
import { Tooltip, Card } from "flowbite-react";
import { FaSkullCrossbones } from "react-icons/fa";

export default function IspDownSummery({data, loopBacks, openModal}){
    
    const [ispDownSummeryObj, setIspDownSummeryObj]=useState({});   
    const prevSelected = useRef(null); 
    useEffect(()=>{
        let obj={};
        loopBacks.map(l=>{
            obj[l.ispName]={count:0, branches:[]};
        })
        data.forEach(d => {
            Object.keys(obj).forEach(key => {
                if (key === d.isp1Name.trim() && d.isp1Status.trim() === "DOWN") {
                    obj[key].count += 1;
                    obj[key].branches.push({branchId:d.branchId, branchName: d.router, ispType:'isp1', router:d});
                }    
                if (key === d.isp2Name.trim() && d.isp2Status.trim() === "DOWN") {
                    obj[key].count += 1;
                    obj[key].branches.push({branchId:d.branchId, branchName: d.router, ispType:'isp2', router:d });
                }
    
            });
        });
        setIspDownSummeryObj(obj);
    },[data])

    return(
        <div className="flex flex-col gap-2 border border-green-900 rounded-lg p-2 mt-2">
            <p className="text-lg text-gray-600 flex gap-2">
                <FaSkullCrossbones color="red" size="1.5rem"/><span className="animated-text font-semibold">Link Down Summary: </span> <FaSkullCrossbones color="red" size="1.5rem"/> 
            </p>
            <div className="flex flex-wrap gap-2">
                {
                    Object.entries(ispDownSummeryObj).map(([key, value])=>{
                        return(
                            <div className="w-[200px] flex flex-col justify-center items-center border border-gray-400 p-2 rounded-lg">
                                <div className="flex flex-col gap-1 mt-1">                                
                                    <span className="text-sm text-center"><b>{key}: {value.count}</b></span>                            
                                    <div className="text-sm text-center flex flex-wrap gap-1 justify-center" >
                                        {value.branches.map((branch, index) => (
                                            <Tooltip key={index} content={`${branch.branchId}: ${branch.branchName}`} placement="top">
                                                <button className="bg-red-800 text-sm text-white px-2 rounded-md" 
                                                        onClick={() => openModal(branch.router, branch.ispType)} >
                                                        {branch.branchId}
                                                </button>
                                            </Tooltip>
                                        ))}
                                    </div>                                
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>

    )
}