import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function useMarkAttendance() {
  const markAttendance = useMutation(api.attendance.markAttendance);

  const MarkAttendance = async (
    sessionId: Id<"attendance_sessions">,
    studentId: Id<"students">,
    status: "present" | "absent" | "late"
  ) => {
    try {
      const recordId = await markAttendance({ sessionId, studentId, status });
      return { success: true, recordId };
    } catch (error) {
      console.error("Error marking attendance:", error);
      return { success: false, error };
    }
  };

  return { MarkAttendance };
}
