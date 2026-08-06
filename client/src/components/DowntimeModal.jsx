import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Modal, ModalBody, ModalHeader } from "flowbite-react";


export default function DowntimeModal({ router, show, isp, onClose }) {

  const [ispName, setIspName]= useState('');
  const [ispIP, setIspIP]= useState('');
  const [downTimes,setDowntimes]= useState([]);
  const [upTimes,setUptimes]= useState([]);
  const [totalDownTime,settotalDownTime]= useState([]);
  const [lastDownTime,setLastDownTime]= useState('');
  
  useEffect(() => {

    if (!router) return;
    console.log(router)
    if(isp==='isp1'){
      setIspName(router.isp1Name);
      setIspIP(router.isp1Source);
      setDowntimes(router.isp1DownTimes);
      setUptimes(router.isp1UpTimes)
      settotalDownTime(router.isp1DownTime)
      setLastDownTime(router.isp1LastDownTime)
    }
    else{
      setIspName(router.isp2Name)
      setIspIP(router.isp2Source);
      setDowntimes(router.isp2DownTimes);
      setUptimes(router.isp2UpTimes)
      settotalDownTime(router.isp2DownTime)
      setLastDownTime(router.isp2LastDownTime)
    }
  }, [router, show]);


  return (
    <Modal show={show} size="md" onClose={onClose}>
      <ModalHeader className='px-2 py-2'>
        <p className='text-sm'>{router?.router} {ispName}: {ispIP}</p>
        <p className='text-sm'>Total Down:{totalDownTime}, Last Down:{lastDownTime}</p>
      </ModalHeader>
      <ModalBody className='p-2'>
        <p>❌: {downTimes.length}</p>
        {
            downTimes.length > 0 &&
            downTimes.map(downs=>{
              return(
                  <div>
                      <p className='w-full text-sm'>{downs}</p>
                  </div>
                  
              )
            })
        } 
        <p>✅: {upTimes.length}</p>       
        {
            upTimes.length > 0 &&
            upTimes.map(ups=>{
              return(
                  <div>
                      <p className='text-sm'>{ups}</p>
                  </div>
                  
              )
            })
        }
      </ModalBody>
    </Modal>
  );
}