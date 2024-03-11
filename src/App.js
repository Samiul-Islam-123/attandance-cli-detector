import React, { useEffect, useState } from 'react';
import FaceDetectionComponent from './Components/FaceDetectionComponent';
import { io } from 'socket.io-client';
import { Button } from '@mui/material';

function App() {

  const socket = io('http://localhost:3001');
  const [isFaceDetectionEnabled, setIsFaceDetectionEnabled] = useState(false);

  const toggleFaceDetection = () => {
    setIsFaceDetectionEnabled((prev) => !prev);
  };

  useEffect(()=>{
    socket.on('start-attandance', status=>{
      setIsFaceDetectionEnabled(status)
    })
  },[socket])

  return (
    <div>
      <Button variant='contained' onClick={toggleFaceDetection}>
        {isFaceDetectionEnabled ? 'Stop Face Detection' : 'Start Face Detection'}
      </Button>
      {isFaceDetectionEnabled && <FaceDetectionComponent />}
    </div>
  );
}

export default App;
