import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function AdminHeader(){

    let accessToken= localStorage.getItem('accessToken')
    let {username, role} = JSON.parse(localStorage.getItem('userInfo')) || {} ;
    const navigate = useNavigate();
    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    const location = useLocation();

    useEffect(()=>{
        console.log(location);
      },[])    

    const logout = async ()=>{
        console.log("Clicked")
        localStorage.removeItem('accessToken')
        localStorage.removeItem('userInfo')
        navigate('/administration/login');    
      }    
    
      
    return (
        <nav class="relative bg-cyan-900 sticky top-0 z-10 print:hidden">
            <div class="w-full px-2 sm:px-6 lg:px-8">
                <div class="relative flex h-16 items-center justify-between">
                    <div class="flex flex-1 items-center justify-between sm:items-stretch">
                        <div class="flex shrink-0 items-center gap-2">
                            <Link to="/administration/dashboard" class="flex shrink-0 items-center gap-2">
                                {/* <img  src="/watchdog.png" alt="Your Company" class="h-8 w-auto" /> */}
                                <Avatar img="/watchdog.png" alt="avatar of Jese" rounded />
                                <span class="text-white self-center text-xl text-heading font-semibold whitespace-nowrap">The Manager</span>
                            </Link>
                            
                        </div>
                        <div class="sm:ml-6 sm:block">
                            <div class="flex space-x-4">
                                <Dropdown arrowIcon={true} label="Reports"
                                          class={`rounded-md text-sm font-medium ${location.pathname==='/systemReport' || location.pathname==='/manualReport' || location.pathname==='/addDowntime' ? 'text-white bg-white/5' : 'text-gray-300 hover:bg-white/5 hover:text-white'} `}
                                > 
                                    <Dropdown.Item as={Link} to="/automaticReport">
                                        Automatic Report
                                    </Dropdown.Item> 
                                    <Dropdown.Item as={Link} to="/manualReport">
                                        Manual Report
                                    </Dropdown.Item>   
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                    <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        <Dropdown arrowIcon={false} inline 
                                  label={
                                    <Avatar alt='user' rounded />
                                }
                        >
                            <Dropdown.Header>
                                <span className="block text-sm">Logged in as </span>
                                <span className="block truncate text-sm font-medium">{username}</span>
                                <span className="block truncate text-sm font-normal">{role}</span>                                
                            </Dropdown.Header>                                                                                                             
                            <Dropdown.Divider />
                            <Dropdown.Item as={Link} to='/administration/changePassword'>Change Password</Dropdown.Item>
                            <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </nav>
      ); 
}