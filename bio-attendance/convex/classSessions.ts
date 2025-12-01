import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const create = mutation({
  args: {
    classId: v.id("classes"),
    startsAt: v.number(),
    endsAt: v.number(),
    notes: v.optional(v.string()),
    autoClose: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.endsAt <= args.startsAt) {
      throw new ConvexError("Session end must be after start");
    }

    return await ctx.db.insert("sessions", {
      classId: args.classId,
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      notes: args.notes,
      autoClose: args.autoClose,
      status: "scheduled",
      createdAt: Date.now(),
    });
  },
});

export const setStatus = mutation({
  args: {
    sessionId: v.id("sessions"),
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
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .filter((q) => q.eq(q.field("status"), "live"))
      .first();
  },
});

export const listByClass = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .order("desc")
      .collect();
  },
});

export const ensureLiveSession = mutation({
  args: {
    classId: v.id("classes"),
    durationMinutes: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .filter((q) => q.eq(q.field("status"), "live"))
      .first();

    if (existing) {
      return existing._id;
    }

    const now = Date.now();
    const durationMs = (args.durationMinutes ?? 60) * 60 * 1000;
    return await ctx.db.insert("sessions", {
      classId: args.classId,
      startsAt: now,
      endsAt: now + durationMs,
      status: "live",
      autoClose: true,
      notes: args.notes,
      createdAt: now,
    });
  },
});
