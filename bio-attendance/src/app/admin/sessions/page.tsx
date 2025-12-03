"use client"

import { useState } from "react"
import { SessionManagement } from "./session-management"
import type { ClassSession, Student, AttendanceRecord } from "../dashboard/DashboardPage"

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

// Demo sessions
const initialSessions: ClassSession[] = [
  {
    id: "1",
    courseCode: "CS101",
    courseName: "Introduction to Programming",
    date: new Date(),
    startTime: "09:00",
    endTime: "11:00",
    location: "Room A101",
    status: "completed",
    attendanceRecords: [
      { studentId: "1", timestamp: new Date(), status: "present" },
      { studentId: "2", timestamp: new Date(), status: "present" },
      { studentId: "3", timestamp: new Date(), status: "late" },
      { studentId: "4", timestamp: new Date(), status: "present" },
      { studentId: "5", timestamp: new Date(), status: "absent" },
    ],
  },
  {
    id: "2",
    courseCode: "CS201",
    courseName: "Data Structures",
    date: new Date(),
    startTime: "14:00",
    endTime: "16:00",
    location: "Room B202",
    status: "ongoing",
    attendanceRecords: [
      { studentId: "1", timestamp: new Date(), status: "present" },
      { studentId: "2", timestamp: new Date(), status: "present" },
      { studentId: "7", timestamp: new Date(), status: "present" },
    ],
  },
  {
    id: "3",
    courseCode: "CS301",
    courseName: "Database Systems",
    date: new Date(Date.now() + 86400000),
    startTime: "10:00",
    endTime: "12:00",
    location: "Room C303",
    status: "scheduled",
    attendanceRecords: [],
  },
  {
    id: "4",
    courseCode: "CS101",
    courseName: "Introduction to Programming",
    date: new Date(Date.now() + 86400000 * 2),
    startTime: "09:00",
    endTime: "11:00",
    location: "Room A101",
    status: "scheduled",
    attendanceRecords: [],
  },
  {
    id: "5",
    courseCode: "CS401",
    courseName: "Software Engineering",
    date: new Date(Date.now() - 86400000),
    startTime: "13:00",
    endTime: "15:00",
    location: "Room D404",
    status: "completed",
    attendanceRecords: [
      { studentId: "1", timestamp: new Date(), status: "present" },
      { studentId: "3", timestamp: new Date(), status: "present" },
      { studentId: "5", timestamp: new Date(), status: "late" },
      { studentId: "6", timestamp: new Date(), status: "present" },
      { studentId: "8", timestamp: new Date(), status: "present" },
    ],
  },
]

export default function SessionsPage() {
  const [sessions, setSessions] = useState<ClassSession[]>(initialSessions)

  const handleCreateSession = (newSession: Omit<ClassSession, "id" | "attendanceRecords" | "status">) => {
    const session: ClassSession = {
      ...newSession,
      id: Date.now().toString(),
      status: "scheduled",
      attendanceRecords: [],
    }
    setSessions((prev) => [session, ...prev])
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
