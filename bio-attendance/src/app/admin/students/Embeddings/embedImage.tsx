"use client";

import * as faceapi from "face-api.js";



export const embedImage = () => {

  const start = async (file: File) => {
    const img = await faceapi.bufferToImage(file);

    // Load models
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/model"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/model"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/model"),
      faceapi.nets.faceExpressionNet.loadFromUri("/model"),
    ]);

    // Detect faces
    const detections = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    console.log("detections:", detections);

    if (detections.length === 0) {
      alert("No face found in uploaded image");
      return null;
    }

    const descriptor = Array.from(detections[0].descriptor);
    return { descriptor: [descriptor] };
  };

  return { start };
};
