import { useState } from "react";
import { useEffect } from "react";
import { Tabs } from "flowbite-react"; 
import RouterStatusTable from "../components/RouterStatusTable";
import BulkAction from "../components/BulkAction";
import Backups from "../components/Backups";
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import Header from "../components/Header";

export default function Home(){
  return(
    <>
      <Header/>
    </>
  )

}


