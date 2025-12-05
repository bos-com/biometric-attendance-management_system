import { useQuery } from "convex-helpers/react/cache";
import { api } from "../../convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const useGetStudentsPerLecturer = (lecturerId: Id<"lecturers">) => {
    const students  = useQuery(api.students.getstudentsPerLecturer, lecturerId?{ lecturerId }:"skip"); // Prevent calling hook with an empty ID
        console.log("Students per lecturer hook:", students);
    return {
        students: students,
        loading: students === undefined,
        error: null, 
    };
};

export default useGetStudentsPerLecturer;