import React, { useEffect, useRef, useCallback } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io } from 'socket.io-client';
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import 'xterm/css/xterm.css';

export default function TerminalModal({ router, show, onClose, sessionToken }) {
  const xtermRef = useRef(null);
  const socketRef = useRef(null);
  const fitAddonRef = useRef(new FitAddon());
  const BASE_API=import.meta.env.VITE_API_BASE_URL;
  // This function runs the moment the <div> is rendered
  const terminalDivRef = useCallback((node) => {
    if (node !== null && !xtermRef.current) {
      // 1. Initialize Terminal
      const term = new Terminal({
        cursorBlink: true,
        theme: { 
          background: '#111827', 
          foreground: '#fff'
        },
        fontFamily: 'Courier New, monospace',
        fontSize: 16,        
      });

      term.loadAddon(fitAddonRef.current);
      
      // 2. Open terminal in the node (the div)
      term.open(node);
      xtermRef.current = term;

      // 3. Connect Socket
      socketRef.current = io(BASE_API);
      socketRef.current.emit("start-ssh", router, sessionToken);

      // 4. Data Flow
      term.onData(data =>{
        socketRef.current.emit("input", data)
      } );
      socketRef.current.emit("TestSocket","Real Time Connection Test");
      socketRef.current.on("output", data => term.write(data));
      term.write(`You are using Fahad's version of terminal,`)

      // 5. Initial fit
      setTimeout(() => fitAddonRef.current.fit(), 200);
    }
  }, [router, BASE_API]);

  // Handle cleanup when modal closes
  useEffect(() => {
    if (!show) {
      if (socketRef.current) socketRef.current.disconnect();
      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
      }
    }
  }, [show]);

  return (
    <Modal show={show} size="xxxl" onClose={onClose} style={{'height':'100vh'}}>
      <ModalHeader className='px-2 py-0'>Terminal: {router?.router}</ModalHeader>
      <ModalBody className='p-2' style={{'height':'100vh'}}>
        {/* Notice we pass the function terminalDivRef here, not a ref object */}
        <div ref={terminalDivRef} style={{'height':'100vh'}}/>
      </ModalBody>
    </Modal>
  );
}