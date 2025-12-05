"use client"

import { useState } from "react"
import { DashboardHeader } from "./dashboard/dashboard-header"
import { DashboardStats } from "./dashboard/dashboard-stats"
import { SessionsList } from "./dashboard/sessions-list"
import { CreateSessionModal } from "./dashboard/create-session-modal"
import { SessionDetailModal } from "./dashboard/session-detail-modal"
import { AttendanceSession, Student } from "@/lib/types"
import { Id } from "@/convex/_generated/dataModel"

interface LecturerDashboardProps {
  sessions: AttendanceSession[]
  students: Student[]
  onCreateSession: (session: Omit<AttendanceSession, "_id" | "_creationTime" | "sessionId">) => void
  onStartSession: (sessionId: Id<"attendance_sessions">) => void
  onEndSession: (sessionId: Id<"attendance_sessions">) => void
  onMarkAttendance: (sessionId: Id<"attendance_sessions">, studentId: Id<"students">, status: "present" | "absent" | "late") => void
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
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "scheduled" | "live" | "closed">("all")

  // Calculate stats
  const totalSessions = sessions.length
  const totalStudents = students.length
  // Note: Attendance records are now in a separate table, these will be fetched per-session
  const averageAttendance = 0 // TODO: Calculate from attendance query

  const filteredSessions = activeTab === "all" ? sessions : sessions.filter((s) => s.status === activeTab)

  return (
    <div className="min-h-screen bg-background">
      {/* <DashboardHeader onCreateSession={() => setIsCreateModalOpen(true)} /> */}

      <main className="container mx-auto px-4 max-w-7xl">
        <DashboardStats
          totalSessions={totalSessions}
          totalStudents={totalStudents}
          averageAttendance={averageAttendance}
          ongoingSessions={sessions.filter((s) => s.status === "live").length}
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
