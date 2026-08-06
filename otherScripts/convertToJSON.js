import XLSX from 'xlsx'
import path from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

// const workbook = XLSX.readFile(path.join(__dirname, 'routersDetails.xlsx'))
const workbook = XLSX.readFile('client/public/localFolder/all emp info may 2026.xls')
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const routersArray = XLSX.utils.sheet_to_json(sheet)
const routersJSON = { branchContact:routersArray };

const outputFile = path.join(__dirname, 'branch_contacts.json');
writeFileSync(outputFile, JSON.stringify(routersJSON, null, 1));

console.log(`✅ JSON file saved at ${outputFile}`);
