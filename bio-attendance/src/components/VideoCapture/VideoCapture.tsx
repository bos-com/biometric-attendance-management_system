"use client";
import { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";

const VideoCapture = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let stream: MediaStream;

    const startVideo = async () => {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    };

    // Load models + start camera
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/model"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/model"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/model"),
      faceapi.nets.faceExpressionNet.loadFromUri("/model"),
    ]).then(startVideo);

    videoRef.current?.addEventListener("play", () => {
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

          faceapi.draw.drawDetections(overlay, resized);
          faceapi.draw.drawFaceLandmarks(overlay, resized);
          faceapi.draw.drawFaceExpressions(overlay, resized);
        }, 100);

        // Store interval id so you can clear it
        overlay.dataset.intervalId = String(intervalId);
      };

      ensureReady();
    });

    return () => stream?.getTracks().forEach((track) => track.stop());
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-[50%] bg-amber-300 overflow-hidden"
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
