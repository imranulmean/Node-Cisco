import * as IpSubnetCalculator from 'ip-subnet-calculator';
import ping from 'ping';
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import SftpClient from "ssh2-sftp-client";

// Helper function to generate all IP addresses in a range
function generateIpRange(minIpStr, maxIpStr) {
    const minIp = IpSubnetCalculator.toDecimal(minIpStr);
    const maxIp = IpSubnetCalculator.toDecimal(maxIpStr);
    const ipArray = [];

    // Skip network ID and broadcast address
    for (let i = minIp + 1; i < maxIp; i++) {
        ipArray.push(IpSubnetCalculator.toString(i));
    }
    return ipArray;
}

// Helper to process pings in limited batch sizes
async function pingInBatches(ipList, batchSize = 30) {
    const liveHosts = [];

    for (let i = 0; i < ipList.length; i += batchSize) {
        const batch = ipList.slice(i, i + batchSize);
        
        const promises = batch.map(async (ip) => {
            const result = await ping.promise.probe(ip.trim(), { timeout: 1 })
            
            if (result.alive) {
                return {
                    ip: ip,
                    time: result.time !== 'unknown' ? `${result.time}ms` : '0ms'
                };
            }
            return null;
        });

        const batchResults = await Promise.all(promises);
        liveHosts.push(...batchResults.filter(host => host !== null));
    }
    
    return liveHosts;
}

// Execute the scan
export const ipscan = async(req, res) =>{
    try{
        const{ network , subnetMask, secretCode} = req.params;
        if(!secretCode || secretCode.trim() !== 'aiblhw'){
            return res.json({success: false, message:"Wrong Secret"});
        }
        const calculated = IpSubnetCalculator.calculateCIDRPrefix(network.trim(), subnetMask.trim());
        const ipList = generateIpRange(calculated.ipLowStr, calculated.ipHighStr);        
        const liveHosts = await pingInBatches(ipList, 30);
        res.json({success: true, liveHosts});
      }
      catch(err){
        res.json({success: false, message:"Erorr............"});
      }    
}

export const dhcpIpScan = async(req, res)=>{
    try {

        const inputFile = "public/localFolder/dhcpd.conf";
        const data= readFileSync(inputFile, 'utf8').split(/\r?\n/);
        let mappedData=[];

        for (let index = 0; index < data.length; index++) {

            const trimmed = data[index].trim();
        
            // Must start with #
            if (!trimmed.startsWith("#")) {
                continue;
            }
        
            // Ignore option comments
            if (trimmed.toLowerCase().includes("option")) {
                continue;
            }
        
            // Remove # only for checking
            const parsed = trimmed.replace(/^#\s*/, "");
        
            // These can NEVER be a name
            if (
                parsed.toLowerCase().startsWith("host ") ||
                parsed.toLowerCase().startsWith("hardware ethernet") ||
                parsed.toLowerCase().startsWith("fixed-address") ||
                parsed === "}" ||
                parsed.startsWith("{")
            ) {
                continue;
            }
        
            // ------------------------------------------------
            // Find the NEXT meaningful line
            // ------------------------------------------------
        
            let nextIndex = index + 1;
        
            while (
                nextIndex < data.length &&
                data[nextIndex].trim() === ""
            ) {
                nextIndex++;
            }
        
            if (nextIndex >= data.length) {
                continue;
            }
        
            const nextLine = data[nextIndex].trim();
        
            // Remove # for checking
            const nextParsed = nextLine.replace(/^#\s*/, "");
        
            // ------------------------------------------------
            // The VERY NEXT meaningful line must be HOST
            // ------------------------------------------------
        
            if (!nextParsed.toLowerCase().startsWith("host ")) {
                continue;
            }
        
            // ------------------------------------------------
            // We now know this is a valid name
            // ------------------------------------------------
        
            const nameString = trimmed;
        
            let hostString = "";
            let hwString = "";
            let ipString = "";
        
            let insideHost = false;
        
            // ------------------------------------------------
            // Parse host block
            // ------------------------------------------------
        
            for (let i = nextIndex; i < data.length; i++) {
        
                const line = data[i].trim();
        
                // Remove # only for checking
                const parsedLine = line.replace(/^#\s*/, "");
        
                // HOST
                if (
                    parsedLine
                        .toLowerCase()
                        .startsWith("host ")
                ) {
        
                    const host = parsedLine
                        .replace(/^host\s+/i, "")
                        .replace("{", "")
                        .trim();
        
                    hostString = line.startsWith("#")
                        ? `#host ${host}`
                        : `host ${host}`;
        
                    insideHost = true;
        
                    continue;
                }
        
                // Closing brace
                if (insideHost && parsedLine.includes("}")) {
                    break;
                }
        
                // HARDWARE
                if (
                    insideHost &&
                    parsedLine
                        .toLowerCase()
                        .startsWith("hardware ethernet")
                ) {
        
                    const hw = parsedLine
                        .replace(/^hardware ethernet/i, "")
                        .replace(";", "")
                        .trim()
                        .toLowerCase();
        
                    hwString = line.startsWith("#")
                        ? `#${hw}`
                        : hw;
        
                    continue;
                }
        
                // FIXED ADDRESS
                if (
                    insideHost &&
                    parsedLine
                        .toLowerCase()
                        .startsWith("fixed-address")
                ) {
        
                    ipString = line.startsWith("#")
                        ? `#${parsedLine}`
                        : parsedLine;
        
                    continue;
                }
            }
        
            // ------------------------------------------------
            // Save ONLY valid host records
            // ------------------------------------------------
        
            if (hostString) {
        
                mappedData.push({
                    nameString,
                    hostString,
                    hwString,
                    ipString
                });
            }
        
            // ------------------------------------------------
            // Skip the host block
            // ------------------------------------------------
        
            index = nextIndex;
        
            while (index + 1 < data.length) {
        
                index++;
        
                const parsedNext = data[index]
                    .trim()
                    .replace(/^#\s*/, "");
        
                if (parsedNext.includes("}")) {
                    break;
                }
            }
        }    

        res.json({success:true, mappedData});

    } catch (error) {
        res.json({success: false, message:error.message});
    }
    
} 


const sftp = new SftpClient();

const config = {
    host: process.env.DHCP_HOST,
    port: 8000,
    username: process.env.DHCP_USERNAME,
    password: process.env.DHCP_PASSWORD
};

export const downloadDhcpConfig = async(req, res) =>{

    try {

        await sftp.connect(config);

        const remoteFile = "/etc/dhcp/dhcpd.conf";
        const localFile = `public/localFolder/dhcpd.conf`;

        await sftp.fastGet(remoteFile, localFile);
        
        res.json({success:true, message: 'File Synced With Updated Data'});

    } catch (error) {

        res.json({success: false, message: error.message});

    } finally {
        try {
            await sftp.end();
        } catch (error) {
            console.error("SFTP close error:", error);
        }
    }
}