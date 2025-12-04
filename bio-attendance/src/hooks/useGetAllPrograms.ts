import { useQuery } from "convex-helpers/react/cache";
import { api } from "../../convex/_generated/api";

const useGetAllPrograms = () => {
    const programs  = useQuery(api.programs.getAllPrograms); // Prevent calling hook with an empty ID
//     console.log("Lecturer data:", id);
    return {
        programs: programs,
        loading: programs === undefined, // Convex returns `undefined` while loading
        error: null, // Convex doesn't provide an explicit error, so handle it elsewhere if needed
    };
};

export default useGetAllPrograms;