"use client"

import { useEffect, useState } from "react"
import { SessionManagement } from "./session-management"
import useCreateSession from "@/hooks/useCreateSession"
import { AttendanceSession } from "@/lib/types"
import { Id } from "@/convex/_generated/dataModel"
import useGetAllCourseUnits from "@/hooks/useGetAllCourseUnits"
import { useLecturerSession } from "@/hooks/useLecturerSession"
import UseUpdateSessionStatus from "@/hooks/UseUpdateSessionStatus"
import useGetStudentsPerLecturer from "@/hooks/useGetStudentsPerLecturer"
import {AttendanceRecord} from "@/lib/types"
import useMarkAttendance from "@/hooks/useMarkAttendance"
import useGetSessionsByLecturer from "@/hooks/useGetSessionsByLecturer"
import { useCameraControl } from "@/hooks/useCameraControl"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"



export default function SessionsPage() {
        const { session: lecturerSession } = useLecturerSession();
        const { UpdateSessionStatus } = UseUpdateSessionStatus();
        const { MarkAttendance } = useMarkAttendance();
        const { startCameraForSession, stopCameraSession } = useCameraControl();
        const updateSessionMutation = useMutation(api.classSessions.updateSession);
        const deleteSessionMutation = useMutation(api.classSessions.deleteSession);
const { courseUnits, loading: courseUnitsLoading } = useGetAllCourseUnits();
const lecturerCourses = courseUnitsLoading || !courseUnits ? [] : courseUnits.filter(cu => cu.lecturerId === lecturerSession?.userId);
const { students, loading: studentsLoading } = useGetStudentsPerLecturer(lecturerSession?.userId as Id<"lecturers">);
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const { sessions: fetchedSessions, loading, error } = useGetSessionsByLecturer(lecturerSession?.userId as Id<"lecturers">);
  const {CreateSession} = useCreateSession();

  useEffect(()=>{
        if(fetchedSessions){
                const filtered = fetchedSessions.filter((session): session is AttendanceSession => 
                        session.lecturerId !== undefined && 
                        session._id !== undefined && 
                        session._creationTime !== undefined
                );
                setSessions(filtered);
        }
  }, [fetchedSessions])

  const handleCreateSession = async (newSession: Omit<AttendanceSession, "_id" | "_creationTime"|"sessionId">) => {
    const session = newSession
    await CreateSession(session);
//     setSessions((prev) => [session, ...prev])
  }

  const handleUpdateSession = async (sessionId: Id<"attendance_sessions">, updates: Partial<AttendanceSession>) => {
    try {
      const result = await updateSessionMutation({
        sessionId,
        courseUnitCode: updates.courseUnitCode,
        sessionTitle: updates.sessionTitle,
        description: updates.description,
        startsAt: updates.startsAt,
        endsAt: updates.endsAt,
        location: updates.location,
      });
      
      if (!result.success) {
        console.error("Failed to update session:", result.message);
        alert(result.message);
        return;
      }
      
      // Update local state for immediate UI feedback
      setSessions((prev) => prev.map((s) => (s._id === sessionId ? { ...s, ...updates } : s)));
    } catch (error) {
      console.error("Error updating session:", error);
      alert("Failed to update session");
    }
  }

  const handleDeleteSession = async (sessionId: Id<"attendance_sessions">) => {
    try {
      const result = await deleteSessionMutation({ sessionId });
      
      if (!result.success) {
        console.error("Failed to delete session:", result.message);
        alert(result.message);
        return;
      }
      
      // Update local state for immediate UI feedback
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Failed to delete session");
    }
  }

  const handleStartSession = async (sessionId: Id<"attendance_sessions">) => {
        await UpdateSessionStatus(sessionId, "live");
        // Start camera for the session
        const session = sessions.find(s => s._id === sessionId);
        if (session) {
          startCameraForSession(
            sessionId, 
            session.courseUnitCode, 
            session.sessionTitle || "Attendance Session",
            "manual"
          );
        }
//     setSessions((prev) => prev.map((s) => (s._id === sessionId ? { ...s, status: "live" } : s)))
  }

  const handleEndSession = async (sessionId: Id<"attendance_sessions">) => {
    await UpdateSessionStatus(sessionId, "closed");
    // Stop camera when session ends
    stopCameraSession();
//     setSessions((prev) => prev.map((s) => (s._id === sessionId ? { ...s, status: "closed" } : s)))
  }

  const handleMarkAttendance = async (
    sessionId: Id<"attendance_sessions">, 
    studentId: Id<"students">, 
    status: "present" | "absent" | "late"
  ) => {
    const result = await MarkAttendance(sessionId, studentId, status);
    if (!result.success) {
      console.error("Failed to mark attendance:", result.error);
    }
  }

  return (
<div className="min-h-screen bg-green-50/80">
            <SessionManagement
            sessionLoading={loading}
      sessions={sessions || []}
      students={students || []}
      courses={lecturerCourses}
      onCreateSession={handleCreateSession}
      onUpdateSession={handleUpdateSession}
      onDeleteSession={handleDeleteSession}
      onStartSession={handleStartSession}
      onEndSession={handleEndSession}
      onMarkAttendance={handleMarkAttendance}
    />
</div>
  )
}
