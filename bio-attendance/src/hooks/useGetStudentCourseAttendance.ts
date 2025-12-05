import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function useGetStudentCourseAttendance(
  studentId: Id<"students"> | undefined,
  courseUnitCode: string | undefined
) {
  const attendance = useQuery(api.attendance.getStudentCourseAttendance,
        studentId && courseUnitCode ? { studentId, courseUnitCode } : "skip"
  );

  return {
    records: attendance?.records ?? [],
    stats: attendance?.stats ?? {
      totalSessions: 0,
      attendedSessions: 0,
      presentCount: 0,
      lateCount: 0,
      absentCount: 0,
      missedSessions: 0,
      attendanceRate: 0,
    },
    loading: attendance === undefined,
  };
}
