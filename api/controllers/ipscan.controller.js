import * as IpSubnetCalculator from 'ip-subnet-calculator';
import ping from 'ping';

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
