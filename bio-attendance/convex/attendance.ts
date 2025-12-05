import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const recordRecognition = mutation({
  args: {
    sessionId: v.id("attendance_sessions"),
    studentDocId: v.id("students"),
    confidence: v.number(),
    source: v.optional(v.union(v.literal("auto"), v.literal("manual"))),
    frameDataUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new ConvexError("Session not found");
    }
    if (session.status !== "live") {
      throw new ConvexError("Session is not live");
    }

    const existing = await ctx.db
      .query("attendance_records")
      .withIndex("by_studentId_and_sessionId", (q) =>q
      .eq("studentId", args.studentDocId)
      .eq("sessionId", args.sessionId)
     
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("attendance_records", {
      sessionId: args.sessionId,
      courseUnitCode: session.courseUnitCode,
      studentId: args.studentDocId,
      confidence: args.confidence,
      status: args.confidence >= 0.8 ? "early" : "late",
    });
  },
});

export const forSession = query({
  args: { sessionId: v.id("attendance_sessions") },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("attendance_records")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      records.map(async (record) => {
        const student = await ctx.db.get(record.studentId);
        return student
          ? {
              ...record,
              student,
            }
          : null;
      }),
    );

    return enriched.filter(Boolean);
  },
});

export const summary = query({
  args: { sessionId: v.id("attendance_sessions") },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("attendance_records")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const total = records.length;
    const avgConfidence =
      total === 0
        ? 0
        : records.reduce((sum, r) => sum + r.confidence, 0) / total;

    return { total, avgConfidence };
  },
});

// Manual attendance marking by lecturer
export const markAttendance = mutation({
  args: {
    sessionId: v.id("attendance_sessions"),
    studentId: v.id("students"),
    status: v.union(v.literal("present"), v.literal("absent"), v.literal("late")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new ConvexError("Session not found");
    }

    // Check if record already exists
    const existing = await ctx.db
      .query("attendance_records")
      .withIndex("by_studentId_and_sessionId", (q) =>
        q.eq("studentId", args.studentId).eq("sessionId", args.sessionId)
      )
      .unique();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, { status: args.status });
      return existing._id;
    }

    // Create new record
    return await ctx.db.insert("attendance_records", {
      sessionId: args.sessionId,
      courseUnitCode: session.courseUnitCode,
      studentId: args.studentId,
      confidence: 1, // Manual marking = 100% confidence
      status: args.status,
    });
  },
});
