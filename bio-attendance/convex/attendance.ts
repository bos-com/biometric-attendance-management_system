import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const recordRecognition = mutation({
  args: {
    sessionId: v.id("sessions"),
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
      .query("attendance")
      .withIndex("by_session_student", (q) =>
        q.eq("sessionId", args.sessionId).eq("studentId", args.studentDocId),
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("attendance", {
      sessionId: args.sessionId,
      studentId: args.studentDocId,
      capturedAt: Date.now(),
      confidence: args.confidence,
      source: args.source ?? "auto",
      frameDataUrl: args.frameDataUrl,
    });
  },
});

export const forSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("attendance")
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
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("attendance")
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
