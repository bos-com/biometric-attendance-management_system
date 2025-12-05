"use client"

import { LecturerDashboard } from "../lecturer-dashboard"
import { AttendanceSession, Student } from "@/lib/types"
import useGetStudentsPerLecturer from "@/hooks/useGetStudentsPerLecturer"
import { useLecturerSession } from "@/hooks/useLecturerSession"
import { Id } from "@/convex/_generated/dataModel"
import useGetSessionsByLecturer from "@/hooks/useGetSessionsByLecturer"
import useCreateSession from "@/hooks/useCreateSession"
import UseUpdateSessionStatus from "@/hooks/UseUpdateSessionStatus"
import useMarkAttendance from "@/hooks/useMarkAttendance"

export default function DashboardPage() {
  const { session: lecturerSession } = useLecturerSession();
  const { sessions: lecturerSessions, loading: sessionsLoading } = useGetSessionsByLecturer(
    lecturerSession?.userId as Id<"lecturers">
  );
  const { students, loading: studentsLoading } = useGetStudentsPerLecturer(
    lecturerSession?.userId as Id<"lecturers">
  );

  const { CreateSession } = useCreateSession();
  const { UpdateSessionStatus } = UseUpdateSessionStatus();
  const { MarkAttendance } = useMarkAttendance();

  const handleCreateSession = async (
    newSession: Omit<AttendanceSession, "_id" | "_creationTime" | "sessionId">
  ) => {
    await CreateSession(newSession);
  };

  const handleStartSession = async (sessionId: Id<"attendance_sessions">) => {
    await UpdateSessionStatus(sessionId, "live");
  };

  const handleEndSession = async (sessionId: Id<"attendance_sessions">) => {
    await UpdateSessionStatus(sessionId, "closed");
  };

  const handleMarkAttendance = async (
    sessionId: Id<"attendance_sessions">,
    studentId: Id<"students">,
    status: "present" | "absent" | "late"
  ) => {
    await MarkAttendance(sessionId, studentId, status);
  };

  // Convert students to proper type or use empty array
  const typedStudents: Student[] = students ?? [];

  return (
    <LecturerDashboard
      sessions={lecturerSessions ?? []}
      students={typedStudents}
      onCreateSession={handleCreateSession}
      onStartSession={handleStartSession}
      onEndSession={handleEndSession}
      onMarkAttendance={handleMarkAttendance}
    />
  );
}
