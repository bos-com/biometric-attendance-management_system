"use client"

import { useState } from "react"
import type { ClassSession, Student } from "./dashboard/DashboardPage"
import { DashboardHeader } from "./dashboard/dashboard-header"
import { DashboardStats } from "./dashboard/dashboard-stats"
import { SessionsList } from "./dashboard/sessions-list"
import { CreateSessionModal } from "./dashboard/create-session-modal"
import { SessionDetailModal } from "./dashboard/session-detail-modal"

interface LecturerDashboardProps {
  sessions: ClassSession[]
  students: Student[]
  onCreateSession: (session: Omit<ClassSession, "id" | "attendanceRecords" | "status">) => void
  onStartSession: (sessionId: string) => void
  onEndSession: (sessionId: string) => void
  onMarkAttendance: (sessionId: string, studentId: string, status: "present" | "absent" | "late") => void
}

export function LecturerDashboard({
  sessions,
  students,
  onCreateSession,
  onStartSession,
  onEndSession,
  onMarkAttendance,
}: LecturerDashboardProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "scheduled" | "ongoing" | "completed">("all")

  // Calculate stats
  const totalSessions = sessions.length
  const totalStudents = students.length
  const totalAttendanceRecords = sessions.reduce((acc, s) => acc + s.attendanceRecords.length, 0)
  const presentCount = sessions.reduce(
    (acc, s) => acc + s.attendanceRecords.filter((r) => r.status === "present").length,
    0,
  )
  const averageAttendance = totalAttendanceRecords > 0 ? Math.round((presentCount / totalAttendanceRecords) * 100) : 0

  const filteredSessions = activeTab === "all" ? sessions : sessions.filter((s) => s.status === activeTab)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onCreateSession={() => setIsCreateModalOpen(true)} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <DashboardStats
          totalSessions={totalSessions}
          totalStudents={totalStudents}
          averageAttendance={averageAttendance}
          ongoingSessions={sessions.filter((s) => s.status === "ongoing").length}
        />

        <SessionsList
          sessions={filteredSessions}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSelectSession={setSelectedSession}
          onStartSession={onStartSession}
          onEndSession={onEndSession}
        />
      </main>

      <CreateSessionModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateSession={onCreateSession}
      />

      <SessionDetailModal
        session={selectedSession}
        students={students}
        open={!!selectedSession}
        onOpenChange={(open) => !open && setSelectedSession(null)}
        onMarkAttendance={onMarkAttendance}
        onStartSession={onStartSession}
        onEndSession={onEndSession}
      />
    </div>
  )
}
