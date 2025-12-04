import { useQuery } from "convex-helpers/react/cache";
import { api } from "../../convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const useGetAttendancePerSession = (sessionId: Id<"attendance_sessions">) => {
    const attendance  = useQuery(api.attendance.forSession, { sessionId }); // Prevent calling hook with an empty ID
//     console.log("Lecturer data:", id);
    return {
        attendance: attendance,
        loading: attendance === undefined, // Convex returns `undefined` while loading
        error: null, // Convex doesn't provide an explicit error, so handle it elsewhere if needed
    };
};

export default useGetAttendancePerSession;