"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/adminComponents/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle, Users, Clock, AlertCircle, BookOpen } from "lucide-react";

interface VideoCaptureProps {
  sessionId?: Id<"attendance_sessions">;
  onStudentRecognized?: (studentId: string, studentName: string, confidence: number) => void;
}

interface RecognizedStudent {
  studentId: string;
  name: string;
  confidence: number;
  timestamp: Date;
}

const VideoCapture = ({ sessionId, onStudentRecognized }: VideoCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const isProcessingRef = useRef(false); // Use ref instead of state to avoid closure issues
  const [recognizedStudents, setRecognizedStudents] = useState<RecognizedStudent[]>([]);
  const recognizedIdsRef = useRef<Set<string>>(new Set());
  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null); // Keep faceMatcher in ref too

  // Fetch the session to get the courseUnitCode
  const session = useQuery(
    api.classSessions.getSessionById,
    sessionId ? { sessionId } : "skip"
  );

  // Fetch students only for the course unit in this session
  const courseUnitCode = session?.courseUnitCode;
  const studentsForCourse = useQuery(
    api.faces.getFaceEmbeddingsByCourseUnit,
    courseUnitCode ? { courseUnitCode } : "skip"
  );

  const recordAttendance = useMutation(api.attendance.recordRecognition);

  // Keep faceMatcherRef in sync
  useEffect(() => {
    faceMatcherRef.current = faceMatcher;
  }, [faceMatcher]);

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

  // Load labeled faces - use pre-computed descriptors when available, fall back to image processing
  useEffect(() => {
    if (!modelsLoaded || !studentsForCourse || studentsForCourse.length === 0) return;

    const loadLabeledDescriptors = async () => {
      console.log(`Processing ${studentsForCourse.length} students for course ${courseUnitCode}`);

      // Separate students with and without pre-computed descriptors
      const studentsWithDescriptors = studentsForCourse.filter(
        (student) => student.descriptor && student.descriptor.length === 128
      );
      const studentsWithoutDescriptors = studentsForCourse.filter(
        (student) => !student.descriptor || student.descriptor.length !== 128
      );

      console.log(`Found ${studentsWithDescriptors.length} students with pre-computed descriptors`);
      console.log(`Found ${studentsWithoutDescriptors.length} students requiring image processing`);

      // Fast path: Use pre-computed descriptors
      const preComputedDescriptors = studentsWithDescriptors.map((student) => {
        const label = `${student.studentId}|${student.firstName} ${student.lastName}`;
        const descriptor = new Float32Array(student.descriptor);
        return new faceapi.LabeledFaceDescriptors(label, [descriptor]);
      });

      // Slow path: Process images for students without descriptors
      const imageProcessedDescriptors = await Promise.all(
        studentsWithoutDescriptors.map(async (student) => {
          const label = `${student.studentId}|${student.firstName} ${student.lastName}`;
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

      // Combine both sets of descriptors
      const allDescriptors = [
        ...preComputedDescriptors,
        ...imageProcessedDescriptors.filter((d): d is faceapi.LabeledFaceDescriptors => d !== null),
      ];

      if (allDescriptors.length > 0) {
        console.log(`Created FaceMatcher with ${allDescriptors.length} total face descriptors`);
        setFaceMatcher(new faceapi.FaceMatcher(allDescriptors, 0.5));
      } else {
        console.warn("No valid face descriptors found. Students may need to register with photos.");
      }
    };

    loadLabeledDescriptors();
  }, [modelsLoaded, studentsForCourse, courseUnitCode]);

  // Handle recording attendance when a student is recognized
  const handleStudentRecognition = useCallback(async (
    studentId: string,
    studentName: string,
    confidence: number
  ) => {
    // Skip if already recognized in this session
    if (recognizedIdsRef.current.has(studentId)) return;

    recognizedIdsRef.current.add(studentId);
    
    const newRecognition: RecognizedStudent = {
      studentId,
      name: studentName,
      confidence,
      timestamp: new Date(),
    };
    
    setRecognizedStudents(prev => [newRecognition, ...prev]);

    // Callback for parent component
    if (onStudentRecognized) {
      onStudentRecognized(studentId, studentName, confidence);
    }

    // Record to database if session is active
    if (sessionId) {
      try {
        await recordAttendance({
          sessionId,
          studentDocId: studentId as Id<"students">,
          confidence,
          source: "auto",
        });
        console.log(` Attendance recorded for ${studentName}`);
      } catch (err) {
        console.error(` Failed to record attendance for ${studentName}:`, err);
      }
    }
  }, [sessionId, recordAttendance, onStudentRecognized]);

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
          // Use ref to prevent concurrent processing
          if (isProcessingRef.current) return;
          if (!videoRef.current || videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
          
          isProcessingRef.current = true;

          try {
            const detections = await faceapi
              .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceExpressions()
              .withFaceDescriptors();

            const resized = faceapi.resizeResults(detections, displaySize);

            const ctx = overlay.getContext("2d");
            ctx?.clearRect(0, 0, overlay.width, overlay.height);

            const currentFaceMatcher = faceMatcherRef.current;

            resized.forEach((det, i) => {
              const box = det.detection.box;
              let displayLabel = "Unknown";
              let boxColor = "#ff0000"; // Red for unknown

              if (currentFaceMatcher && detections[i]?.descriptor) {
                const bestMatch = currentFaceMatcher.findBestMatch(detections[i].descriptor);
                
                if (bestMatch.label !== "unknown" && bestMatch.distance < 0.5) {
                  // Parse studentId and name from label
                  const [studentId, studentName] = bestMatch.label.split("|");
                  const confidence = 1 - bestMatch.distance;
                  
                  displayLabel = `${studentName} (${(confidence * 100).toFixed(0)}%)`;
                  boxColor = "#00ff00"; // Green for recognized
                  
                  // Record attendance (will skip if already recorded)
                  handleStudentRecognition(studentId, studentName, confidence);
                } else {
                  displayLabel = `Unknown (${(bestMatch.distance * 100).toFixed(0)}%)`;
                }
              }

              const drawBox = new faceapi.draw.DrawBox(box, { 
                label: displayLabel,
                boxColor,
                lineWidth: 2,
              });
              drawBox.draw(overlay);
            });
          } catch (err) {
            console.error("Face detection error:", err);
          } finally {
            isProcessingRef.current = false;
          }
        }, 500); // Run detection every 500ms for better performance

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
  }, [modelsLoaded, handleStudentRecognition]);

  // Reset recognized students when session changes
  useEffect(() => {
    recognizedIdsRef.current.clear();
    setRecognizedStudents([]);
  }, [sessionId]);

  return (
    <div className="flex h-full w-full gap-4">
      {/* Video Feed */}
      <div
        ref={containerRef}
        className="relative flex-1 bg-gray-900 rounded-lg overflow-hidden"
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          muted
          playsInline
        />
        
        {/* Status Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Badge 
            className={`${modelsLoaded ? "bg-green-600" : "bg-yellow-600"} text-white`}
          >
            {modelsLoaded ? "Models Loaded" : "Loading Models..."}
          </Badge>
          {courseUnitCode && (
            <Badge className="bg-indigo-600 text-white flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {courseUnitCode}
            </Badge>
          )}
          {faceMatcher && (
            <Badge className="bg-blue-600 text-white">
              <Users className="h-3 w-3 mr-1" />
              {studentsForCourse?.length || 0} Students
            </Badge>
          )}
          {sessionId && (
            <Badge className="bg-purple-600 text-white animate-pulse">
              <span className="mr-1">●</span> Recording Active
            </Badge>
          )}
        </div>

        {/* Recognition Counter */}
        <div className="absolute top-4 right-4">
          <Card className="bg-white/90 backdrop-blur p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{recognizedStudents.length}</p>
                <p className="text-xs text-gray-500">Recognized</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recognized Students Panel */}
      <div className="w-80 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        <div className="p-4 bg-green-600 text-white">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h3 className="font-semibold">Attendance Log</h3>
          </div>
          <p className="text-sm text-green-100 mt-1">
            {recognizedStudents.length} student{recognizedStudents.length !== 1 ? "s" : ""} marked present
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {recognizedStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
              <AlertCircle className="h-12 w-12 mb-2" />
              <p className="text-center text-sm">
                No students recognized yet. Students will appear here when detected.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recognizedStudents.map((student, index) => (
                <Card key={`${student.studentId}-${index}`} className="p-3 bg-green-50 border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">{student.name}</span>
                    </div>
                    <Badge className="bg-green-600 text-xs">
                      {(student.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {student.timestamp.toLocaleTimeString()}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCapture;
