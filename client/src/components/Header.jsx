import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function Header(){

    let sessionToken= localStorage.getItem('sessionToken')
    let username = localStorage.getItem('username')
    const navigate = useNavigate();
    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    const location = useLocation();
    const [file, setFile]= useState([]);    

    useEffect(()=>{
        console.log(location);
      },[])    

    const logout = async ()=>{
        console.log("Clicked")
        try {
          const res = await fetch(`${BASE_API}/logout`,{
            method:"GET",
            headers: { 
              "Content-Type": "application/json",
              "authorization": sessionToken
           }
          });
          const data= await res.json();
          if(data.success){
            localStorage.removeItem('sessionToken')
            localStorage.removeItem('username')
            navigate('/login');
          }
    
        } catch (error) {
          alert(error)
        }
    
      }    


      const uploadPic = async () => {    
        const formData = new FormData();
        console.log(file);
        for (let i = 0; i < file.length; i++) {
          formData.append("uploadPic", file[i]);
          formData.append("username", 'imraunl');
        }
        try {
            const res = await axios.post(`${BASE_API}/uploadPic`,formData)
            if(res.data.success) window.location.reload();
      
        } catch (err) {
          console.error(err);
          alert(err);
        }
      };        
      
    return (
        <nav class="relative bg-cyan-900 sticky top-0 z-10 print:hidden">
            <div class="w-full px-2 sm:px-6 lg:px-8">
                <div class="relative flex h-16 items-center justify-between">
                    <div class="flex flex-1 items-center justify-between sm:items-stretch">
                        <div class="flex shrink-0 items-center gap-2">
                            <Link to="/" class="flex shrink-0 items-center gap-2">
                                {/* <img  src="/watchdog.png" alt="Your Company" class="h-8 w-auto" /> */}
                                <Avatar img="/watchdog.png" alt="avatar of Jese" rounded />
                                <span class="text-white self-center text-xl text-heading font-semibold whitespace-nowrap">The Manager</span>
                            </Link>
                            
                        </div>
                        <div class="sm:ml-6 sm:block">
                            <div class="flex space-x-4">
                                <Link to="/push-config" class={`rounded-md px-3 py-2 text-sm font-medium ${location.pathname==='/push-config'|| location.pathname==='/' ? 'text-white bg-white/5' : 'text-gray-300 hover:bg-white/5 hover:text-white'} `}>Push Config</Link>
                                <Link to="/monitoring" class={`rounded-md px-3 py-2 text-sm font-medium ${location.pathname==='/monitoring'? 'text-white bg-white/5' : 'text-gray-300 hover:bg-white/5 hover:text-white'} `}>Monitoring</Link>
                                {/* <Dropdown arrowIcon={true} label="Up Down Stats"
                                          class={`rounded-md text-sm font-medium ${location.pathname==='/up-down-stat' || location.pathname==='/monitoring'  ? 'text-white bg-white/5' : 'text-gray-300 hover:bg-white/5 hover:text-white'} `}
                                >
                                    <Dropdown.Item as={Link} to="/up-down-stat">
                                        Table
                                    </Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/monitoring">
                                        Monitoring
                                    </Dropdown.Item>                                    
                                    
                                </Dropdown>                                 */}
                                <Dropdown arrowIcon={true} label="Uploaded Files"
                                          class={`rounded-md text-sm font-medium ${location.pathname==='/backups'  ? 'text-white bg-white/5' : 'text-gray-300 hover:bg-white/5 hover:text-white'} `}
                                >
                                    <Dropdown.Item as={Link} to="/localfiles">
                                        Local File Uploader
                                    </Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/backups">
                                        Backups
                                    </Dropdown.Item>                                   
                                    
                                </Dropdown>
                                {/* <Dropdown arrowIcon={true} label="Reports"
                                          class={`rounded-md text-sm font-medium ${location.pathname==='/systemReport' || location.pathname==='/manualReport' || location.pathname==='/addDowntime' ? 'text-white bg-white/5' : 'text-gray-300 hover:bg-white/5 hover:text-white'} `}
                                >
                                    <Dropdown.Item>
                                        <Link to="/systemReport">System Report</Link>
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                        <Link to="/manualReport">Manual Report</Link>
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                        <Link to="/addDowntime">Add Downtime Report</Link>
                                    </Dropdown.Item>
                                </Dropdown>  */}
                                <Dropdown arrowIcon={true} label="Other Web Devices/Links"
                                          class='rounded-md text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white'
                                >
                                    <div className="h-[450px] overflow-y-auto">
                                        <Dropdown.Item as="a"
                                            href="https://172.17.20.46/admin/login.jsp"
                                            target='_blank'  
                                        >
                                            ISE
                                        </Dropdown.Item>                                    
                                        <Dropdown.Item as="a"                                         
                                            href="https://172.30.2.40:8443/web_security_manager/authentication/identities"
                                            target='_blank'
                                        >
                                            Branch WSA 1
                                        </Dropdown.Item>
                                        <Dropdown.Item as="a"
                                            href="https://172.30.2.41:8443/web_security_manager/authentication/identities"
                                            target='_blank'    
                                        >
                                            Branch WSA 2
                                        </Dropdown.Item>
                                        <Dropdown.Item as="a"
                                            href="https://172.17.20.50/prod/web/12_5/web_security_manager/authentication/identities"
                                            target='_blank'    
                                        >
                                            HO WSA Manager
                                        </Dropdown.Item>
                                        <Dropdown.Item as="a"
                                                href="https://172.30.2.61:8443/login?referrer=https%3A%2F%2F172.30.2.61%3A8443%2Fweb_security_manager%2Fauthentication%2Fidentities"
                                                target='_blank'    
                                        >
                                            HO WSA Appliance 1
                                        </Dropdown.Item>
                                        <Dropdown.Item as="a"
                                                href="https://172.30.2.62:8443/login?referrer=https%3A%2F%2F172.30.2.62%3A8443%2Fweb_security_manager%2Fauthentication%2Fidentities"
                                                target='_blank'    
                                        >
                                            HO WSA Appliance 2
                                        </Dropdown.Item>
                                        <Dropdown.Item as="a"
                                                href="http://172.30.3.103/screens/frameset.html"
                                                target='_blank'    
                                        >
                                            WLC
                                        </Dropdown.Item>
                                        <Dropdown.Item as="a"
                                                href="https://172.30.2.51/#/app/dashboard"
                                                target='_blank'    
                                        >
                                            VManage
                                        </Dropdown.Item>
                                        <Dropdown.Item as="a"
                                                href="https://172.22.31.5/ccmadmin"
                                                target='_blank'    
                                        >
                                            CUCM
                                        </Dropdown.Item>  
                                        <Dropdown.Item as="a"
                                                href="http://172.22.4.45:5173"
                                                target='_blank'    
                                        >
                                            IP Phone List
                                        </Dropdown.Item>
                                        <Dropdown.Item as="a"
                                                href="http://mrtg.aibl.com.bd:8088/cacti/index.php?aibplcmrtg/AiblMrtg786"
                                                target='_blank'
                                        >
                                            MRTG
                                        </Dropdown.Item>
                                        <Dropdown.Item as="a"
                                                href="https://docs.google.com/spreadsheets/d/1RbvbE1ILEB30Ia5rCnOGHY4Xb5qMJFMP/edit?gid=1806638125#gid=1806638125"
                                                target='_blank'
                                        >
                                            Wifi user List
                                        </Dropdown.Item>
                                        <Dropdown.Item as="a"
                                                href="https://docs.google.com/spreadsheets/d/18yEhEIP1z1G4ITmms_zU_TWbo41qDq8si1RV52OfFYg/edit?gid=1657201219#gid=1657201219"
                                                target='_blank'
                                        >
                                            Main Drive
                                        </Dropdown.Item>
                                        <Dropdown.Item as="a"
                                                href="http://172.23.1.21:8080/ndmrs/login.php"
                                                target='_blank'
                                        >
                                            Downtime report
                                        </Dropdown.Item>
                                        <Dropdown.Item as="a"
                                                href="http://172.23.1.28:5173/ipscan"
                                                target='_blank'
                                        >
                                            IP Scanner
                                        </Dropdown.Item>
                                        <Dropdown.Item as={Link} to="/dhcpIpScan"
                                        >
                                            DHCP IP Scanner
                                        </Dropdown.Item>  
                                    </div>
                                       
                                </Dropdown>                                                                                               
                                {/* <Link to="/addRouter" class={`rounded-md px-3 py-2 text-sm font-medium ${location.pathname==='/addRouter'? 'text-white bg-white/5' : 'text-gray-300 hover:bg-white/5 hover:text-white'} `}>Add Router</Link> */}
                                {/* <Link to="/getRouterSessions" class={`rounded-md px-3 py-2 text-sm font-medium ${location.pathname==='/getRouterSessions'? 'text-white bg-white/5' : 'text-gray-300 hover:bg-white/5 hover:text-white'} `}>Router Logs</Link> */}
                            </div>
                        </div>
                    </div>
                    <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        <Dropdown arrowIcon={false} inline 
                                  label={
                                    // <Avatar alt='user' img={'https://flowbite.com/docs/images/people/profile-picture-5.jpg'} rounded />
                                    <Avatar alt='user' rounded />
                                }
                        >
                            <Dropdown.Header>
                                <span className="block text-sm">Logged in as </span>
                                <span className="block truncate text-sm font-medium">{username}</span>
                            </Dropdown.Header>
                            <Dropdown.Divider />
                            <Dropdown.Item as={Link} to="/findmatches">
                                Ip Match
                            </Dropdown.Item>
                            <Dropdown.Item as={Link} to="/saveToDb">
                                Save Downtime Auto
                            </Dropdown.Item>  
                            <Dropdown.Item as={Link} to="/addDowntime">
                                Save Downtime Excel
                            </Dropdown.Item> 
                            <Dropdown.Item as={Link} to="/automaticReport">
                                Automatic Report
                            </Dropdown.Item> 
                            <Dropdown.Item as={Link} to="/manualReport">
                                Manual Report
                            </Dropdown.Item>                                                                                                                
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </nav>
      ); 
}