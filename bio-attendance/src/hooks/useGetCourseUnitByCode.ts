import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useGetCourseUnitByCode(courseCode: string) {
  const courseUnit = useQuery(
    api.programs.getCourseUnitByCode, 
    courseCode ? { courseCode } : "skip"
  );

  return {
    courseUnit,
    loading: courseUnit === undefined,
    notFound: courseUnit === null,
  };
}

export default useGetCourseUnitByCode;
