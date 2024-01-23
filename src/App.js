import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import FaceDetectionComponent from './Components/FaceDetectionComponent';

function App() {
 
  

  return (
    <div>
     <FaceDetectionComponent />
    </div>
  );
}

export default App;
