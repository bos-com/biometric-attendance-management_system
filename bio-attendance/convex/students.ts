import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { ConvexError, v } from "convex/values";

export const registerWithFace = mutation({
  args: {
    studentId: v.string(),
    firstName: v.string(),
    middleName: v.optional(v.string()),
    lastName: v.string(),
    gender: v.optional(v.string()),
    program: v.string(),
    courseUnits: v.optional(v.array(v.string())),
    email: v.string(),
    photoDataUrl: v.optional(v.array(v.string())),
    photoStorageId: v.optional(v.array(v.id("_storage"))),
    photoEmbeddings: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("students")
      .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
      .unique();

    if (existing) {
        return {
                message: "Student ID is already registered.",
                success: false,
                newStudentId: null
        }
    }

    const newStudentId = await ctx.db.insert("students", {
      studentId: args.studentId,
      firstName: args.firstName,
      middleName: args.middleName,
      lastName: args.lastName,
      gender: args.gender,
      program: args.program,
      courseUnits: args.courseUnits ?? [],
      email: args.email,
      photoDataUrl: args.photoDataUrl,
      photoStorageId: args.photoStorageId,
      createdAt: now,
    });

    if (args.photoEmbeddings && args.photoEmbeddings.length > 0) {
      await ctx.db.insert("faceEmbeddings", {
        studentId: newStudentId,
        descriptor: args.photoEmbeddings,
        version: "faceapi-v1",
        updatedAt: now,
      });
    }

    return {
        message: "Student registered successfully.",
        success:true,
        newStudentId:newStudentId
    };
  },
});



export const updateDetails = mutation({
  args: {
    studentDocId: v.id("students"),
    firstName: v.string(),
    middleName: v.optional(v.string()),
    lastName: v.string(),
    gender: v.optional(v.string()),
    program: v.optional(v.string()),
    courseUnits: v.optional(v.array(v.string())),
    email: v.optional(v.string()),
    photoDataUrl: v.optional(v.array(v.string())),
    photoStorageId: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.studentDocId, {
      firstName: args.firstName,
      middleName: args.middleName,
      lastName: args.lastName,
      gender: args.gender,
      program: args.program,
      courseUnits: args.courseUnits ?? [],
      email: args.email,
      photoDataUrl: args.photoDataUrl,
      photoStorageId: args.photoStorageId,
    });
  },
});

export const getAllStudents = query({
  args: {},
  handler: async (ctx) => {
    const students  = await ctx.db.query("students").order("asc").collect();
        return students;  
},
});
export const getstudentsPerLecturer = query({
  args: {
    lecturerId: v.id("lecturers"),
  },
  handler: async (ctx, args) => {
    const courseUnits = await ctx.db
      .query("course_units")
      .withIndex("by_lecturer", (q) => q.eq("lecturerId", args.lecturerId))
      .collect();

    const courseUnitsCodes = new Set(courseUnits.map((cu) => cu.code));

    // Get all students and filter those who have at least one matching course
    const allStudents = await ctx.db.query("students").collect();

    const matchingStudents = allStudents.filter((student) =>
      student.courseUnits.some((code) => courseUnitsCodes.has(code))
    );

    return matchingStudents;
  },
});