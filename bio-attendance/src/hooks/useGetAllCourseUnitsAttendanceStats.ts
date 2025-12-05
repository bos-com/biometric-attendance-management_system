import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function useGetAllCourseUnitsAttendanceStats(
  lecturerId: Id<"lecturers"> | undefined
) {
  const stats = useQuery(
    api.attendance.getAllCourseUnitsAttendanceStats,
    lecturerId ? { lecturerId } : "skip"
  );

  return {
    stats,
    loading: stats === undefined,
  };
}
