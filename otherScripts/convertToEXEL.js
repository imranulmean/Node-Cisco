// import XLSX from "xlsx";
// import fs from "fs";

// const inputFile=`hadiths.json`;
// const jsonObj= fs.readFileSync(inputFile,'utf8' );
// const parsedJson= JSON.parse(jsonObj);
// const rows = parsedJson.data;

// const worksheet = XLSX.utils.json_to_sheet(rows);
// const workbook = XLSX.utils.book_new();
// XLSX.utils.book_append_sheet(workbook, worksheet, "hadiths");
// XLSX.writeFile(workbook, "hadiths.xlsx");
// console.log("✅ Excel file created: hadiths.xlsx");

// import path from 'path'
// import { fileURLToPath } from 'url'
// import fs from 'fs'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
// console.log(`__filePath: ${__filename}`)
// console.log(`__dirnPath: ${__dirname}`)
// const inputFile=path.join(__dirname, 'hadiths.json');
// const hadiths = JSON.parse(fs.readFileSync(inputFile,'utf8'));
// // console.log(phones)

// const list = phones.map((p) => {
//   const rawString = p['722801-Hobigonj Branch'];
//   // console.log(rawString);
//   // Parse: '826007-H. M. Akhter Hossain,AVP,BDMD'
//   const parsedString = rawString?.split(',') ?? [];
//   const firstPart    = parsedString[0]?.split('-') ?? [];
//   const Ser         = -1;
//   const Extension   = firstPart[0] || "";       // '826007'
//   const Name        = firstPart[1] || "";       // 'H. M. Akhter Hossain'
//   const Designation = parsedString[1] || "";       // 'AVP'
//   const Department  = parsedString[2] || "";       // 'BDMD'

//   const obj = {
//       Ser,
//       Extension,
//       Name,
//       Designation,
//       Department,
//   };

//   return obj;
// });
// console.log(list)

// const outputFile = path.join(__dirname, 'phones_222.json');
// fs.writeFileSync(outputFile, JSON.stringify(list, null, 1));


import XLSX from "xlsx";
import fs from "fs";

const inputFile=`allSubjectsBook1.json`;

const rows = [];

for( let i=1; i<8;i++){
    
    const jsonObj= fs.readFileSync(`allSubjectsBook${i}.json`,'utf8' );
    const parsedJson= JSON.parse(jsonObj);

    parsedJson.forEach((item)=>{
        item.contents.forEach((content)=>{
            rows.push({
                bookId:item.bookId,
                bookName:item.bookName,
                chapterId:item.chapterId,
                chapterTitle:item.chapterTitle,
                titleId:item.titleId,
                chapterTitleIndexName:item.chapterTitleIndexName,
                contentTitle:content.contentTitle,
                banglaTexts:JSON.stringify(content.banglaTexts),
                arabicTexts:JSON.stringify(content.arabicTexts)
            })
        })
    })    
}


const worksheet = XLSX.utils.json_to_sheet(rows);
const csv = XLSX.utils.sheet_to_csv(worksheet)
fs.writeFileSync("subjectives.csv", "\uFEFF" + csv, "utf8")
console.log("✅ Excel file created: subjectives.csv");