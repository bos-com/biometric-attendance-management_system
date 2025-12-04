"use client";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import useGetImageEmbeddings from "@/hooks/useGetImageEmbeddings";

const VideoCapture = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const result = useGetImageEmbeddings();
  console.log("Embeddings fetched:", result);

  // Load face-api models
  useEffect(() => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/model"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/model"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/model"),
      faceapi.nets.faceExpressionNet.loadFromUri("/model"),
    ]).then(() => {
      console.log("Models loaded");
      setModelsLoaded(true);
    });
  }, []);

  // Load labeled faces from student images
  useEffect(() => {
    if (!modelsLoaded || !result?.Search) return;

    const loadLabeledImages = async () => {
      const students = result.Search;
      if (!students || students.length === 0) return;

      console.log("Loading labeled images for", students.length, "students");

      const labeledDescriptors = await Promise.all(
        students.map(async (student) => {
                console.log("Processing student:", student.studentImages);
          const label = `${student.firstName} ${student.lastName}`;
          const descriptions: Float32Array[] = [];

          // Process each image URL for this student
          const imageUrls = student.studentImages ?? [];
          for (const url of imageUrls) {
            if (!url) continue;
            try {
              const img = await faceapi.fetchImage(url);
              const detection = await faceapi
                .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

              if (detection?.descriptor) {
                descriptions.push(detection.descriptor);
              }
            } catch (err) {
              console.warn(`Failed to process image for ${label}:`, err);
            }
          }

          if (descriptions.length === 0) {
            console.warn(`No valid face found for ${label}`);
            return null;
          }

          return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
      );

      const validDescriptors = labeledDescriptors.filter(
        (d): d is faceapi.LabeledFaceDescriptors => d !== null
      );

      if (validDescriptors.length > 0) {
        console.log("Created FaceMatcher with", validDescriptors.length, "labeled faces");
        // Threshold of 0.5 means: if distance > 0.5, return "unknown"
        // Lower = stricter matching, Higher = more lenient
        setFaceMatcher(new faceapi.FaceMatcher(validDescriptors, 0.5));
      }
    };

    loadLabeledImages();
  }, [modelsLoaded, result?.Search]);

  useEffect(() => {
    if (!modelsLoaded) return;

    let stream: MediaStream;

    const startVideo = async () => {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    };

    startVideo();

    const handlePlay = () => {
      const ensureReady = () => {
        if (!videoRef.current) return;

        if (videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
          videoRef.current.addEventListener("loadeddata", ensureReady, { once: true });
          return;
        }

        // Create overlay canvas ONCE
        if (!canvasRef.current) {
          const overlay = faceapi.createCanvasFromMedia(videoRef.current);
          overlay.style.position = "absolute";
          overlay.style.top = "0";
          overlay.style.left = "0";
          overlay.style.width = "100%";
          overlay.style.height = "100%";
          overlay.style.pointerEvents = "none";

          canvasRef.current = overlay;
          containerRef.current?.appendChild(overlay);
        }

        const overlay = canvasRef.current;

        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        };

        faceapi.matchDimensions(overlay, displaySize);

        const intervalId = setInterval(async () => {
          const detections = await faceapi
            .detectAllFaces(videoRef.current!, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withFaceDescriptors();

          const resized = faceapi.resizeResults(detections, displaySize);

          const ctx = overlay.getContext("2d");
          ctx?.clearRect(0, 0, overlay.width, overlay.height);

          resized.forEach((det, i) => {
            const box = det.detection.box;
            let label = "Unknown";

            if (faceMatcher && detections[i]?.descriptor) {
              const bestMatch = faceMatcher.findBestMatch(detections[i].descriptor);
              // bestMatch.label will be "unknown" if distance > threshold
              // bestMatch.distance shows how different the faces are (lower = better match)
              label = bestMatch.label === "unknown" 
                ? `Unknown (${bestMatch.distance.toFixed(2)})` 
                : `${bestMatch.label} (${bestMatch.distance.toFixed(2)})`;
        //       console.log("Match:", bestMatch.label, "Distance:", bestMatch.distance);
            }

            const drawBox = new faceapi.draw.DrawBox(box, { label });
            drawBox.draw(overlay);

          });
        }, 1);

        // Store interval id so you can clear it
        overlay.dataset.intervalId = String(intervalId);
      };

      ensureReady();
    };

    const videoElement = videoRef.current;
    videoElement?.addEventListener("play", handlePlay);

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
      videoElement?.removeEventListener("play", handlePlay);
      const intervalId = canvasRef.current?.dataset.intervalId;
      if (intervalId) {
        clearInterval(Number(intervalId));
      }
    };
  }, [modelsLoaded, faceMatcher]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-amber-300 overflow-hidden"
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        muted
        playsInline
      />
      
    </div>
  );
};

export default VideoCapture;
