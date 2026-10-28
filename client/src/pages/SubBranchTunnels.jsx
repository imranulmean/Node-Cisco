import { useEffect, useRef, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import Header from "../components/Header";

const BASE_API=import.meta.env.VITE_API_BASE_URL;
let username = localStorage.getItem('username')


function GenerateConfig({ row }) {
    const [show, setShow] = useState(false);
  
    const get = (key) => String(row[key] ?? "");
  
    const generateConfig = () => {
      const branch = get("Sub Branch-Name");
      const lan = get("Sub Existing Network");
      const lanIp = get("Sub RT-LAN");
  
      const pWan = get("WAN-IP");
      const pGw = get("ISP GW");
      const pName = get("ISP NAME");
      const pKey = get("Key");
      const pTransform = `${get("TransFormSet")}-Mikrotik`;
      const pProfile = get("Profile");
  
      const sWan = get("2ndISP WAN-IP");
      const sGw = get("2ndISP ISP GW");
      const sName = get("2ndISP ISP NAME");
      const sKey = get("2ndISP Key");
      const sTransform = `${get("2ndISP TransFormSet")}-Mikrotik`;
      const sProfile = get("2ndISP Profile");
  
      const tunnels = [
        {
          id: get("Tunnel ID Pri"),
          ip: get("Sub_Pri_Tunnel IP"),
          network: get("Pri-Tunnel Net"),
          core: get("DC-RT1-WAN-IP"),
          coreIp: get("Pri_Core Tunnel IP"),
          isp: pName,
          wan: pWan,
          key: pKey,
          profile: pProfile,
          transform: pTransform,
          cost: 10,
          secondary: false,
        },
        {
          id: get("Tunnel ID SEC"),
          ip: get("Sub_Sec Tunnel IP"),
          network: get("Sec-Tunnel Net"),
          core: get("DC-RT2-WAN-IP"),
          coreIp: get("Sec_Core Tunnel IP"),
          isp: pName,
          wan: pWan,
          key: pKey,
          profile: pProfile,
          transform: pTransform,
          cost: 20,
          secondary: false,
        },
        {
          id: get("2ndISP Tunnel ID Pri"),
          ip: get("2ndISP Sub_Pri-Tunnel IP"),
          network: get("2ndISP Pri-Tunnel Net"),
          core: get("2ndISP DC-RT1-WAN-IP"),
          coreIp: get("2ndISP Pri_Core Tunnel IP"),
          isp: sName,
          wan: sWan,
          key: sKey,
          profile: sProfile,
          transform: sTransform,
          cost: 30,
          secondary: true,
        },
        {
          id: get("2ndISP Tunnel ID SEC"),
          ip: get("2ndISP Sub_Sec Tunnel IP"),
          network: get("2ndISP Sec-Tunnel Net"),
          core: get("2ndISP DC-RT2-WAN-IP"),
          coreIp: get("2ndISP Sec_Core Tunnel IP"),
          isp: sName,
          wan: sWan,
          key: sKey,
          profile: sProfile,
          transform: sTransform,
          cost: 40,
          secondary: true,
        },
      ];
  
      const cisco = (router, first, second) => `
  ! ========================== ${router} ============================
  
  crypto isakmp key ${pKey}-4-Mikr0T1k address ${pWan}
  crypto isakmp key ${sKey}-4-Mikr0T1k address ${sWan}
  
  !
  crypto ipsec transform-set ${pTransform} esp-3des esp-md5-hmac
   mode transport
  
  crypto ipsec transform-set ${sTransform} esp-3des esp-md5-hmac
   mode transport
  
  !
  crypto ipsec profile ${pProfile}
   set transform-set ${pTransform}
   set pfs group2
  
  crypto ipsec profile ${sProfile}
   set transform-set ${sTransform}
   set pfs group2
  
  !
  interface Tunnel${first.id}
   description #### Connected To ${branch}-Sub via ${first.isp} ####
   ip address ${first.coreIp} 255.255.255.252
   tunnel source ${first.core}
   tunnel destination ${first.wan}
   ip ospf cost ${first.cost}
   ip mtu 1442
   keepalive 3 3
   tunnel protection ipsec profile ${first.profile}
  
  interface Tunnel${second.id}
   description #### Connected To ${branch}-Sub via ${second.isp} ####
   ip address ${second.coreIp} 255.255.255.252
   tunnel source ${second.core}
   tunnel destination ${second.wan}
   ip ospf cost ${second.cost}
   ip mtu 1442
   keepalive 3 3
   tunnel protection ipsec profile ${second.profile}
  
  !
  router ospf 100
   area 4 stub no-summary
   network ${first.network} 0.0.0.3 area 4
   network ${second.network} 0.0.0.3 area 4
   exit
  `;
  
      const mikrotik = `
  ! ========================== Branch ${branch} ============================
  ! Router Type: ${get("Rt Model")}
  ! Local LAN: ${lan}
  
  /interface bridge add name=Bridgelocal
  
  /interface bridge port
  add bridge=Bridgelocal interface=ether2
  add bridge=Bridgelocal interface=ether3
  add bridge=Bridgelocal interface=ether4
  add bridge=Bridgelocal interface=ether5
  
  /ip address
  add address=${pWan}/30 comment="WAN IP(${pName})" interface=ether1
  add address=${lanIp}/${lan.split("/")[1] ?? "26"} comment=Local_IP interface=Bridgelocal
  
  /ip route
  add dst-address=${get("DC-RT1-WAN-IP")}/32 distance=1 check-gateway=ping gateway=${pGw}
  add dst-address=${get("DC-RT2-WAN-IP")}/32 distance=2 check-gateway=ping gateway=${pGw}
  
  /system identity set name=${branch}
  
  /user
  add name=aibladmin password=@dm!n#32! group=full
  add name=aibl password=aibl123 group=full
  remove admin
  
  /user aaa set default-group=full use-radius=yes
  
  /radius add service=login address=172.17.20.28 secret=cisco123 src-address=${lanIp}
  
  /ip firewall mangle
  add chain=forward protocol=tcp in-interface=Bridgelocal tcp-flags=syn action=change-mss new-mss=1300 passthrough=yes
  
  /system clock
  set time-zone-name=Asia/Dhaka
  
  /system ntp client
  set enabled=yes primary-ntp=172.17.20.22 secondary-ntp=172.17.20.23
  
  ! ========================== Secondary ISP ============================
  
  /ip address
  add address=${sWan}/30 comment="WAN IP(${sName})" interface=ether2
  
  /ip route
  add dst-address=${get("2ndISP DC-RT1-WAN-IP")}/32 distance=1 check-gateway=ping gateway=${sGw}
  add dst-address=${get("2ndISP DC-RT2-WAN-IP")}/32 distance=2 check-gateway=ping gateway=${sGw}
  
  ${tunnels.map((t) => `
  ! ========================== Tunnel ${t.id} ============================
  
  /interface gre add name=Tunnel${t.id} local-address=${t.wan} remote-address=${t.core} keepalive=3s,3
  /ip address add address=${t.ip}/30 interface=Tunnel${t.id}
  
  /ip ipsec peer add name=CORE-${t.id} address=${t.core}/32 local-address=${t.wan} profile=${t.secondary ? "2ndISP-IPsec-profile" : "IPsec-profile"}
  /ip ipsec identity add peer=CORE-${t.id} generate-policy=port-strict secret=${t.key}-4-Mikr0T1k
  /ip ipsec proposal add auth-algorithms=md5 enc-algorithms=3des lifetime=1h name=Tunnel${t.id} pfs-group=modp1024
  /ip ipsec policy add peer=CORE-${t.id} dst-address=${t.core}/32 proposal=Tunnel${t.id} protocol=gre sa-dst-address=${t.core} sa-src-address=${t.wan} src-address=${t.wan}/32 tunnel=no
  /ip ipsec policy add peer=CORE-${t.id} dst-address=${t.core}/32 proposal=Tunnel${t.id} protocol=ipsec-esp sa-dst-address=${t.core} sa-src-address=${t.wan} src-address=${t.wan}/32 tunnel=no
  /routing ospf network add network=${t.network}/30 area=area-4
  /routing ospf interface add cost=${t.cost} interface=Tunnel${t.id} network-type=point-to-point
  `).join("\n")}
  
  /ip ipsec profile add dh-group=modp1024 enc-algorithm=3des hash-algorithm=md5 lifetime=1h name=IPsec-profile nat-traversal=no
  /ip ipsec profile add dh-group=modp1024 enc-algorithm=3des hash-algorithm=md5 lifetime=1h name=2ndISP-IPsec-profile nat-traversal=no
  
  /routing ospf instance add router-id=0.0.0.4 name=${branch}
  /routing ospf area add name=area-4 area-id=0.0.0.4 type=stub instance=${branch}
  /routing ospf network add network=${lan} area=area-4
  `;
  
      return `
  ${cisco("NDC RT1", tunnels[0], tunnels[2])}
  
  ${cisco("NDC RT2", tunnels[1], tunnels[3])}
  
  ${mikrotik}
  `.trim();
    };
  
    const config = generateConfig();
    return (
        <>
          <button
            onClick={() => setShow(true)}
            className="px-3 py-2 bg-cyan-900 text-white rounded-lg hover:bg-cyan-700 whitespace-nowrap"
          >
            Generate Config
          </button>
    
          <Modal
            show={show}
            size="7xl"
            onClose={() => setShow(false)}
          >
            <ModalHeader className="px-3 py-2">
              Configuration: {get("Sub Branch-Name")}
            </ModalHeader>
    
            <ModalBody className="p-3">
              <div className="flex justify-between items-center gap-3 mb-3">
                <div className="text-sm text-gray-500">
                  Router: {get("Rt Model")} | Branch Code: {get("Br_Code")}
                </div>
              </div>
    
              <pre className="h-[65vh] overflow-auto rounded-lg bg-gray-200 p-4 text-sm leading-6 text-gray-800 font-mono whitespace-pre">
                {config}
              </pre>
            </ModalBody>
          </Modal>
        </>
      );
  }

  function TunnelConfigForm({show, columns, initialData, onClose, onSaved,}) {
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [sessionToken, setSessionToken]= useState(localStorage.getItem('sessionToken'));
  
    useEffect(() => {
      if (show) {
        setFormData(initialData ? { ...initialData } : {});
        setError("");
      }
    }, [show, initialData]);
  
    const handleChange = (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      setError("");
      const payload = {
        ...formData,
        addedBy:username,
      };
      try {
        const response = await fetch(`${BASE_API}/saveTunnelConfig`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "authorization": sessionToken            
          },
          body: JSON.stringify(payload),
        });
  
        const result = await response.json();
  
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Could not save configuration.");
        }
  
        onSaved(result.tunnels);
  
        alert(result.message);
        onClose();
      } catch (err) {
        setError(err.message || "An error occurred while saving.");
      } finally {
        setSaving(false);
      }
    };
  
    return (
      <Modal show={show} size="7xl" onClose={onClose}>
        <ModalHeader>
          {initialData ? "Edit Tunnel Configuration" : "Add Tunnel Configuration"}
        </ModalHeader>
  
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {columns.map((field) => (
                <div key={field}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {field}
                  </label>
  
                  <input
                    type="text"
                    value={formData[field] ?? ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"                    
                  />
                </div>
              ))}
            </div>
  
            {error && (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            )}
  
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border px-4 py-2"
                disabled={saving}
              >
                Cancel
              </button>
  
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : initialData
                    ? "Update Config"
                    : "Save Config"}
              </button>
            </div>
          </form>
        </ModalBody>
      </Modal>
    );
  }

