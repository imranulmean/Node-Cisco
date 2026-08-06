import { Card, Textarea, Label, TextInput, Button, Timeline, Modal, ModalBody, ModalFooter, ModalHeader, Tabs  } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import moment from "moment";
import Header from "../components/Header";
import UploadFileCompo from "../components/UploadFileCompo";

export default function AddDowntime(){

    let sessionToken= localStorage.getItem('sessionToken')
    const fileUploadOptions = {
        multiple: false,
        accept: ".xlsx, .xls",           // excel
        // accept: "image/*",            // images
        // accept: ".doc, .docx",        // word docs
        // accept: ".xlsx, .xls, image/*, .doc, .docx"  // multiple types
    };
    const [fileUploadDone, setFileUploadDone]= useState(false);
    return(
        <>
            <Header/>
            <UploadFileCompo options={fileUploadOptions} setFileUploadDone={setFileUploadDone} 
                             sessionToken={sessionToken} sourceUrl={"addDowntime"}/>
        </>
    )
}