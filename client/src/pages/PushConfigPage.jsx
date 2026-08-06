import { useState } from "react";
import BulkAction from "../components/BulkAction";
import Header from "../components/Header";
import SidebarCompo from "../components/SidebarCompo";

export default function PushConfigPage(){
    const [sidebarOpen, setSidebarOpen] = useState(true);
    return(
        <>
            <Header/>
            {/* <SidebarCompo /> */}
            <BulkAction/>
        </>
        // <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        //     <SidebarCompo isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        //     <Header />
        //     <BulkAction />
        // </div>     
    )
}