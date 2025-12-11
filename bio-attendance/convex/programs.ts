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

export const getCourseUnitsByProgram = query({
        args: {
                programId: v.id("programs"),
        },
        handler: async (ctx, args) => {
                const courseUnits = await ctx.db.query("course_units")
                        .withIndex("by_program", (q) => q.eq("programId", args.programId))
                        .collect();
                return courseUnits;
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

// Get course units by program with lecturer info (to show if already assigned)
export const getCourseUnitsWithLecturerInfo = query({
        args: {
                programId: v.optional(v.id("programs")),
        },
        handler: async (ctx, args) => {
                let courseUnits;
                if (args.programId) {
                        courseUnits = await ctx.db.query("course_units")
                                .filter((q) => q.eq(q.field("programId"), args.programId))
                                .collect();
                } else {
                        courseUnits = await ctx.db.query("course_units").collect();
                }

                // Get lecturer info for each course unit
                const courseUnitsWithLecturer = await Promise.all(
                        courseUnits.map(async (unit) => {
                                let lecturerName = null;
                                if (unit.lecturerId) {
                                        const lecturer = await ctx.db.get(unit.lecturerId);
                                        lecturerName = lecturer?.fullName || null;
                                }
                                return {
                                        ...unit,
                                        assignedLecturerName: lecturerName,
                                        isAssigned: !!unit.lecturerId,
                                };
                        })
                );

                return courseUnitsWithLecturer;
        }
});