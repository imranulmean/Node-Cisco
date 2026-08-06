import { Datepicker, Label } from "flowbite-react";
import { useState } from "react";
import moment from 'moment';

export default function AdminMailCompo(){

    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    const accessToken= localStorage.getItem('accessToken')
    const [sendMailList, setSendmailList] = useState([]);
    const [loading, setLoading] =useState(false);
    const ispColors = {
        BDCOM:  'bg-blue-300 text-blue-700',
        LINK3:  'bg-green-300 text-green-700',
        ALAP:   'bg-yellow-300 text-yellow-700',
        BRACNET: 'bg-purple-300 text-purple-700',
        'SQUARE': 'bg-purple-300 text-purple-700',
        'A.D.N': 'bg-purple-300 text-purple-700',
        'PCL': 'bg-purple-300 text-purple-700',
        'AMBER-IT': 'bg-purple-300 text-purple-700',
        'AGNI' : 'bg-purple-300 text-purple-700',
        'KSNetwork': 'bg-purple-300 text-purple-700'
    };    

    const getMails = async()=>{
        const fromStr= document.getElementById('fromDate').value
        const toStr= document.getElementById('toDate').value
        const fromDate = new Date(fromStr);
        const toDate = new Date(toStr);
        toDate.setHours(23, 59, 59, 999);

        const params= new URLSearchParams({ fromDate, toDate }).toString();
        try{
            setLoading(true);
            const res=await fetch(`${BASE_API}/administration/getMails?${params}`,{
                method:"GET",
                headers: { 'Content-Type': 'application/json', "authorization": accessToken },
            });
            const data= await res.json();
            if(!data.success){
                alert(data.message)
                return;
            }
            setSendmailList(data.data);
        }catch(err ){
            alert(err)
        }finally{
            setLoading(false);
        }

    }    

    const deleteMail= async(mailId)=>{
        const obj={ mailId }
        setLoading(true);
        try {
            const res= await fetch(`${BASE_API}/administration/deleteMail`,{
                method:"POST",
                headers: { 
                    "Content-Type": "application/json",
                    "authorization": accessToken
                 },
                body: JSON.stringify(obj)
            })
            const data= await res.json();
            if(!data.success){
                alert(data.message)
                return;
            }            
            alert(data.message);
        } catch (error) {
            alert(error)
        }
        finally{
            setLoading(false);
            await getMails();
        }

    }        

    return (
        <div className="flex flex-col gap-3">

            {/* header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">Mail List</p>
                    <p className="text-xs text-gray-500">Sent ISP complaint emails</p>
                </div>
            </div>

            {/* date filter */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <div>
                        <p className="text-xs text-gray-400 mb-1">from</p>
                        <Datepicker id="fromDate" maxDate={new Date()} 
                                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-green-500" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-1">to</p>
                        <Datepicker id="toDate" maxDate={new Date()}
                                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-green-500"/>
                    </div>
                    {
                        !loading ? 
                        <button onClick={getMails}
                            className="flex items-center gap-1 px-3 py-1.5 mt-4 bg-green-900 text-white rounded-lg text-xs">
                            generate
                        </button> : <p className="text-xs text-gray-400">processing</p>
                    }

                </div>
            </div>

            <div className="border-t border-gray-400"></div>

            {/* column headers */}
            <div className="grid grid-cols-[32px_1fr_1fr_auto] gap-4 px-4 text-xs text-gray-600">
                <span>#</span>
                <span>branch info</span>
                <span>isp details</span>
                <span></span>
            </div>

            {/* mail rows */}
            <div className="h-[50vh] overflow-auto ">
                {sendMailList.map((mail, index) => (
                    <div key={mail._id}
                        className="bg-white border border-gray-200 rounded-xl p-4 grid grid-cols-[32px_1fr_1fr_auto] items-center gap-2 hover:bg-gray-50 transition-colors">

                        <span className="text-xs text-gray-600">{index + 1}</span>

                        <div>
                            <p className="text-sm font-medium">{mail.branchId}: {mail.router}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{mail.branchType}</p>
                        </div>

                        <div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ispColors[mail.ispName] || 'bg-gray-100 text-gray-600'}`}>
                                {mail.ispName}
                            </span>
                            <p className="text-xs text-gray-600 mt-1">{mail.email}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{mail.lastDown}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{mail.lastDownTime}</p>
                            <p className="text-xs text-gray-600 mt-0.5">
                                Sent: {moment(mail.createdAt).format("MMMM Do YYYY, h:mm a")}
                            </p>
                        </div>

                        {!loading
                            ? <button onClick={() => deleteMail(mail._id)}
                                className="flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-500 rounded-lg text-xs hover:bg-red-50">
                                delete
                            </button>
                            : <p className="text-xs text-gray-400">processing</p>
                        }
                    </div>
                ))}
            </div>


        </div>
    );   

}