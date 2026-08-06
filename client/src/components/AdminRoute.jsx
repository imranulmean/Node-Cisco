import { useState } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';

export default function AdminRoute() {

    const navigate = useNavigate();
    const accessToken = localStorage.getItem('accessToken')
    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    // check if sessionToken is valid or not
    const checkToken = async ()=>{        
        try {
            const res = await fetch(`${BASE_API}/administration/checkToken`,{
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    "authorization": accessToken
                 },
            });
            const data = await res.json();
            if(!data.success) {
                alert(data.message)
                localStorage.removeItem('accessToken')
                localStorage.removeItem('userInfo')
                navigate('/administration/login');
                return
            }
        } catch (error) {
            alert(error)
        }

        
    }
    checkToken();  
    // useState(()=>{
    //     checkSession();
    // })

    return accessToken ? <Outlet /> : <Navigate to='/administration/login' />;
  }