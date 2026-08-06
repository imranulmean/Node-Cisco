import { readFileSync, writeFileSync } from "fs";

const inputFile = "config.txt";
const outputFile = "vlan.txt";

const data = readFileSync(inputFile, "utf8");

const regex = /^\s*switchport\s+(access|trunk allowed)\s+vlan\s+.*\b(3[1-5][0-9]{2})\b.*$/gm;
const matches = data.match(regex) || [];

writeFileSync(outputFile, matches.join("\n"));

console.log(`✅ vlan.txt created with ${matches.length} entries`);


//////////////////////////////////////////////////////
// import { readFileSync, writeFileSync } from "fs";

// const inputFile = "config.txt";
// const outputFile = "vlan2.txt";

// const data = readFileSync(inputFile, "utf8");
// const lines = data.split("\n");

// // VLAN range
// const MIN = 3100;
// const MAX = 3599;

// const isInRange = (vlan) => vlan >= MIN && vlan <= MAX;

// const results = lines.filter(line => {
//   if (!line.includes("vlan")) return false;

//   // Extract numbers and ranges: 3104, 3106-3110
//   const tokens = line.match(/\d+(-\d+)?/g);
//   if (!tokens) return false;

//   return tokens.some(token => {
//     if (token.includes("-")) {
//       const [start, end] = token.split("-").map(Number);
//       return start <= MAX && end >= MIN; // range overlap
//     }
//     return isInRange(Number(token));
//   });
// });
// writeFileSync(outputFile, results.join("\n"));
// console.log(`Saved ${results.length} VLAN entries to ${outputFile}`);
//////////////////////////////////////////////////////


// import { readFileSync, writeFileSync } from "fs";
// import XLSX from "xlsx";

// const inputFile = "vlan.txt";
// const outputFile = "vlan.xlsx";

// const lines = readFileSync(inputFile, "utf8")
//   .split("\n")
//   .map(l => l.trim())
//   .filter(Boolean);

// const rows = lines.map(line => {
//   // VLAN
//   const vlanMatch = line.match(/vlan\s+(\d+)/);
//   const vlan = vlanMatch ? vlanMatch[1] : "";

//   // Tenant
//   const tenantMatch = line.match(/tenant\s+(\S+)/);
//   const tenant = tenantMatch ? tenantMatch[1] : "";

//   // Application
//   const appMatch = line.match(/application\s+(\S+)/);
//   const application = appMatch ? appMatch[1] : "";

//   // EPG
//   const epgMatch = line.match(/epg\s+(\S+)/);
//   const epg = epgMatch ? epgMatch[1] : "";

//   return {
//     vlan,
//     tenant,
//     application,
//     epg
//   };
// });

// console.log(rows);
// // Create worksheet
// const worksheet = XLSX.utils.json_to_sheet(rows);

// // Create workbook
// const workbook = XLSX.utils.book_new();
// XLSX.utils.book_append_sheet(workbook, worksheet, "VLANs");

// // Write XLSX file
// XLSX.writeFile(workbook, outputFile);

// console.log(`✅ vlan.xlsx created with ${rows.length} rows`);