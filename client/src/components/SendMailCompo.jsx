import { useEffect, useRef, useState } from "react";
import { Accordion, AccordionContent, AccordionPanel, AccordionTitle  } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import moment from 'moment';
import Swal from 'sweetalert2';

function List({tableId, tableName, mailList, sendMailList, handleCheckbox, showCheckbox, contactPersonNums, handleInputChange, contactArray, selectedIndex, sessionToken}){

    // {d.branchId}: {d.router}
    const [modes, setModes]=useState({router:'Name', branchId:'ID'})
    const [queryMode, setQueryMode]= useState('router');
    const [queryString, setQueryString]= useState("");
    const filteredList=mailList.length > 0 ? mailList.filter((mail)=>{
        if(queryString==="") return true;
        if(queryMode==='branchId') mail[queryMode] = mail[queryMode].toString();
        return mail[queryMode].toLowerCase().includes(queryString.toLowerCase());
    }) : [];

    return(
        <>                
            <div className="">
                <p className="text-cyan-900 text-center"><b>{tableName}: {mailList.length}</b></p>
                <table id={`${tableId}`} class="cell-border display compact">
                    <thead>
                        <tr>
                            <th>Branch</th>
                            <th>Info</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        mailList.map((d, index)=>{ 
                            return(
                                <tr>
                                    <td className="w-1/2">
                                        <div className="">
                                            {
                                                showCheckbox && sessionToken &&
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        id={`pending-${index}`}
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={sendMailList.some(r => r.branchId === d.branchId && r.ispName === d.ispName )}
                                                        onChange={(e) => handleCheckbox(e, d, index)}
                                                    />
                                                    <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                                                </label>                                                
                                            }
                                            <span className="text-sm text-center ml-2"><b>{d.branchId}: {d.router}</b></span>
                                            { 
                                                showCheckbox && sessionToken &&
                                                <input type="text" value={contactPersonNums[`${d.branchId}-cp-${d.ispName}`] ?? ''}
                                                        onChange={(e) => handleInputChange(`${d.branchId}-cp-${d.ispName}`, e.target.value)}
                                                        id={`${d.branchId}-cp-${d.ispName}`} placeholder="Branch Number" 
                                                       className="block w-full px-3 py-2.5 bg-white-200 border border-gray-400 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 outline:none" />
                                            }
                                            {
                                                (showCheckbox && contactArray.length>0 && selectedIndex === index) &&
                                                <Accordion>
                                                    <AccordionPanel>
                                                    <AccordionTitle className="text-xs text-green-900 p-2">Numbers</AccordionTitle>
                                                    <AccordionContent className="h-[100px] overflow-auto p-2"> 
                                                        {
                                                            contactArray.map((cont, index2)=>(
                                                                <p className="text-xs mt-1 text-green-900 font-semibold">
                                                                    <input 
                                                                        id={`pending-${index}-contact-${index2}`}
                                                                        type="checkbox" className="w-4 h-4 accent-green-700 cursor-pointer outline-none focus:outline-none focus:ring-0 mr-1"
                                                                        onChange={(e) => {
                                                                            const key = `${d.branchId}-cp-${d.ispName}`;
                                                                            if (e.target.checked) {
                                                                                const current = contactPersonNums[key] || '';
                                                                                const newValue = current ? `${current}, ${cont['Mobile']}` : cont['Mobile'];
                                                                                handleInputChange(key, newValue);
                                                                            } else {
                                                                                const current = contactPersonNums[key] || '';
                                                                                const newValue = current.split(', ').filter(n => n !== cont['Mobile']).join(', ');
                                                                                handleInputChange(key, newValue);
                                                                            }
                                                                        }}                                                                   
                                                                    /> 
                                                                    {cont['Site Name']}, {cont['Designation']}, {cont['Mobile']}
                                                                </p>
                                                            ))
                                                        }
                                                    </AccordionContent>
                                                    </AccordionPanel>
                                                </Accordion>
                                            }                                              
                                        </div>
                                    </td>
                                    <td className="w-1/2">
                                        <div className="flex flex-col">
                                            <p className="text-sm text-center">{d.ispName}</p>
                                            <p className="text-sm text-center">{d.lastDown}</p>
                                            <p className="text-sm text-center">{d.lastDownTime}</p>                                        
                                            <p className="text-sm text-center">{d.email}</p>                                          
                                            {
                                                d.createdAt && 
                                                <>
                                                    <p className="text-sm text-center">
                                                        <b>Sent:</b> {moment(d.createdAt).format("MMMM Do YYYY, h:mm a")}
                                                    </p>
                                                    {/* <p className="text-sm text-center">
                                                        By: {d.sentBy}
                                                    </p>                                                  */}
                                                </>                                               
                                            }
                                        </div>                                    
                                    </td>                                    
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

export default function SendMailCompo({mainData, branches, subBranches, socketRef}){

    const [sessionToken, setSessionToken]= useState(localStorage.getItem('sessionToken'));
    let mailList=[];
    const [finalList, setFinalList] = useState([]);
    const [sendMailList, setSendmailList] = useState([]);
    const [getSentMailList, setGetSentMailList]= useState([]); 
    const [newMailList, setNewMailList]= useState([]);
    const [loading, setLoading] = useState(false);
    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const [contactPersonNums, setContactPersonNums] = useState({});
    const [branchContacts, setBranchContacts] = useState([]);
    const [contactArray, setContactArray] = useState([]);
    const [selectedIndex, setSelectedIndex]= useState();

    

    const handleInputChange = (key, value) => {
        setContactPersonNums(prev => ({ ...prev, [key]: value }));
    };

    const emails={
        'ALAP':'callcenter@accesstel.net',
        'Alap': 'callcenter@accesstel.net',
        'BDCOM':'helpdesk@bdcom.com',
        'Bdcom' : 'helpdesk@bdcom.com',
        'LINK3':'services@link3.net',
        'BRACNET':'support@bracmail.net',
        'SQUARE':'support.data@squaregroup.com',
        'IOL':'sc@iolbd.net',
        'A.D.N':'support@adnsl.net',
        'PCL': 'noc@pmcon.net',
        'AMBER-IT': 'support@amberit.com.bd',
        'AGNI': 'customer.care@agni.com',
        'KSNetwork': 'support@ksnetworkbd.com'
    }  
    // mainData      
    useEffect(()=>{ 
        socketRef.current.on("mail-sent", (data) => {
            initialize();
        });        

        initialize();
        getBranchContacts();
        checkSession();        
      
    },[]);

    const checkSession = async ()=>{
        
        try {
            if(!sessionToken) return;
            const res = await fetch(`${BASE_API}/checkSession/${sessionToken}`);
            const data = await res.json();
            if(!data.success) {
                setSessionToken('');
                localStorage.removeItem('sessionToken')                
            }
        } catch (error) {
            alert(error)
        }

        
    }    

    const getBranchContacts= async() =>{
        const res = await fetch(`${BASE_API}/getBranchContacts`);
        const data= await res.json();
        setBranchContacts(data.branchContact);
    }
    const initTable = (id, data) => {
        if (data.length === 0) return;
        if ($.fn.dataTable.isDataTable(id)) {
            $(id).DataTable().destroy();
        }
        new DataTable(id, {
            paging: false,
            scrollCollapse: false,
            // scrollY: '50vh'
        });        
    };    
    useEffect(() => {
        initTable('#finalListTable', finalList)
    }, [finalList]);
    
    useEffect(() => {
        initTable('#sentListTable', getSentMailList);
    }, [getSentMailList]);
    
    useEffect(() => {
        initTable('#newListTable', newMailList)
    }, [newMailList]);

    const initialize =  async()=>{        
        mailList=[];
        createMailList(branches);
        createMailList(subBranches);
        setFinalList(mailList);
        getSentMails(mailList);                        
    }
    const getSentMails = async(currentList) =>{
        try {
            setLoading(true);
            const res = await fetch(`${BASE_API}/getSentMails`);
            const data= await res.json();
            const resData=data.data;

            const newMailArray = currentList.filter(
                (item) => !resData.some((sent) => sent.branchId === item.branchId && sent.ispName === item.ispName && sent.lastDownTime === item.lastDownTime )
            );
            setNewMailList(newMailArray);
            setGetSentMailList(resData)            
          } catch (error) {
            console.log(error);
          }
          finally{
            setLoading(false);
            setSelectedIndex(-1)
            setSendmailList([]);
          }
    }

    const createMailList = (branchList) =>{
        branchList.map(branch => {
            const branchType= branch.branchType==='branch' ? 'Branch' : 'Sub Branch'
            if(branch.isp1LastDownTimeMins && branch.isp1LastDownTimeMins>5){     
                let branchObj={
                    branchId:branch.branchId, 
                    router:`${branch.router} ${branchType}`, 
                    host:branch.host,
                }                
                branchObj['ispName']=branch.isp1Name.trim();
                branchObj['lastDown']=branch.isp1LastDownTime;
                branchObj['lastDownTime'] = branch.isp1DownTimes[branch.isp1DownTimes.length-1];
                branchObj['email'] = emails[branch.isp1Name];
                mailList.push(branchObj);
            }

            if(branch.isp2LastDownTimeMins && branch.isp2LastDownTimeMins>10){
                let branchObj={
                    branchId:branch.branchId, 
                    router:`${branch.router} ${branchType}`, 
                    host:branch.host,
                }                
                branchObj['ispName']=branch.isp2Name.trim();
                branchObj['lastDown']=branch.isp2LastDownTime;
                branchObj['lastDownTime'] = branch.isp2DownTimes[branch.isp2DownTimes.length-1];
                branchObj['email'] = emails[branch.isp2Name];
                mailList.push(branchObj);
            }            
        });        
    }

    const handleCheckbox = (e, router, index) => {
        if (e.target.checked) {
            setSendmailList((prev) => [...prev, router]);
            let parsedbranchName = router.router.split(' ')[0].trim();
            // parsedbranchName= parsedbranchName.toLowerCase().substring(0,6)
            const tempContacts=branchContacts.filter((contact)=>{
                let siteName=contact['Site Name'].split(' ')[0].trim();
                // siteName= siteName.toLowerCase().substring(0,6)
                if(siteName.includes(parsedbranchName)){
                    // console.log( contact['Designation'],contact['Site Name'], contact['Mobile'])
                    return contact
                }
            })
            setSelectedIndex(index)
            setContactArray(tempContacts)
        } else {
            setSelectedIndex(-1)
            let updatedList=[];
            for(let i=0; i< sendMailList.length; i++){
                if( sendMailList[i].branchId!==router.branchId || sendMailList[i].ispName!==router.ispName){
                    updatedList.push(sendMailList[i]);
                }                
            }
            setSendmailList(updatedList)
        }
      };    

    const sendMail = async()=>{

        if(sendMailList.length<1){
            alert("Please Select");
            return;
        }
        const sendMailListModified= [];
        // <input type="text" id={`${d.branchId}-cp-${d.ispName}`} placeholder="Branch Number" 
        for(let i=0; i< sendMailList.length; i++){
            let obj= sendMailList[i];
            // obj["contactPerson"]=document.getElementById(`${sendMailList[i].branchId}-cp-${sendMailList[i].ispName}`).value || '';
            obj["contactPerson"]=contactPersonNums[`${sendMailList[i].branchId}-cp-${sendMailList[i].ispName}`] || '';
            sendMailListModified.push(obj)
        }
        setLoading(true);
        // Swal.fire({
        //     icon: "error",
        //     title: "Oops...",
        //     text: "Service Unavailable",
        //     confirmButtonColor: "#000000",
        //   });
        
        try {
            const res = await fetch(`${BASE_API}/sendMail`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "authorization": sessionToken
                 },
                body: JSON.stringify(sendMailListModified)
            });
    
            const data = await res.json();
            console.log(data.success)
            // alert(data.message);
            if(!data.success){
                Swal.fire({
                    icon: "error",
                    title: "Failed",
                    text: `${data.message}`,
                    confirmButtonColor: "#000000",
                });                 
            }
            else{
                Swal.fire({
                    icon: "success",
                    title: "Success..",
                    text: `${data.message}`,
                    confirmButtonColor: "#000000",
                }); 
            }
           
            if(data.message==='No token' || data.message==='Invalid token'){
                localStorage.removeItem('sessionToken')
                localStorage.removeItem('username')
                navigate('/login')
            }
    
        } catch (err) {
            alert(err.message);
            
        }finally{
            setLoading(false);
            setSendmailList([]);
            initialize();
        }
    }

    const selectAllPending = () => {

        if (sendMailList.length === newMailList.length) {
            setSendmailList([]);
            setContactPersonNums({});
            setSelectedIndex(-1);
            setContactArray([]);
            return;
        }        
        const selected = [];
        const numbers = {};
    
        newMailList.forEach((router) => {
            selected.push(router);
    
            const parsedBranch = router.router.split(" ")[0].trim();
    
            const contacts = branchContacts.filter(contact => {
                const site = contact["Site Name"].split(" ")[0].trim();
                return site.includes(parsedBranch);
            });
    
            numbers[`${router.branchId}-cp-${router.ispName}`] =
                contacts.map(c => c.Mobile).join(", ");
        });

        setSendmailList(selected);
        setContactPersonNums(numbers);
    };

    return(
        <div className="">
            <div className="flex gap-2 justify-center">
                <div className="h-[400px] overflow-y-auto w-1/3 border border-cyan-900 p-2 rounded-lg">
                    <List key={JSON.stringify(finalList)} tableId={'finalListTable'} tableName={'Full List'} mailList={finalList} sendMailList={sendMailList} handleCheckbox={handleCheckbox} showCheckbox={false}
                          contactPersonNums={contactPersonNums} handleInputChange={handleInputChange}  />
                </div>
                {/* Mail Sent List */}
                <div className="h-[400px] overflow-y-auto w-1/3 border border-cyan-900 p-2 rounded-lg">
                    <List key={JSON.stringify(getSentMailList)} tableId={'sentListTable'} tableName={'Already Sent'} mailList={getSentMailList} sendMailList={sendMailList} handleCheckbox={handleCheckbox} showCheckbox={false}
                          contactPersonNums={contactPersonNums} handleInputChange={handleInputChange}  />
                </div> 
               {/* New Mail List */}
               <div className="w-1/3 flex flex-col gap-2">
                    <div className="h-[400px] overflow-y-auto w-full border border-cyan-900 p-2 rounded-lg">                        
                        <List key={JSON.stringify(newMailList)} tableId={'newListTable'} tableName={'New List'} mailList={newMailList} sendMailList={sendMailList} handleCheckbox={handleCheckbox} showCheckbox={true}
                              contactPersonNums={contactPersonNums} handleInputChange={handleInputChange} selectedIndex={selectedIndex} contactArray = {contactArray} 
                              sessionToken={sessionToken}  />
                    </div>
                    {
                        !loading &&
                        <button onClick={initialize}
                            className="w-full rounded-lg border border-gray-300 bg-gray-900 px-4 py-2  text-center text-sm font-medium text-white">
                            Refresh
                        </button>                         
                    }
                   
                    {
                        (sessionToken && !loading) &&
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2">
                                <label>Select All:</label>
                                <input type='checkbox' onChange={selectAllPending} />                                
                            </div>                                                           
     
                            <button onClick={sendMail} disabled={loading}
                                className="flex-1 rounded-lg border border-gray-300 bg-green-900 px-4 py-2  text-center text-sm font-medium text-white">
                                Send Mail
                            </button>                            
                        </div>                                    
                    }
                    {
                        (!loading && !sessionToken) &&
                        <button onClick={()=>{ navigate('/login') }}
                            className="w-full rounded-lg border border-gray-300 bg-green-900 px-4 py-2 text-center text-sm font-medium text-white">
                            Login To Send
                        </button>               
                    }            
                    {
                        loading &&
                        <button disabled={loading}
                            className="flex-1 rounded-lg border border-gray-300 bg-green-900 px-4 py-2  text-center text-sm font-medium text-white">
                            Processing Data ...
                        </button>           
                    } 
               </div>                               
            </div>
        </div>
    )
}