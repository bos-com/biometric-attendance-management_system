"use server";
import {ConvexClient} from "convex/browser";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("CONVEX_URL is not defined");
}
const convex = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function getCourseUnitByCode (code: string) {
    try {
        const course_unit = await convex.query(api.programs.getCourseUnitByCode, { courseCode: code });
        if (!course_unit) {
            return { success: false, message: "Course unit not found", status: 404 };
        }
        return { success: true, message: "Course unit fetched successfully", status: 200, course_unit };
    } catch (error) {
        console.error("Error fetching course unit:", error);
        return { success: false, message: "Internal Server Error", status: 500 };
    }
}