"use client"

import { useState } from "react"
import { SessionManagement } from "./session-management"
import type { ClassSession, Student, AttendanceRecord } from "../dashboard/DashboardPage"
import useCreateSession from "@/hooks/useCreateSession"
import { AttendanceSession } from "@/lib/types"


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
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const {CreateSession} = useCreateSession();

  

  const handleCreateSession = async (newSession: Omit<AttendanceSession, "_id" | "_creationTime"|"sessionId">) => {
    const session = newSession
    await CreateSession(session);
//     setSessions((prev) => [session, ...prev])
  }

  const handleUpdateSession = (sessionId: string, updates: Partial<ClassSession>) => {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, ...updates } : s)))
  }

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
  }

  const handleStartSession = (sessionId: string) => {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, status: "ongoing" } : s)))
  }

  const handleEndSession = (sessionId: string) => {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, status: "completed" } : s)))
  }

  const handleMarkAttendance = (sessionId: string, studentId: string, status: "present" | "absent" | "late") => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const existingIndex = s.attendanceRecords.findIndex((r) => r.studentId === studentId)
          const newRecord: AttendanceRecord = {
            studentId,
            timestamp: new Date(),
            status,
          }

          if (existingIndex >= 0) {
            const updatedRecords = [...s.attendanceRecords]
            updatedRecords[existingIndex] = newRecord
            return { ...s, attendanceRecords: updatedRecords }
          }
          return { ...s, attendanceRecords: [...s.attendanceRecords, newRecord] }
        }
        return s
      }),
    )
  }

  return (
<div className="min-h-screen bg-green-50/80">
            <SessionManagement
      sessions={sessions}
      students={demoStudents}
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
