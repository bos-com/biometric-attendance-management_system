/**
 * Node.js script to extract face embeddings from an image.
 * 
 * Prerequisites:
 *   npm install @vladmandic/face-api canvas
 * 
 * Usage:
 *   node test-node.mjs
 */

import * as faceapi from "@vladmandic/face-api";
import canvas from "canvas";
import path from "path";
import { fileURLToPath } from "url";

// Polyfill browser globals for face-api
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to your models (same ones used in browser, e.g., public/model)
const MODEL_PATH = path.resolve(__dirname, "../../../../../public/model");

// Path to the test image
const IMAGE_PATH = path.resolve(__dirname, "image.jpg");

async function loadModels() {
  console.log("Loading models from:", MODEL_PATH);
  await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_PATH);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
  console.log("Models loaded.");
}

async function getEmbedding(imagePath) {
  // Load image using node-canvas
  const img = await canvas.loadImage(imagePath);

  // Detect face and extract descriptor
  const detections = await faceapi
    .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (detections.length === 0) {
    console.log("No face detected in image.");
    return null;
  }

  console.log(`Detected ${detections.length} face(s).`);

  // Return descriptors as plain number arrays
  return detections.map((d) => Array.from(d.descriptor));
}

async function main() {
  await loadModels();
  const embeddings = await getEmbedding(IMAGE_PATH);

  if (embeddings) {
    console.log("Embeddings (128-dim vectors):");
    embeddings.forEach((emb, i) => {
      console.log(`Face ${i + 1}:`, emb.slice(0, 5), "... (truncated)");
    });
  }
}

main().catch(console.error);
