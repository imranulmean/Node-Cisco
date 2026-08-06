import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';



export default function PrivateRoute() {

    const navigate = useNavigate();
    const sessionToken = localStorage.getItem('sessionToken')
    const [validSession, setValidSession]=useState(true);
    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    console.log("Pricve arouter")
    // check if sessionToken is valid or not
    const checkSession = async ()=>{
        
        try {
            const res = await fetch(`${BASE_API}/checkSession/${sessionToken}`);
            const data = await res.json();
            if(!data.success) {
                alert(data.error)
                navigate('/login');
                return
            }
        } catch (error) {
            alert(error)
        }

        
    }
    checkSession();  
    // useState(()=>{
    //     checkSession();
    // })

    return sessionToken ? <Outlet /> : <Navigate to='/login' />;
  }