// const OID = {
//   sysName:      '1.3.6.1.2.1.1.5.0',
//   ifDescr:      '1.3.6.1.2.1.2.2.1.2',
//   ifAlias:      '1.3.6.1.2.1.31.1.1.1.18',
//   ifOperStatus: '1.3.6.1.2.1.2.2.1.8',
//   ifSpeed:      '1.3.6.1.2.1.2.2.1.5',

//   //  64-bit counters
//   ifHCInOctets:  '1.3.6.1.2.1.31.1.1.1.6',
//   ifHCOutOctets: '1.3.6.1.2.1.31.1.1.1.10',
// };

import {InfluxDB, Point} from '@influxdata/influxdb-client';

let INFLUXDB_TOKEN='CVF7TxCVWb0NNEoez2da-xevYb0NiDar20IyXqSsUop5mkzUfZio1tvFeCggBrxFXIgt0nVH5cCxQ_MSR0872g==';
const token = INFLUXDB_TOKEN;
const url = 'http://localhost:8086'
const client = new InfluxDB({url, token})  

const healthFunction = async(queryClient, host)=>{
    /////////////////////////
    let healthQuery = `
    from(bucket: "mrtg")
      |> range(start: -2m)
      |> filter(fn: (r) => r["_measurement"] == "snmp")
      |> filter(fn: (r) => 
          r["_field"] == "cpu_1min" or 
          r["_field"] == "cpu_5min" or
          r["_field"] == "memory_free" or
          r["_field"] == "memory_used" or
          r["_field"] == "uptime" or
          r["_field"] == "sysDescr" or
          r["_field"] == "sysName"
      )
      |> filter(fn: (r) => r["agent_host"] == "${host}")
      |> last()
    `;    
    /////////////////////////
    let healthResults = [];

    await new Promise((resolve, reject) => {
        queryClient.queryRows(healthQuery, {
            next(row, tableMeta) {
                healthResults.push(tableMeta.toObject(row));
            },
            error: reject,
            complete: resolve
        });
    });
    const health = {};
    healthResults.forEach(r => {
        health[r._field] = r._value;
    });

    ////////////Memory Pool Query/////////////
    let memoryPoolQuery = `
    from(bucket: "mrtg")
      |> range(start: -2m)
      |> filter(fn: (r) => r["_measurement"] == "memory_pool")
      |> filter(fn: (r) => 
          r["_field"] == "pool_free" or 
          r["_field"] == "pool_used"
      )
      |> filter(fn: (r) => r["agent_host"] == "${host}")
      |> last()
    `;
    let memoryPoolResults = [];

    await new Promise((resolve, reject) => {
        queryClient.queryRows(memoryPoolQuery, {
            next(row, tableMeta) {
              memoryPoolResults.push(tableMeta.toObject(row));
            },
            error: reject,
            complete: resolve
        });
    });
    const memoryPool = {};
    memoryPoolResults.forEach(r => {
      memoryPool[r._field] = r._value;
    });    
    /////////////////////////

    ////////////Device Serial/////////////
    let deviceSerialQuery = `
    from(bucket: "mrtg")
      |> range(start: -2m)
      |> filter(fn: (r) => r["_measurement"] == "entity")
      |> filter(fn: (r) => 
          r["_field"] == "serial_number"
      )
      |> filter(fn: (r) => r["agent_host"] == "${host}")
      |> last()
    `;
    let deviceSerialResults = [];

    await new Promise((resolve, reject) => {
        queryClient.queryRows(deviceSerialQuery, {
            next(row, tableMeta) {
              deviceSerialResults.push(tableMeta.toObject(row));
            },
            error: reject,
            complete: resolve
        });
    });
    const deviceSerial = {};
    deviceSerialResults.forEach(r => {
      deviceSerial[r._field] = r._value;
      deviceSerial['model'] = r.entPhysicalName;
    });    
    /////////////////////////    

    return { health, memoryPool, deviceSerial};    
}

export const snmpStatus = async(req, res)=>{
  const {host}=req.params;
  try{
    let queryClient = client.getQueryApi('AIBL')
    let bwResults = [];
    let aliasResults = [];
    
    // ======================
    // 1. BANDWIDTH QUERY
    // ======================
    let bwQuery = `
    from(bucket: "mrtg")
      |> range(start: -5h)
      |> filter(fn: (r) => r["_measurement"] == "interface")
      |> filter(fn: (r) => r["_field"] == "in_octets" or r["_field"] == "out_octets")
      |> filter(fn: (r) => r["agent_host"] == "${host}")
      |> derivative(unit: 1s, nonNegative: true)
      |> map(fn: (r) => ({ r with _value: r._value * 8.0 }))
    `;
    
    // ======================
    // 2. ALIAS QUERY
    // ======================
    let aliasQuery = `
    from(bucket: "mrtg")
      |> range(start: -5h)
      |> filter(fn: (r) => r["_measurement"] == "interface")
      |> filter(fn: (r) => r["_field"] == "alias")
      |> filter(fn: (r) => r["agent_host"] == "${host}")
    `;
    
    // ======================
    // EXECUTE BW QUERY
    // ======================
    await new Promise((resolve, reject) => {
      queryClient.queryRows(bwQuery, {
        next(row, tableMeta) {
          bwResults.push(tableMeta.toObject(row));
        },
        error: reject,
        complete: resolve
      });
    });
    
    // ======================
    // EXECUTE ALIAS QUERY
    // ======================
    await new Promise((resolve, reject) => {
      queryClient.queryRows(aliasQuery, {
        next(row, tableMeta) {
          aliasResults.push(tableMeta.toObject(row));
        },
        error: reject,
        complete: resolve
      });
    });
    
    // ======================
    // BUILD ALIAS MAP
    // ======================
    const aliasMap = {};
    
    aliasResults.forEach(r => {
      aliasMap[r.name] = r._value;
    });

    const grouped = {};
    
    bwResults.forEach(row => {
      const key = row.name;
    
      if (!grouped[key]) {
        grouped[key] = {
          alias: aliasMap[key] || "",
          name: key,
          inMb: [],
          outMb: []
        };
      }
    
      const time = new Date(row._time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    
      const bwMb = row._value / 1000000;
    
      if (row._field === "in_octets") {
        grouped[key].inMb.push({
          time,
          bw: Number(bwMb.toFixed(2))
        });
      }
    
      if (row._field === "out_octets") {
        grouped[key].outMb.push({
          time,
          bw: Number(bwMb.toFixed(2))
        });
      }
    });  

    const { health, memoryPool, deviceSerial}= await healthFunction(queryClient, host);

    res.json({
      success: true,
      count: Object.keys(grouped).length,
      data: grouped,
      health,
      memoryPool,
      deviceSerial
    });
  }catch(err){
    // console.error(err.message);
    res.json({
      success: false,
      count: 0,
      data: {}
    });
  }
}