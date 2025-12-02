import { useQuery } from "convex-helpers/react/cache";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const useGetLecturer = (id:  Id<"lecturers">) => {
    const Lecturer = useQuery(api.lecturers.GetLecturerById, id ? { id } : "skip"); // Prevent calling hook with an empty ID
//     console.log("Lecturer data:", id);
    return {
        user: Lecturer,
        loading: Lecturer === undefined, // Convex returns `undefined` while loading
        error: null, // Convex doesn't provide an explicit error, so handle it elsewhere if needed
    };
};

export default useGetLecturer;