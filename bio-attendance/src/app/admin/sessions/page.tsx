"use client"

import { useEffect, useState } from "react"
import { SessionManagement } from "./session-management"
import type { ClassSession, Student, AttendanceRecord } from "../dashboard/DashboardPage"
import useCreateSession from "@/hooks/useCreateSession"
import { AttendanceSession } from "@/lib/types"
import useGetSessions from "@/hooks/useGetSessions"
import { Id } from "@/convex/_generated/dataModel"


// Demo course units the lecturer teaches
const lecturerCourses = [
  { code: "CS101", name: "Introduction to Programming" },
  { code: "CS201", name: "Data Structures" },
  { code: "CS301", name: "Database Systems" },
  { code: "CS401", name: "Software Engineering" },
]

// Demo students
const demoStudents: Student[] = [
  { id: "1", name: "John Doe", registrationNumber: "STU001", email: "john@university.edu" },
  { id: "2", name: "Jane Smith", registrationNumber: "STU002", email: "jane@university.edu" },
  { id: "3", name: "Michael Johnson", registrationNumber: "STU003", email: "michael@university.edu" },
  { id: "4", name: "Emily Davis", registrationNumber: "STU004", email: "emily@university.edu" },
  { id: "5", name: "Robert Wilson", registrationNumber: "STU005", email: "robert@university.edu" },
  { id: "6", name: "Sarah Brown", registrationNumber: "STU006", email: "sarah@university.edu" },
  { id: "7", name: "David Lee", registrationNumber: "STU007", email: "david@university.edu" },
  { id: "8", name: "Lisa Anderson", registrationNumber: "STU008", email: "lisa@university.edu" },
]


export default function SessionsPage() {
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

  const handleStartSession = (sessionId: Id<"attendance_sessions">) => {
    setSessions((prev) => prev.map((s) => (s._id === sessionId ? { ...s, status: "live" } : s)))
  }

  const handleEndSession = (sessionId: Id<"attendance_sessions">) => {
    setSessions((prev) => prev.map((s) => (s._id === sessionId ? { ...s, status: "closed" } : s)))
  }

//   const handleMarkAttendance = (sessionId: string, studentId: string, status: "present" | "absent" | "late") => {
//     setSessions((prev) =>
//       prev.map((s) => {
//         if (s.id === sessionId) {
//           const existingIndex = s.attendanceRecords.findIndex((r) => r.studentId === studentId)
//           const newRecord: AttendanceRecord = {
//             studentId,
//             timestamp: new Date(),
//             status,
//           }

//           if (existingIndex >= 0) {
//             const updatedRecords = [...s.attendanceRecords]
//             updatedRecords[existingIndex] = newRecord
//             return { ...s, attendanceRecords: updatedRecords }
//           }
//           return { ...s, attendanceRecords: [...s.attendanceRecords, newRecord] }
//         }
//         return s
//       }),
//     )
//   }

  return (
<div className="min-h-screen bg-green-50/80">
            <SessionManagement
            sessionLoading={loading}
      sessions={sessions || []}
      students={demoStudents}
      courses={lecturerCourses}
      onCreateSession={handleCreateSession}
      onUpdateSession={handleUpdateSession}
      onDeleteSession={handleDeleteSession}
      onStartSession={handleStartSession}
      onEndSession={handleEndSession}
//       onMarkAttendance={handleMarkAttendance}
    />
</div>
  )
}
