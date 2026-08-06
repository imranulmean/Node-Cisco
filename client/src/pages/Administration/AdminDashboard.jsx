import { useEffect, useState } from "react";
import AdminHeader from "../../components/AdminHeader";
import AdminMailCompo from "./AdminMailCompo";
import UsersCompo from "./UsersCompo";
import ScheduleCompo from "./ScheduleCompo";

export default function AdminDashboard(){
    let {role} = JSON.parse(localStorage.getItem('userInfo')) || {};
    return(        
        <>
            <AdminHeader />
            <div className="p-4 flex gap-2">
                {
                    role=='Admin' && <UsersCompo/>
                } 
                <AdminMailCompo/>
                <ScheduleCompo />
            </div>            
        </>
    )
}