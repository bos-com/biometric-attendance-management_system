"use client";

import { useState } from "react";
import VideoCapture from "@/components/VideoCapture/VideoCapture";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useLecturerSession } from "@/hooks/useLecturerSession";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/adminComponents/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, AlertTriangle, Play, Clock, MapPin, BookOpen } from "lucide-react";
import Link from "next/link";
import Loader from "@/components/Loader/loader";

export default function AttendancePage() {
  const { session: lecturerSession } = useLecturerSession();
  
  // Get the current live session for this lecturer
  const liveSession = useQuery(
    api.classSessions.getLiveSessionByLecturer,
    lecturerSession?.userId ? { lecturerId: lecturerSession.userId as Id<"lecturers"> } : "skip"
  );
  
  // Get all live sessions as fallback
  const allLiveSessions = useQuery(api.classSessions.getAllLiveSessions);
  
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Use lecturer's live session first, or allow selection from all live sessions
  const activeSession = liveSession || 
    (selectedSessionId ? allLiveSessions?.find(s => s._id === selectedSessionId) : allLiveSessions?.[0]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Loading state
  if (liveSession === undefined && allLiveSessions === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <Loader />
      </div>
    );
  }

  // No active session
  if (!activeSession && (!allLiveSessions || allLiveSessions.length === 0)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle>No Active Session</CardTitle>
            <CardDescription>
              There are no live attendance sessions at the moment. Start a session to begin capturing attendance.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link href="/admin/sessions" className="w-full">
              <Button className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Go to Sessions
              </Button>
            </Link>
            <Link href="/admin/sessions" className="w-full">
              <Button variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Attendance Capture</h1>
              <p className="text-sm text-muted-foreground">
                Face recognition attendance system
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Session Selector (if multiple live sessions) */}
            {allLiveSessions && allLiveSessions.length > 1 && (
              <Select
                value={selectedSessionId || activeSession?._id}
                onValueChange={setSelectedSessionId}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {allLiveSessions.map((session) => (
                    <SelectItem key={session._id} value={session._id}>
                      {session.sessionTitle} - {session.courseUnitCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Link href="/admin/sessions">
              <Button variant="outline" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Session Info Bar */}
      {activeSession && (
        <div className="bg-green-600 text-white px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">{activeSession.sessionTitle}</span>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {activeSession.courseUnitCode}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-green-100">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  {formatTime(activeSession.startsAt)} - {formatTime(activeSession.endsAt)}
                </span>
              </div>
              {activeSession.location && (
                <div className="flex items-center gap-2 text-green-100">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{activeSession.location}</span>
                </div>
              )}
            </div>
            <Badge className="bg-white text-green-600 animate-pulse">
              <span className="mr-1">●</span> LIVE
            </Badge>
          </div>
        </div>
      )}

      {/* Main Content - Video Capture */}
      <main className="flex-1 p-4 overflow-hidden">
        <VideoCapture
          sessionId={activeSession?._id}
          onStudentRecognized={(studentId, studentName, confidence) => {
            console.log(`Recognized: ${studentName} (${(confidence * 100).toFixed(0)}%)`);
          }}
        />
      </main>
    </div>
  );
}
