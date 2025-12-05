"use client"

import { useEffect, useState } from "react"
import { SessionManagement } from "./session-management"
import type {Student } from "../dashboard/DashboardPage"
import useCreateSession from "@/hooks/useCreateSession"
import { AttendanceSession } from "@/lib/types"
import useGetSessions from "@/hooks/useGetSessions"
import { Id } from "@/convex/_generated/dataModel"
import useGetAllCourseUnits from "@/hooks/useGetAllCourseUnits"
import { useLecturerSession } from "@/hooks/useLecturerSession"
import UseUpdateSessionStatus from "@/hooks/UseUpdateSessionStatus"
import useGetStudentsPerLecturer from "@/hooks/useGetStudentsPerLecturer"
import {AttendanceRecord} from "@/lib/types"
import useMarkAttendance from "@/hooks/useMarkAttendance"



export default function SessionsPage() {
        const { session: lecturerSession } = useLecturerSession();
        const { UpdateSessionStatus } = UseUpdateSessionStatus();
        const { MarkAttendance } = useMarkAttendance();
const { courseUnits, loading: courseUnitsLoading } = useGetAllCourseUnits();
const lecturerCourses = courseUnitsLoading || !courseUnits ? [] : courseUnits.filter(cu => cu.lecturerId === lecturerSession?.userId);
const { students, loading: studentsLoading } = useGetStudentsPerLecturer(lecturerSession?.userId as Id<"lecturers">);
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const { sessions: fetchedSessions, loading, error } = useGetSessions();
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

  const handleUpdateSession = (sessionId: Id<"attendance_sessions">, updates: Partial<AttendanceSession>) => {
        
    setSessions((prev) => prev.map((s) => (s._id === sessionId ? { ...s, ...updates } : s)))
  }

  const handleDeleteSession = (sessionId: Id<"attendance_sessions">) => {
    setSessions((prev) => prev.filter((s) => s._id !== sessionId))
  }

  const handleStartSession = async (sessionId: Id<"attendance_sessions">) => {
        await UpdateSessionStatus(sessionId, "live");
//     setSessions((prev) => prev.map((s) => (s._id === sessionId ? { ...s, status: "live" } : s)))
  }

  const handleEndSession = async (sessionId: Id<"attendance_sessions">) => {
    await UpdateSessionStatus(sessionId, "closed");
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
