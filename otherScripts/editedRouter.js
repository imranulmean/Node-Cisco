import fs from "fs";

const data = JSON.parse(fs.readFileSync('routers.json', "utf8"));
const parsesd= data.routers;
const newFields= parsesd.map((p)=>{
    return {...p, addedBy:'imranul'}
})

fs.writeFileSync('editedRouter.json', JSON.stringify({ routers: newFields }, null, 1));
