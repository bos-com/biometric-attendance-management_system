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
    program: v.optional(v.string()),
    courseUnits: v.optional(v.array(v.string())),
    email: v.optional(v.string()),
    classIds: v.optional(v.array(v.id("classes"))),
    photoDataUrl: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
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

    if (args.classIds) {
      for (const classId of args.classIds) {
        const current = await ctx.db
          .query("rosters")
          .withIndex("by_class_student", (q) =>
            q.eq("classId", classId).eq("studentId", newStudentId),
          )
          .unique();
        if (!current) {
          await ctx.db.insert("rosters", {
            classId,
            studentId: newStudentId,
            createdAt: now,
          });
        }
      }
    }

    return {
        message: "Student registered successfully.",
        success:true,
        newStudentId:newStudentId
    };
  },
});

export const list = query({
  args: {
    classId: v.optional(v.id("classes")),
  },
  handler: async (ctx, args) => {
    if (args.classId) {
      const classId = args.classId;
      const roster = await ctx.db
        .query("rosters")
        .withIndex("by_class", (q) => q.eq("classId", classId))
        .collect();
      const students = await Promise.all(
        roster.map((entry) => ctx.db.get(entry.studentId)),
      );
      return students.filter((student): student is Doc<"students"> => Boolean(student));
    }

    return await ctx.db.query("students").collect();
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
    photoDataUrl: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
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
