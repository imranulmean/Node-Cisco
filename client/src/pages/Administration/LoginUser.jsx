import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';

export default function LoginUser(){

    const [username, setUsername]=useState('');
    const [password, setPassword]=useState('');
    const [loading, setLoading]= useState(false);
    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();        
        if(!username || !password){
            alert("Fields cannot be null")
            return;
        }
        const obj={username, password};
        setLoading(true);
        try {
            const res= await fetch(`${BASE_API}/administration/loginUser`,{
                method:"POST",
                headers: { 
                    "Content-Type": "application/json"
                 },
                body: JSON.stringify(obj)
            })
            const data= await res.json();
            if(!data.success){
                alert(data.message);
                localStorage.removeItem('accessToken')
                return;
            }
            localStorage.setItem('accessToken', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data.rest));
            navigate('/administration/dashboard');

            
        } catch (error) {
            alert(error)
        }
        finally{
            setLoading(false);
        }
      };    

    return(
        <div className="flex flex-col w-full h-[100vh]" 
            style={{'justify-content': 'center', 'align-items': 'center', 'background':'url(/login-bg-new.jpg)', 'background-repeat': 'no-repeat', 'background-position': 'center', 'background-size': 'cover' }}>
            <div className="w-[500px] bg-white p-10 rounded-lg">
                <div className="flex justify-center">
                    <img  src="/watchdog.png" alt="Your Company" class="h-[10rem] w-auto" />
                    <span class="text-cyan-900 self-center text-3xl text-heading font-semibold whitespace-nowrap">The Manager</span>
                </div>
                <form className="flex max-w-md flex-col gap-4" onSubmit={handleSubmit}>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="email1">Username: </Label>
                        </div>
                        <TextInput onChange={(e)=>setUsername(e.target.value)} id="email1" type="text" placeholder="User ID" required 
                         style={{'border':'none', 'border-radius':'0px', 'border-bottom':'1px solid #E5E7EB', 'background':'white', 'box-shadow':'none'}} 
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                        <Label htmlFor="password1">Password</Label>
                        </div>
                        <TextInput onChange={(e)=>setPassword(e.target.value)} id="password1" type="password" placeholder="Password" required 
                         style={{'border':'none', 'border-radius':'0px', 'border-bottom':'1px solid #E5E7EB', 'background':'white', 'box-shadow':'none'}} 
                        />
                    </div>                  
                    {
                        loading && <h1>Processing ...</h1>
                    }
                    {
                        !loading &&
                        <button disabled={loading} type="submit" className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-gray-900 px-4 py-2 text-center text-sm font-medium text-gray-100 hover:bg-cyan-900">Submit</button>
                    }
                </form>
            </div>
        </div>

    )
}