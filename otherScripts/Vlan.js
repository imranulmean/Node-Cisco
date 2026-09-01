import { readFileSync, unlinkSync, writeFileSync } from "fs";
import path from 'path'
import { fileURLToPath } from 'url'
import XLSX from "xlsx";

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

// const inputFile = "D:/Node/MERN-Stack/Node-Cisco/public/localFolder/latest-dhcpd.conf";
// const outputFileJson = "IpFile.json";

// const data = readFileSync(inputFile, "utf8").split('\n');
// let mappedData=[];
// data.map((d, index)=>{
//         const trimmed=d.trim();
//         if(trimmed.startsWith("#") && !trimmed.includes('option domain-name-servers')){
//             const commaArray=trimmed.split(',');
//             if(commaArray.length>1){
//                 const name= commaArray[0].trim().split('#')[1].trim();
//                 const dept = commaArray[commaArray.length - 1].trim();
//                 let fixed_address;
//                 if(!data[index + 2]?.trim()){
//                     fixed_address = data[index + 4].trim().split(/\s+/);
//                 }
//                 else{
//                     fixed_address = data[index + 3].trim().split(/\s+/);
//                 }
//                 const ip = fixed_address[1];
//                 const obj={
//                     name,
//                     dept,
//                     ip
//                 }
//                 mappedData.push(obj)
//             }

//         }    
//     })


// writeFileSync(`${__dirname}/${outputFileJson}`, JSON.stringify(mappedData,null,2) );

// console.log(`✅ created: ${__dirname}/${outputFileJson}`);

// const inputFileJson=`${__dirname}/${outputFileJson}`;
// const outputExcel='ip.xlsx';
// const jsonObj= readFileSync(inputFileJson,'utf8' );
// const parsedJson= JSON.parse(jsonObj);
// const rows = parsedJson;

// const worksheet = XLSX.utils.json_to_sheet(rows);
// const workbook = XLSX.utils.book_new();
// XLSX.utils.book_append_sheet(workbook, worksheet, "iplist");
// XLSX.writeFile(workbook, `${__dirname}/${outputExcel}`);
// console.log(`✅ Excel File created:  ${__dirname}/${outputExcel}`);
// unlinkSync(inputFileJson);
// console.log(`✅ Deleted:  ${inputFileJson}`);


import SftpClient from "ssh2-sftp-client";

const sftp = new SftpClient();

const config = {
    host: '172.17.20.101',
    port: 8000,
    username: 'imranul',
    password: 'Asdf_1234'
};

async function downloadDhcpConfig() {

    try {

        await sftp.connect(config);

        console.log("✅ Connected to DHCP server");

        const remoteFile = "/etc/dhcp/dhcpd.conf";
        const localFile = `${__dirname}/dhcpd.conf`;

        await sftp.fastGet(remoteFile, localFile);

        console.log("✅ dhcpd.conf downloaded");

    } catch (error) {

        console.error("❌ SFTP error:", error);

    } finally {

        await sftp.end();

    }
}

downloadDhcpConfig();