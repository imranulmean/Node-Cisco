import {
    Select,
    Label,
    TextInput
  } from "flowbite-react";
  import { useState, useEffect } from "react";
import Header from "../components/Header";
  
  export default function AddRouter(){
  
    const BASE_API=import.meta.env.VITE_API_BASE_URL;
    let sessionToken= localStorage.getItem('sessionToken')
    const isps = ['ALAP','BDCOM','LINK3','BRACNET','SQUARE','IOL','A.D.N','PCL','AMBER-IT', 'AGNI', 'KSNetwork'];
    const destinations = {
      legacy:{
        ALAP:'10.154.0.97',
        BDCOM:'10.154.0.33',
        LINK3:'10.154.1.233',
        BRACNET:'10.154.0.161',
        SQUARE:'10.154.1.161',
        IOL:'10.154.1.97',
        'A.D.N':'10.154.2.1',
        PCL:'10.154.2.129',
        'AMBER-IT':'10.154.1.33',
        'AGNI':'10.154.2.177',
        'KSNetwork' : '10.154.2.65' 
      },
      mikrotik:{
        ALAP:'10.154.0.97',
        BDCOM:'10.154.0.33',
        LINK3:'10.154.1.233',
        BRACNET:'10.154.0.161',
        SQUARE:'10.154.1.161',
        IOL:'10.154.1.97',
        'A.D.N':'10.154.2.1',
        PCL:'10.154.2.129',
        'AMBER-IT':'10.154.1.33',
        'AGNI':'10.154.2.177',
        'KSNetwork' : '10.154.2.65' 
      },
      sdwan:{
        ALAP:'10.41.209.214',
        BDCOM:'10.255.31.122',
        LINK3:'10.4.9.42',
        BRACNET:'172.35.85.50',
        SQUARE:'10.220.154.66',
        IOL:'10.100.22.2',
        'A.D.N':'10.168.227.46',
        PCL:'10.186.0.34',
        'AMBER-IT':'10.122.12.42',
        'AGNI' : '10.100.134.10',
        'KSNetwork' : '10.1.4.18' 
      }
    };    
    const branchTypes=['branch', 'sub']
    const authTypes = ['local','acs'];

    // const mikrotikList = ['no','yes'];  
    const routerTypes = ['legacy','sdwan','mikrotik'];
    const mikrotikList = { 'legacy': 'no', 'sdwan' : 'no', 'mikrotik' : 'yes' };
    const initialFileObject = {
        host: "",
        name: "",
        branchId: -1,
        branchType: "sub",
        authType: "local",
        routerType: "mikrotik",
        mikrotik: mikrotikList["mikrotik"],
      
        isp1Name: "ALAP",
        isp1Source: "",
        isp1Dest: destinations.legacy.ALAP,
      
        isp2Name: "BDCOM",
        isp2Source: "",
        isp2Dest: destinations.legacy.BDCOM,
      };    
    const [fileObject, setFileObject] = useState(initialFileObject);
    
    const [loading, setLoading] = useState(false);
    const [step, setStep]=useState(1);
    const [step1Loaded, setStep1Loaded]=useState(true)
    const [step2Loaded, setStep2Loaded]=useState(false)
    const [step3Loaded, setStep3Loaded]=useState(false)
    const [step4Loaded, setStep4Loaded]=useState(false)
    const [step5Loaded, setStep5Loaded]=useState(false)

    useEffect(() => {
        setFileObject(prev => ({
          ...prev,
          isp1Dest: destinations[prev.routerType][prev.isp1Name],
          isp2Dest: destinations[prev.routerType][prev.isp2Name],
          mikrotik: mikrotikList[prev.routerType]
        }));
      }, [fileObject.routerType, fileObject.isp1Name, fileObject.isp2Name]);

    
      const loadNextStep = () => {
        setStep(prev => {
          const nextStep = prev + 1;      
          switch (nextStep) {
            case 2:
              setStep2Loaded(true);
              break;
            case 3:
              setStep3Loaded(true);
              break;
            case 4:  setStep4Loaded(true);
                break;
            case 5:  setStep5Loaded(true);                
              break;
          }      
          return nextStep;
        });
      };
      
    const addRouter = async() => {
        setLoading(true);
      if(fileObject.host==="" || fileObject.name==="" || fileObject.branchId===-1 || fileObject.isp1Source==="" || fileObject.isp2Source==="" ){
        alert("Fileds can not be null")
        setLoading(false);        
        return;
      }
      
      try {
        const res = await fetch(`${BASE_API}/addRouter`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "authorization": sessionToken
             },
            body: JSON.stringify(fileObject)
        });

            const data = await res.json();
            alert(data.message)
        } catch (err) {
            alert(err);
        }finally{
            setLoading(false);
            setStep(1);
            setStep1Loaded(true);
            setStep2Loaded(false);
            setStep3Loaded(false);
            setStep4Loaded(false);
            setStep5Loaded(false);
            setFileObject(initialFileObject)
        }

    };
  
    return (
        <>
            <Header/>
            <div style={{'display':'flex', 'justify-content': 'center', 'align-items' : 'center'}}>
                <div className="w-[600px] p-4 border border-cyan-900 rounded-md mt-8">
                    <div className="mb-4 flex justify-center">
                        <span class="text-gray-900 self-center text-2xl text-heading font-semibold whitespace-nowrap border-b border-cyan-400">Add New Router</span>
                    </div>                    
                    {/* Step 1 */}
                    {
                        (step==1 || step1Loaded) &&
                        <div className="flex gap-4">
                            <TextInput placeholder="Branch ID" type="number" sizing="md" 
                                    onChange={(e)=> setFileObject(prev=>({
                                            ...prev,
                                            branchId: e.target.value
                                        }))}
                                        required />
                            <TextInput required placeholder="Branch Name" type="text" sizing="md" 
                                        onChange={(e)=> setFileObject(prev=>({
                                            ...prev,
                                            name: e.target.value
                                        }))}
                            />
                            <TextInput required placeholder="Router IP" type="text" sizing="md" 
                                    onChange={(e)=> setFileObject(prev=>({
                                        ...prev,
                                        host: e.target.value
                                    }))}                
                            />                           
                        </div>                        
                    }
                                
                    {/* Step 2 */}
                    {
                        (step == 2 || step2Loaded) &&
                        <div className="flex gap-4">
                            {/* branchType */}
                            <div className="w-full">
                                <Label>branchType</Label>
                                <Select required
                                    value={fileObject.branchType}
                                    onChange={(e)=> setFileObject(prev=>({
                                    ...prev,
                                    branchType: e.target.value
                                    }))}
                                >
                                    {branchTypes.map(i=>(
                                    <option key={i} value={i}>{i}</option>
                                    ))}
                                </Select>
                            </div>                
                            {/* authType */}
                            <div className="w-full">
                                <Label>authType</Label>
                                <Select required
                                    value={fileObject.authType}
                                    onChange={(e)=> setFileObject(prev=>({
                                    ...prev,
                                    authType: e.target.value
                                    }))}
                                >
                                    {authTypes.map(i=>(
                                    <option key={i} value={i}>{i}</option>
                                    ))}
                                </Select>
                            </div>

                            {/* routerType */}
                            <div className="w-full">
                                <Label>routerType</Label>
                                <Select required
                                    value={fileObject.routerType}
                                    onChange={(e)=> setFileObject(prev=>({
                                    ...prev,
                                    routerType: e.target.value
                                    }))}
                                >
                                    {routerTypes.map(i=>(
                                    <option key={i} value={i}>{i}</option>
                                    ))}
                                </Select>
                            </div>                                       
                        </div> 
                    }


                    {/* Step 3 */}
                    {/* ISP 1 Information*/}
                    {
                        (step==3 || step3Loaded) &&
                        <div className="flex gap-4">
                            <div className="w-full">
                                <Label>ISP 1</Label>
                                <Select required
                                    value={fileObject.isp1Name}
                                    onChange={(e)=> setFileObject(prev=>({
                                    ...prev,
                                    isp1Name: e.target.value
                                    }))}
                                >
                                    {isps.map(i=>(
                                    <option key={i} value={i}>{i}</option>
                                    ))}
                                </Select>
                            </div>
                            <div className="w-full">
                                <div className="block">
                                    <Label htmlFor="base">ISP 1 Source: </Label>
                                </div>
                                <TextInput value={fileObject.isp1Source} required id="base" placeholder="ISP1 Source" type="text" sizing="md" 
                                    onChange={(e)=> setFileObject(prev=>({
                                        ...prev,
                                        isp1Source: e.target.value
                                    }))}                    
                                />
                            </div>
                            <div className="w-full">
                                <div className="block">
                                    <Label htmlFor="base">ISP 1 Destination: </Label>
                                </div>
                                <span class="text-cyan-900 self-center text-xl text-heading font-semibold whitespace-nowrap">{fileObject.isp1Dest}</span>
                            </div>                           
                        </div>  
                    }
             

                    {/* Step 4 */}
                    {/* ISP 2 Information*/}
                    {
                        (step==4 || step4Loaded) &&
                        <div className="flex gap-4">
                            <div className="w-full">
                                <Label>ISP 2</Label>
                                <Select
                                    value={fileObject.isp2Name}
                                    onChange={(e)=> setFileObject(prev=>({
                                    ...prev,
                                    isp2Name: e.target.value
                                    }))}
                                >
                                    {isps.map(i=>(
                                    <option key={i} value={i}>{i}</option>
                                    ))}
                                </Select>                    
                            </div>
                            <div className="w-full">
                                <div className="block">
                                    <Label htmlFor="base">ISP 2 Source: </Label>
                                </div>
                                <TextInput value={fileObject.isp2Source} required id="base" placeholder="ISP2 Source" type="text" sizing="md" 
                                    onChange={(e)=> setFileObject(prev=>({
                                        ...prev,
                                        isp2Source: e.target.value
                                    }))}                    
                                /> 
                            </div>    
                            <div className="w-full">
                                <div className="block">
                                    <Label htmlFor="base">ISP 2 Destination: </Label>
                                </div>
                                <span class="text-cyan-900 self-center text-xl text-heading font-semibold whitespace-nowrap">{fileObject.isp2Dest}</span>
                            </div>                                                                        
                        </div>
                    }


                    {/* Step 5 */}                    
                    {/* mikrotik */}
                    {
                        (step==5 || step5Loaded) &&
                        <>
                            <div>
                                <Label>Is Mikrotik: </Label>
                                <span class="text-cyan-900 self-center text-md text-heading font-semibold whitespace-nowrap">{fileObject.mikrotik}</span>
                                {/* <Select required
                                    value={fileObject.mikrotik}
                                    onChange={(e)=> setFileObject(prev=>({
                                    ...prev,
                                    mikrotik: e.target.value
                                    }))}
                                >
                                    {mikrotikList.map(i=>(
                                    <option key={i} value={i}>{i}</option>
                                    ))}
                                </Select> */}
                            </div>            
                            <button
                                onClick={addRouter} disabled={loading}
                                className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-white"
                            >
                            Submit
                            </button>                         
                        </>                        
                    }   
                    {
                        step!=5 &&
                        <button
                            onClick={loadNextStep}
                            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-white">
                            Add New Row
                        </button>                                 
                    }                              
                </div>
            </div>        
        </>

    );
  }