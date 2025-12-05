import { useQuery } from "convex-helpers/react/cache";
import { api } from "../../convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const useGetCourseUnitByLecture = (lecturerId:Id<"lecturers">) => {
    const courseUnits = useQuery(api.programs.getCourseUnitByLecturer,lecturerId?{ lecturerId }:"skip",); // Prevent calling hook with an empty ID
//     console.log("Lecturer data:", id);
    return {
        courseUnits: courseUnits,
        loading: courseUnits === undefined, // Convex returns `undefined` while loading
        error: null, // Convex doesn't provide an explicit error, so handle it elsewhere if needed
    };
};

export default useGetCourseUnitByLecture;