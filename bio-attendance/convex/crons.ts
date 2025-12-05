import { internalMutation, internalQuery, internalAction, mutation } from "./_generated/server";
import { v } from "convex/values";
import { cronJobs } from "convex/server";
import { internal, api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const getSessionsToAutoStart = internalQuery({
  args: {},
  handler: async (ctx) => {
        const now = Date.now();
        const sessions = await ctx.db.query("attendance_sessions").filter((q) =>
                q.and(
                        q.eq(q.field("status"), "scheduled"),
                        q.lte(q.field("startsAt"), now)
                )
        ).collect();
        return sessions;
  },
});
export const getSessionsToAutoEnd = internalQuery({
  args: {},
  handler: async (ctx) => {
        const now = Date.now();
        const sessions = await ctx.db.query("attendance_sessions").filter((q) =>
                q.and(
                        q.eq(q.field("status"), "live"),
                        q.lte(q.field("endsAt"), now)
                )
        ).collect();
        return sessions;
  },
});

export const startSession = internalMutation({
  args: {
    sessionId: v.id("attendance_sessions"),
  },
  handler: async (ctx, args) => {
        await ctx.db.patch(args.sessionId, {
        status: "live",
    });
  },
}); 

export const endSession = internalMutation({
  args: {
    sessionId: v.id("attendance_sessions"),
        },
        handler: async (ctx, args) => {
        await ctx.db.patch(args.sessionId, {
        status: "closed",
    });
  },
});

export const autoStartSessions = internalAction({
  args: {},
  handler: async (ctx) => {
        const sessionsToStart = await ctx.runQuery(internal.crons.getSessionsToAutoStart, {});
        for (const session of sessionsToStart) {
                await ctx.runMutation(internal.crons.startSession, { sessionId: session._id });
        }
  },
});

export const autoEndSessions = internalAction({
  args: {},
  handler: async (ctx) => {

        const sessionsToEnd = await ctx.runQuery(internal.crons.getSessionsToAutoEnd, {});
        for (const session of sessionsToEnd) {
                await ctx.runMutation(internal.crons.endSession, { sessionId: session._id });
        }
  },
});

const crons = cronJobs();
crons.interval(
  "Notify expiring subscriptions",
  { minutes: 1 },
  internal.crons.autoStartSessions,
  {}
);
crons.interval(
  "Auto end live sessions",
  { minutes: 1 },
  internal.crons.autoEndSessions,
  {}
);
export default crons;