import { Datepicker, Label } from "flowbite-react";
import { useState } from "react";
import moment from 'moment';


export default function AdminMailCompo(){

    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    let {role} = JSON.parse(localStorage.getItem('userInfo')) || {};
    const accessToken= localStorage.getItem('accessToken')
    const [sendMailList, setSendmailList] = useState([]);
    const [loading, setLoading] =useState(false);
    const [searchString, setSearchString]=useState('');

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

    const [upTime, setUptime] = useState('No Uptime');
    const [selectedIndex, setSelectedIndex] = useState(-1);


    const filtered= sendMailList.filter((mail)=>{
        
        if(!searchString) console.log(mail)
        if(
            String(mail.branchId).includes(searchString) ||
            mail.router.toLowerCase().includes(searchString) || 
            mail.ispName.toLowerCase().includes(searchString)){
                return mail;
            }         
    })

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
 
    const getUptime= async(mailId, branchId, router,lastDownTime, ispName, index, sentTime)=>{     
        setUptime('No Uptime')   
        const obj={ mailId, branchId, router, lastDownTime }
        setSelectedIndex(index);
        setLoading(true);
        try {
            const res= await fetch(`${BASE_API}/administration/getUptime`,{
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
                setUptime(data.message)
                return;
            }
            let ispObject=data.message[0]?.result?.results?.isp1?.name ==ispName ? 'isp1' : 'isp2';
            let selectedISP= data.message[0].result.results[`${ispObject}`];
            console.log(selectedISP)
            if(selectedISP){
                const upTimes= selectedISP.upTimes;
                if(upTimes.length > 0){
                    for(let i=0; i<upTimes.length; i++){
                        const isPositve=getDuration(sentTime, upTimes[i]);
                        if(isPositve !== false){ 
                            setUptime(upTimes[i]);
                            break; 
                        }
                    }                                
                }
            }
            
        } catch (error) {
            alert(error)
        }
        finally{
            setLoading(false);
        }

    }    
           
    const getDuration = (startTime, endTime) => {
        const start = moment(startTime);
        const end = moment(endTime, "MMMM Do YYYY, h:mm:ss a");
    
        const duration = moment.duration(end.diff(start));
    
        const days = Math.floor(duration.asDays());
        const hours = duration.hours();
        const minutes = duration.minutes();
        if(days<0 || hours<0 || minutes<0){
            return false;
        }
        return `${days} d ${hours} hr : ${minutes.toString().padStart(2, '0')} min`;
    };

    return (
        <div className="w-full flex flex-col gap-3">

            {/* header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">
                        Mail List:
                        <input type="text" onChange={(e)=>setSearchString(e.target.value)}
                                placeholder='Search Name, ID, ISP'
                               className='border border-gray-400 p-1 rounded-lg ml-2' />
                    </p>
                    <p className="text-xs text-gray-500">Sent ISP complaint emails</p>
                </div>
            </div>

            {/* date filter */}
            <div className="bg-white">
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <div>
                        {/* <p className="text-xs text-gray-400 mb-1">from</p> */}
                        <Datepicker id="fromDate" maxDate={new Date()} 
                                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs outline-none focus:border-green-500" />
                    </div>
                    <div>
                        {/* <p className="text-xs text-gray-400 mb-1">to</p> */}
                        <Datepicker id="toDate" maxDate={new Date()}
                                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs outline-none focus:border-green-500"/>
                    </div>
                    {
                        !loading ? 
                        <button onClick={getMails}
                            className="flex items-center gap-1 px-3 py-1 mt-4 bg-green-900 text-white rounded-lg text-xs">
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
            <div className="h-[400px] overflow-auto ">
                {filtered.map((mail, index) => (
                    <div key={mail._id}
                        className="bg-white border border-gray-200 rounded-xl p-4 grid grid-cols-[32px_1fr_1fr_auto] items-center gap-2 hover:bg-gray-50 transition-colors">

                        <span className="text-xs text-gray-600">{index + 1}</span>

                        <div>
                            <p className="text-sm font-medium">
                                {mail.branchId}: {mail.router}
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ispColors[mail.ispName] || 'bg-gray-100 text-gray-600'}`}>
                                    {mail.ispName}
                                </span>                                
                            </p>
                            {/* <p className="text-xs text-gray-600 mt-0.5">{mail.branchType}</p> */}
                            <p className="text-sm text-gray-600 mt-1">{mail.email}</p>
                            <p className="text-sm text-gray-600 mt-0.5">{mail.lastDown}</p>                            
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mt-0.5 font-bold">{mail.lastDownTime}</p>
                            <p className="text-sm text-gray-800 mt-0.5 font-bold">
                               Sent:{moment(mail.createdAt).format("ddd, MMMM Do YYYY, h:mm a")}
                            </p>
                            {
                                selectedIndex === index &&
                                <>
                                    <p className="text-sm text-gray-800 mt-0.5 font-bold">
                                        Up: {moment(upTime, "MMMM Do YYYY, h:mm a").format("ddd, MMMM Do YYYY, h:mm a")}
                                    </p>
                                    <p className="text-sm text-red-500 mt-0.5 font-bold">
                                        Duration: {getDuration(mail.createdAt, upTime)}
                                    </p>                                 
                                </>
                            }
                           
                            
                        </div>

                        {!loading ? 
                            <div className="flex flex-col gap-2">
                                <button onClick={() => getUptime(mail._id, mail.branchId, mail.router ,mail.lastDownTime, mail.ispName, index, mail.createdAt)}
                                    className="text-center text-white text-sm px-2 py-1 rounded-lg bg-green-900">
                                    Get Uptime
                                </button> 
                                {
                                    role=='Admin' &&
                                    <button onClick={() => deleteMail(mail._id)}
                                        className="text-center text-white text-sm px-2 py-1 rounded-lg bg-red-900">
                                        delete
                                    </button>                                    
                                }                               
                            </div>

                            : <p className="text-xs text-gray-400">processing</p>
                        }
                    </div>
                ))}
            </div>


        </div>
    );   

}