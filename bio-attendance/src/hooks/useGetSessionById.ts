import { useQuery } from "convex-helpers/react/cache";
import { api } from "../../convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const useGetSessionById = (sessionId: Id<"attendance_sessions">) => {
    const session  = useQuery(api.classSessions.getSessionById, { sessionId }); // Prevent calling hook with an empty ID
//     console.log("Lecturer data:", id);
    return {
        session: session,
        loading: session === undefined, // Convex returns `undefined` while loading
        error: null, // Convex doesn't provide an explicit error, so handle it elsewhere if needed
    };
};

export default useGetSessionById;