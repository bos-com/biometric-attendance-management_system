"use client";

import { useEffect, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { stopCamera, toggleMinimize, maximizeCamera } from "@/store/slices/cameraSlice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/adminComponents/ui/badge";
import {
  X,
  Minimize2,
  Maximize2,
  Camera,
  Video,
  VideoOff,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import * as faceapi from "face-api.js";
import useGetImageEmbeddings from "@/hooks/useGetImageEmbeddings";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function FloatingCameraWidget() {
  const dispatch = useAppDispatch();
  const { isActive, sessionId, courseUnitCode, sessionTitle, isMinimized, startedAt } =
    useAppSelector((state) => state.camera);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);
  const [recognizedCount, setRecognizedCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState("00:00");

  const result = useGetImageEmbeddings();
  const recordAttendance = useMutation(api.attendance.recordRecognition);

  // Track recognized students to avoid duplicate recordings
  const recognizedStudentsRef = useRef<Set<string>>(new Set());

  // Update elapsed time
  useEffect(() => {
    if (!isActive || !startedAt) return;

    const updateTime = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const mins = Math.floor(elapsed / 60).toString().padStart(2, "0");
      const secs = (elapsed % 60).toString().padStart(2, "0");
      setElapsedTime(`${mins}:${secs}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isActive, startedAt]);

  // Load face-api models
  useEffect(() => {
    if (!isActive) return;

    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/model"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/model"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/model"),
      faceapi.nets.faceExpressionNet.loadFromUri("/model"),
    ]).then(() => {
      console.log("Models loaded for floating camera");
      setModelsLoaded(true);
    });
  }, [isActive]);

  // Load labeled faces from student images
  useEffect(() => {
    if (!modelsLoaded || !result?.Search || !isActive) return;

    const loadLabeledImages = async () => {
      const students = result.Search;
      if (!students || students.length === 0) return;

      const labeledDescriptors = await Promise.all(
        students.map(async (student) => {
          const label = student.studentId; // Use student ID for tracking
          const displayName = `${student.firstName} ${student.lastName}`;
          const descriptions: Float32Array[] = [];

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
              console.warn(`Failed to process image for ${displayName}:`, err);
            }
          }

          if (descriptions.length === 0) return null;

          // Store both ID and display name in the label
          return new faceapi.LabeledFaceDescriptors(`${label}|${displayName}`, descriptions);
        })
      );

      const validDescriptors = labeledDescriptors.filter(
        (d): d is faceapi.LabeledFaceDescriptors => d !== null
      );

      if (validDescriptors.length > 0) {
        setFaceMatcher(new faceapi.FaceMatcher(validDescriptors, 0.5));
      }
    };

    loadLabeledImages();
  }, [modelsLoaded, result?.Search, isActive]);

  // Start/stop video based on isActive
  useEffect(() => {
    if (!isActive || !modelsLoaded) {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Failed to start camera:", err);
      }
    };

    startVideo();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, modelsLoaded]);

  // Face detection loop
  useEffect(() => {
    if (!isActive || !modelsLoaded || !faceMatcher || isMinimized) return;

    const runDetection = async () => {
      if (!videoRef.current || videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        return;
      }

      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      // Process recognized faces
      for (const detection of detections) {
        if (!detection.descriptor) continue;

        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        
        if (bestMatch.label !== "unknown" && bestMatch.distance < 0.5) {
          const [studentId, displayName] = bestMatch.label.split("|");
          
          // Check if already recognized in this session
          if (!recognizedStudentsRef.current.has(studentId)) {
            recognizedStudentsRef.current.add(studentId);
            setRecognizedCount((prev) => prev + 1);

            // Record attendance in database
            try {
              await recordAttendance({
                sessionId: sessionId as Id<"attendance_sessions">,
                studentDocId: studentId as Id<"students">,
                confidence: 1 - bestMatch.distance,
              });
              console.log(`Attendance recorded for ${displayName}`);
            } catch (err) {
              console.error("Failed to record attendance:", err);
            }
          }
        }
      }

      // Draw on canvas if not minimized
      if (canvasRef.current && !isMinimized) {
        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        const resized = faceapi.resizeResults(detections, displaySize);
        const ctx = canvasRef.current.getContext("2d");
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        resized.forEach((det, i) => {
          const box = det.detection.box;
          let label = "Unknown";

          if (detections[i]?.descriptor) {
            const bestMatch = faceMatcher.findBestMatch(detections[i].descriptor);
            if (bestMatch.label !== "unknown") {
              const [, displayName] = bestMatch.label.split("|");
              label = `${displayName} (${((1 - bestMatch.distance) * 100).toFixed(0)}%)`;
            }
          }

          const drawBox = new faceapi.draw.DrawBox(box, { label });
          drawBox.draw(canvasRef.current!);
        });
      }
    };

    intervalRef.current = window.setInterval(runDetection, 500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, modelsLoaded, faceMatcher, isMinimized, sessionId, recordAttendance]);

  // Reset recognized students when session changes
  useEffect(() => {
    recognizedStudentsRef.current.clear();
    setRecognizedCount(0);
  }, [sessionId]);

  const handleStop = () => {
    dispatch(stopCamera());
  };

  const handleToggleMinimize = () => {
    dispatch(toggleMinimize());
  };

  if (!isActive) return null;

  // Minimized view - small floating indicator
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card
          className="p-3 bg-green-600 text-white cursor-pointer hover:bg-green-700 transition-colors shadow-lg"
          onClick={() => dispatch(maximizeCamera())}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Camera className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            <div className="text-sm">
              <p className="font-medium">Recording</p>
              <p className="text-xs opacity-80">{recognizedCount} recognized</p>
            </div>
            <Maximize2 className="h-4 w-4 ml-2" />
          </div>
        </Card>
      </div>
    );
  }

  // Full floating widget
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="overflow-hidden shadow-2xl border-2 border-green-500">
        {/* Header */}
        <div className="bg-green-600 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Video className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            <span className="text-sm font-medium truncate max-w-[120px]">
              {sessionTitle || "Live Session"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs bg-green-700 text-white">
              {elapsedTime}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-white hover:bg-green-700"
              onClick={handleToggleMinimize}
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-white hover:bg-red-600"
              onClick={handleStop}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Video Container */}
        <div ref={containerRef} className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {courseUnitCode}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {recognizedCount} recognized
            </span>
          </div>
          <Link href="/admin/attendance">
            <Button size="sm" variant="ghost" className="h-7 text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              Expand
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