export default function SubBranchTunnels(){

    const [sessionToken, setSessionToken]= useState(localStorage.getItem('sessionToken'));
    const [loading, setLoading]= useState(false);
    const [scanData, setScanData] = useState([]);
    const [queryString, setQueryString]= useState("");  
    const [showConfigForm, setShowConfigForm] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);    
    const columns = [
        "SL",
        "Br_Code",
        "Tunnel ID Pri",
        "2ndISP Tunnel ID Pri",
        "Tunnel ID SEC",
        "2ndISP Tunnel ID SEC",
        "Sub Branch-Name",
        "Pri-Tunnel Net",
        "Pri_Core Tunnel IP",
        "Sub_Pri_Tunnel IP",
        "2ndISP Pri-Tunnel Net",
        "2ndISP Pri_Core Tunnel IP",
        "2ndISP Sub_Pri_Tunnel IP",
        "Sec-Tunnel Net",
        "Sec_Core Tunnel IP",
        "Sub_Sec Tunnel IP",
        "2ndISP Sec-Tunnel Net",
        "2ndISP Sec_Core Tunnel IP",
        "2ndISP Sub_Sec Tunnel IP",
        "Sub RT-LAN",
        "Sub Existing Network",
        "ISP NAME",
        "ISP Network",
        "ISP GW",
        "WAN-IP",
        "2ndISP ISP NAME",
        "2ndISP ISP Network",
        "2ndISP ISP GW",
        "2ndISP WAN-IP",
        "Rt Model",
        "Key",
        "TransFormSet",
        "Profile",
        "2ndISP Key",
        "2ndISP TransFormSet",
        "2ndISP Profile",
        "DC-RT1-WAN-IP",
        "DC-RT2-WAN-IP",
        "2ndISP DC-RT1-WAN-IP",
        "2ndISP DC-RT2-WAN-IP",
      ];
    useEffect(()=>{
        getData();
    },[])

    const filterList = scanData.length > 0 ? scanData.filter((r) => {
        if (queryString === "") return true;
        return columns.some((col) =>
            String(r[col] ?? "").toLowerCase().includes(queryString.toLowerCase())
        );
    }) : [];
    

    const getData = async()=>{
        console.log(sessionToken)
        try {
            setLoading(true);
            const res = await fetch(`${BASE_API}/getTunnelConfig`,{
                method:'GET',
                headers: { 
                    "Content-Type": "application/json",
                    "authorization": sessionToken
                 },                
            });
            const data= await res.json();
            if(!data.success){
                alert(data.message);
                return;
            }
            setScanData(data.tunnels)
            
        } catch (error) {
            alert(error);
        }finally{
            setLoading(false);
        }

    }


    return(
        <>
            <Header/>
            <div className="flex gap-4 px-2 py-6 justify-center items-center">
                <div className="w-full flex flex-col justify-center items-center gap-2">
                    <div className="w-full flex gap-2 justify-center items-center">

                        <input type="text" value={queryString.trim()} placeholder="Search anything" onChange={(e)=>{setQueryString(e.target.value.trim());}}
                            class="max-w-sm w-full px-3 py-2 bg-white-200 border border-gray-400 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 outline:none" 
                        />                            
                        <button onClick={getData} disabled={loading}
                                className="p-2 border bg-cyan-900 text-md text-white  rounded-lg">
                                    {loading ? 'loading...' : 'Reload'}
                        </button>
                        <button
                            onClick={() => {
                                setEditingConfig(null);
                                setShowConfigForm(true);
                            }}
                            className="rounded-lg bg-blue-900 px-4 py-2 text-white"
                            >
                            + Add Config
                        </button>                          

                    </div>                  
                    <div className="flex gap-2">
                        <p className="block text-center text-gray-700">Showing ip:{filterList.length} </p>
                        <p className="text-center font-bold text-gray-700">To Check Unused IP type #host</p>                        
                    </div>

                    <div className="w-full h-[450px] overflow-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="sticky top-0 bg-gray-900">
                            <tr>
                                {columns.map((column) => (
                                <th
                                    key={column}
                                    className="p-2 text-center text-gray-200 border border-gray-400 whitespace-nowrap"
                                >
                                    {column}
                                </th>
                                ))}
                                <th className="p-2 text-center text-gray-200 border border-gray-400">
                                    Action
                                </th>                            
                                <th className="p-2 text-center text-gray-200 border border-gray-400">
                                    Action
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {filterList.map((scan, index) => (
                                <tr  key={`${scan["Br_Code"]}-${index}`} className="hover:bg-gray-300">
                                    {columns.map((column) => (
                                        <td key={column}
                                            className="p-2 text-center border border-gray-400 whitespace-nowrap"
                                        >
                                            {scan[column] ?? ""}
                                        </td>
                                        
                                    ))}
                                    <td className="p-2 text-center border border-gray-400">
                                        <GenerateConfig row={scan} />
                                    </td> 
                                    <td className="border p-2 text-center">
                                        <button
                                            onClick={() => {
                                            setEditingConfig(scan);
                                            setShowConfigForm(true);
                                            }}
                                            className="rounded bg-amber-500 px-3 py-1 text-white"
                                        >
                                            Edit
                                        </button>
                                    </td>                                                                   
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <TunnelConfigForm
                        show={showConfigForm}
                        columns={columns}
                        initialData={editingConfig}
                        onClose={() => setShowConfigForm(false)}
                        onSaved={(updatedTunnels) => {
                            setScanData(updatedTunnels);
                        }}
                        />                        
                    </div>
                </div>
            </div>

        </>

    )    

}