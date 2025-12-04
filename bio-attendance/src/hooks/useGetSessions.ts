import { useQuery } from "convex-helpers/react/cache";
import { api } from "../../convex/_generated/api";

const useGetSessions = () => {
    const sessions = useQuery(api.classSessions.getSessions); // Prevent calling hook with an empty ID
//     console.log("Lecturer data:", id);
    return {
        sessions: sessions,
        loading: sessions === undefined, // Convex returns `undefined` while loading
        error: null, // Convex doesn't provide an explicit error, so handle it elsewhere if needed
    };
};

export default useGetSessions;