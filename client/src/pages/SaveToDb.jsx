import { useState, useEffect } from "react";
import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import Header from "../components/Header";

export default function SaveToDB(){
    
    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    const [downtimeFiles, setDowntimeFiles]= useState([]);
    const [fileName, setFileName]= useState('');
    const [loading, setLoading]= useState(false);

    useEffect(()=>{
        getDowntimeFiles();
    },[])

    const getDowntimeFiles= async() =>{
        const res = await fetch(`${BASE_API}/getDowntimeFiles`);
        const data= await res.json();
        setDowntimeFiles(data.downtimeFiles)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();   
        if(!fileName){
            alert("Fields cannot be null")
            return;
        }
        const obj={fileName};
        setLoading(true);
        try {
            const res= await fetch(`${BASE_API}/saveToDb`,{
                method:"POST",
                headers: { 
                    "Content-Type": "application/json"
                 },
                body: JSON.stringify(obj)
            })
            const data= await res.json();
            if(!data.success){
                alert(data.error);
                return
            }
            if(res.ok){
                alert(data.message);
            }            
        } catch (error) {
            alert(error)
        }
        finally{
            setLoading(false);
        }
      };        

    return(
        <>
            <Header/>
            <div className="p-4 flex flex-col gap-2">
                <div className="flex gap-2">
                    {
                        downtimeFiles.map((file)=>{
                            return(
                                <p>{file.filleName}|</p>
                            )
                        })
                    }
                </div>

                <form className="flex max-w-md flex-col gap-4" onSubmit={handleSubmit}>
                    <div>
                        <TextInput onChange={(e)=>setFileName(e.target.value)} id="email1" type="text" placeholder="File Name" required/>
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
        </>

    )
}