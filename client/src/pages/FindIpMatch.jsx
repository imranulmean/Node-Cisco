import { Textarea, TextInput } from "flowbite-react";
import { useState } from "react";

export default function FindIpMatch(){

    const [allIp, setAllIp]= useState('');
    const [pattern, setPattern] = useState('');
    const [matchedIPs, setMatchedIps] = useState([]);

    const findMatches = () =>{
        const ipArray = allIp.split(',').map(ip => ip.trim());
        // const pattern = /^192\.168\.26\.\d+$/;    
        const prefix = pattern; // e.g., "192.168.26"
        const escapedPrefix = prefix.replace(/\./g, '\\.'); 
        const finalRegex = new RegExp(`^${escapedPrefix}\\.\\d+$`)
        const ips=ipArray.filter(ip => finalRegex.test(ip));
        setMatchedIps(ipArray.filter(ip => finalRegex.test(ip)));
        
    }

    return(
        <div className="flex flex-col gap-4 items-center p-4">
            <Textarea onChange={(e)=> setAllIp(e.target.value)} required rows={10} />
            <TextInput placeholder="Set Pattern 192.168.26" type="text" sizing="md" 
                    onChange={(e)=> setPattern(e.target.value) }
                        required />            
            <button onClick={findMatches}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-gray-900 px-4 py-2 text-center text-sm font-medium text-gray-100 hover:bg-blue-900">
                Find Match
            </button>
            <p>Total {matchedIPs.length}</p>
            {matchedIPs.join(',  ')}
        </div>        
    )
}