import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const create = mutation({
  args: {
    code: v.string(),
    title: v.string(),
    lecturer: v.optional(v.string()),
    lecturerId: v.optional(v.id("lecturers")),
    description: v.optional(v.string()),
    defaultDurationMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("classes")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();

    if (existing) {
      throw new ConvexError("Class code already exists");
    }

    return await ctx.db.insert("classes", {
      code: args.code,
      title: args.title,
      lecturer: args.lecturer,
      lecturerId: args.lecturerId,
      description: args.description,
      defaultDurationMinutes: args.defaultDurationMinutes,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("classes").collect();
  },
});

export const addStudentToClass = mutation({
  args: {
    classId: v.id("classes"),
    studentDocId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const rosterEntry = await ctx.db
      .query("rosters")
      .withIndex("by_class_student", (q) =>
        q.eq("classId", args.classId).eq("studentId", args.studentDocId),
      )
      .unique();

    if (rosterEntry) {
      return rosterEntry._id;
    }

    return await ctx.db.insert("rosters", {
      classId: args.classId,
      studentId: args.studentDocId,
      createdAt: Date.now(),
    });
  },
});

export const listForLecturer = query({
  args: { lecturerId: v.id("lecturers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("classes")
      .withIndex("by_lecturer", (q) => q.eq("lecturerId", args.lecturerId))
      .collect();
  },
});
