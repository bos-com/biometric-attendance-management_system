import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const create = mutation({
  args: {
        sessionTitle: v.string(),
        description: v.string(),
        courseUnitCode: v.string(),
        startsAt: v.number(),
        endsAt: v.number(),
        notes: v.optional(v.string()),
        autoClose: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.endsAt <= args.startsAt) {
      throw new ConvexError("Session end must be after start");
    }
    // Generate session ID in format: SES-XXXXXXXXXX
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const randomPart = Array.from({ length: 10 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
    const sessionId = `SES-${randomPart}`;

    return await ctx.db.insert("attendance_sessions", {
      sessionId: sessionId,
      sessionTitle: args.sessionTitle,
      description: args.description,
      courseUnitCode: args.courseUnitCode,
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      notes: args.notes,
      autoClose: args.autoClose,
      status: "scheduled",
    });
  },
});

export const setStatus = mutation({
  args: {
    sessionId: v.id("attendance_sessions"),
    status: v.union(
      v.literal("scheduled"),
      v.literal("live"),
      v.literal("closed"),
    ),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new ConvexError("Session not found");
    }

    await ctx.db.patch(session._id, {
      status: args.status,
      startsAt:
        args.status === "live" && session.startsAt > Date.now()
          ? Date.now()
          : session.startsAt,
      endsAt:
        args.status === "closed" && session.endsAt < Date.now()
          ? Date.now()
          : session.endsAt,
    });
  },
});

export const liveByClass = query({
  args: { sessionId: v.id("attendance_sessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("attendance_sessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("status"), "live"))
      .first();
  },
});

export const listByClass = query({
  args: { sessionId: v.id("attendance_sessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("attendance_sessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .collect();
  },
});

export const ensureLiveSession = mutation({
  args: {
    sessionId: v.id("attendance_sessions"),
    durationMinutes: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("attendance_sessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("status"), "live"))
      .first();

    if (existing) {
      return existing._id;
    }

    const now = Date.now();
    const durationMs = (args.durationMinutes ?? 60) * 60 * 1000;
    return await ctx.db.insert("attendance_sessions", {
            sessionId: args.sessionId,
            startsAt: now,
            endsAt: now + durationMs,
            status: "live",
            autoClose: true,
            notes: args.notes,
            courseUnitCode: "",
            sessionTitle: ""
    });
  },
});
