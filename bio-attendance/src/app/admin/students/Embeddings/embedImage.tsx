"use client";

import * as faceapi from "face-api.js";

// Track if models are already loaded
let modelsLoaded = false;

export const embedImage = () => {

  const start = async (file: File) => {
    try {
      // Load models only once
      if (!modelsLoaded) {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/model"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/model"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/model"),
          faceapi.nets.faceExpressionNet.loadFromUri("/model"),
          faceapi.nets.ssdMobilenetv1.loadFromUri("/model"), // Alternative detector
        ]);
        modelsLoaded = true;
        console.log("Face-api models loaded");
      }

      // Create image from file using a more reliable method
      const img = await createImageFromFile(file);
      console.log("Image dimensions:", img.width, "x", img.height);

      // Try TinyFaceDetector first (faster)
      let detections = await faceapi
        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 416,  // Larger input size for better detection
          scoreThreshold: 0.3  // Lower threshold to catch more faces
        }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      console.log("TinyFaceDetector detections:", detections.length);

      // If no face found, try SSD MobileNet (more accurate but slower)
      if (detections.length === 0) {
        console.log("Trying SSD MobileNet detector...");
        detections = await faceapi
          .detectAllFaces(img, new faceapi.SsdMobilenetv1Options({
            minConfidence: 0.3
          }))
          .withFaceLandmarks()
          .withFaceDescriptors();
        console.log("SSD MobileNet detections:", detections.length);
      }

      if (detections.length === 0) {
        console.warn("No face found in uploaded image");
        alert("No face found in uploaded image. Please upload a clear photo showing your face.");
        return null;
      }

      const descriptor = Array.from(detections[0].descriptor);
      console.log("Face descriptor extracted, length:", descriptor.length);
      return { descriptor: [descriptor] };
    } catch (error) {
      console.error("Error in face detection:", error);
      alert("Error processing image. Please try another photo.");
      return null;
    }
  };

  return { start };
};

// Helper function to properly load image from file
function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Revoke the object URL after loading
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image"));
    };
    // Create object URL from file
    img.src = URL.createObjectURL(file);
  });
}
