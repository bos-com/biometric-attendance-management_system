"use client"

import { useState } from "react"
import { LecturerDashboard } from "../lecturer-dashboard"

// Types for the dashboard
export interface Student {
  id: string
  name: string
  registrationNumber: string
  email: string
  photo?: string
}

export interface AttendanceRecord {
  studentId: string
  timestamp: Date
  status: "present" | "absent" | "late"
}

export interface ClassSession {
  id: string
  courseCode: string
  courseName: string
  date: Date
  startTime: string
  endTime: string
  location: string
  title?: string
  description?: string
  autoStart?: boolean
  autoClose?: boolean
  status: "scheduled" | "ongoing" | "completed"
  attendanceRecords: AttendanceRecord[]
}

// Demo data
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

const demoSessions: ClassSession[] = [
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
      { studentId: "6", timestamp: new Date(), status: "present" },
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
      { studentId: "8", timestamp: new Date(), status: "late" },
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
]

export default function DashboardPage() {
  const [sessions, setSessions] = useState<ClassSession[]>(demoSessions)
  const [students] = useState<Student[]>(demoStudents)

  const handleCreateSession = (newSession: Omit<ClassSession, "id" | "attendanceRecords" | "status">) => {
    const session: ClassSession = {
      ...newSession,
      id: Date.now().toString(),
      status: "scheduled",
      attendanceRecords: [],
    }
    setSessions((prev) => [...prev, session])
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
          const newRecord: AttendanceRecord = { studentId, timestamp: new Date(), status }

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
    <LecturerDashboard
      sessions={sessions}
      students={students}
      onCreateSession={handleCreateSession}
      onStartSession={handleStartSession}
      onEndSession={handleEndSession}
      onMarkAttendance={handleMarkAttendance}
    />
  )
}
