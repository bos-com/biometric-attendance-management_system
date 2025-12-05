import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const getAllPrograms = query({
  args: {},
  handler: async (ctx) => {
        const programs = await ctx.db.query("programs").collect();
    return programs;
  },
});

export const getAllCourseUnits = query({
  args: {},
  handler: async (ctx) => {
        const courseUnits = await ctx.db.query("course_units").collect();
    return courseUnits;
  }
});

export const getProgramById = query({
        args: {
                id: v.id("programs"),
        },
        handler: async (ctx, args) => {
                const program = await ctx.db.get(args.id);
                return program;
        }
});

export const getCourseUnitByCode = query({
        args: {
                courseCode: v.string(),
        },
        handler: async (ctx, args) => {
                const courseUnit = await ctx.db.query("course_units")
                .withIndex("by_courseCode", (q) => q
                .eq("code", args.courseCode)).first();
                return courseUnit;
        }
});

export const getCourseUnitByLecturer = query({
        args: {
                lecturerId: v.id("lecturers"),
        },
        handler: async (ctx, args) => {
                const courseUnits = await ctx.db.query("course_units")
                .withIndex("by_lecturer", (q) => q
                .eq("lecturerId", args.lecturerId))
                .collect();
                return courseUnits;
        }
});