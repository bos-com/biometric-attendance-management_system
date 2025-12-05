import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function useGetCourseUnitAttendanceStats(courseUnitCode: string | undefined) {
  const stats = useQuery(
    api.attendance.getCourseUnitAttendanceStats,
    courseUnitCode ? { courseUnitCode } : "skip"
  );

  return {
    stats,
    loading: stats === undefined,
  };
}
