import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import AdminHeader from "../../components/AdminHeader";

export default function ChangePassword(){

    const [updatedPass, setUpdatedPass] = useState();
    const [confirmPass, setConfirmPass] = useState();
    const [loading, setLoading]= useState(false);
    const navigate = useNavigate();
    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    const accessToken= localStorage.getItem('accessToken')
    const {_id: userId} = JSON.parse(localStorage.getItem('userInfo')) || "";

    const updateUser= async(userId)=>{
        if(!updatedPass || !userId || userId==="" || (updatedPass !== confirmPass)){
            alert("Empty Filed")
            return;
        }
        const obj={userId, updatedPass}
        setLoading(true);
        try {
            const res= await fetch(`${BASE_API}/administration/updateUser`,{
                method:"POST",
                headers: { 
                    "Content-Type": "application/json",
                    "authorization": accessToken
                 },
                body: JSON.stringify(obj)
            })
            const data= await res.json();
            alert(data.message);
        } catch (error) {
            alert(error)
        }
        finally{
            setLoading(false);
            setUpdatedPass('')
            localStorage.removeItem('accessToken')
            localStorage.removeItem('userInfo')
            navigate('/administration/login')            
        }

    } 

    return(
        <>
            <AdminHeader/>
            <div className="max-w-md p-4 m-auto flex flex-col gap-2">
                <input type="password"  onChange={(e)=>setUpdatedPass(e.target.value)} placeholder="new password"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:border-green-500"
                />
                <input type="password"  onChange={(e)=>setConfirmPass(e.target.value)} placeholder="Confirm Password"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:border-green-500"
                />
                {
                    updatedPass!==confirmPass &&
                    <p className="text-sm text-red-400">Passowrd not matching</p>
                }
                {/* save button */}
                {!loading
                    ? <button onClick={() => updateUser(userId)}
                        className="px-3 py-1.5 text-center border border-gray-300 rounded-lg text-xs hover:bg-gray-100">
                        Change Password
                    </button>
                    : <p className="text-xs text-gray-400">saving...</p>
                }            
            </div>
        </>    
    )
}