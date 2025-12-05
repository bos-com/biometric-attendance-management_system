import { useQuery } from "convex-helpers/react/cache";
import { api } from "../../convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const useGetStudentsPerLecturer = (lecturerId: Id<"lecturers">) => {
    const students  = useQuery(api.students.getstudentsPerLecturer, { lecturerId }); // Prevent calling hook with an empty ID

    return {
        students: students,
        loading: students === undefined,
        error: null, 
    };
};

export default useGetStudentsPerLecturer;