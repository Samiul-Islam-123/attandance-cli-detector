import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { io } from 'socket.io-client';
import dingSound from './sound/sound.mp3';

const FaceDetectionComponent = () => {
  let socket;

  
  useEffect(() => {
    socket = io('https://attandance-server-qmlt.onrender.com');

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.on('face-matched_res', (data) => {
      console.log(data);
    });
  }, [socket]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [playSound, setPlaySound] = useState(false);

  const loadModels = async () => {
    await faceapi.nets.tinyFaceDetector.load('/models');
    await faceapi.nets.faceLandmark68Net.load('/models');
    await faceapi.nets.faceRecognitionNet.load('/models');
    await faceapi.nets.ssdMobilenetv1.load('/models');
  };

  useEffect(() => {
    const startCamera = async () => {
      const video = videoRef.current;

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
          video.srcObject = stream;

          // Wait for the 'loadedmetadata' event to ensure accurate dimensions
          await new Promise((resolve) => {
            video.onloadedmetadata = () => {
              resolve();
            };
          });
        } catch (error) {
          console.error('Error accessing webcam:', error);
        }
      }
    };

    const detectFaces = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas) {
        video.addEventListener('play', async () => {
          document.body.append(canvas);

          const displaySize = { width: 500, height: 500 };
          faceapi.matchDimensions(canvas, displaySize);

          const labeledFaceDescriptors = await loadLabeledImages(); // Load known faces
          const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

          setInterval(async () => {
            const detections = await faceapi
              .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceDescriptors();

            if (detections.length > 0) {
              const resizedDetections = faceapi.resizeResults(detections, displaySize);
              canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
              faceapi.draw.drawDetections(canvas, resizedDetections);

              detections.forEach(async (detection) => {
                const result = faceMatcher.findBestMatch(detection.descriptor);

                if (result.distance < 0.6) {
                  setPlaySound(true);
                  socket.emit('face-matched', result.label);
                } else {
                  console.log('Unknown Face');
                }
              });
            } else {
              console.log('No faces found :(');
            }
          }, 100);
        });
      }
    };

    const loadLabeledImages = async () => {
      const labels = ['samiul', 'jewell', "Jishnu", "aviroop", "Vidisha", "Joita", "Shovon", "aradhona", "Debashmita", "samridhhi", "sourish", "subhankar", "tushar"];
      return Promise.all(
        labels.map(async (label) => {
          const descriptions = [];
          for (let i = 1; i <= 2; i++) {
            const img = await faceapi.fetchImage(
              `https://raw.githubusercontent.com/Samiul-Islam-123/images/master/${label}/${i}.png`
            );
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
           //console.log(detections.descriptor)
            descriptions.push(detections.descriptor);
          }

          return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
      );
    };

    const setupFaceDetection = async () => {
      await loadModels();
      await startCamera();
      detectFaces();
    };

    setupFaceDetection();
  }, [videoRef]);

  return (
    <div>
      <video ref={videoRef} autoPlay muted playsInline />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {playSound && <audio src={dingSound} autoPlay onEnded={() => setPlaySound(false)} />}
    </div>
  );
};

export default FaceDetectionComponent;
