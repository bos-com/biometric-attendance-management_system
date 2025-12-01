import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

export const gallery = query({
  args: {},
  handler: async (ctx) => {
    const faces = await ctx.db.query("faceEmbeddings").collect();
    const enriched = await Promise.all(
      faces.map(async (face) => {
        const student = await ctx.db.get(face.studentId);
        return student
          ? {
              studentDocId: face.studentId,
              descriptor: face.descriptor,
              version: face.version,
              firstName: student.firstName,
              lastName: student.lastName,
              studentCode: student.studentId,
            }
          : null;
      }),
    );
    return enriched.filter(
      (
        entry,
      ): entry is {
        studentDocId: Doc<"students">["_id"];
        descriptor: Doc<"faceEmbeddings">["descriptor"];
        version: string;
        firstName: string;
        lastName: string;
        studentCode: string;
      } => Boolean(entry),
    );
  },
});

export const replaceEmbedding = mutation({
  args: {
    studentDocId: v.id("students"),
    descriptor: v.array(v.float64()),
    version: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("faceEmbeddings")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentDocId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        descriptor: args.descriptor,
        version: args.version,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("faceEmbeddings", {
        studentId: args.studentDocId,
        descriptor: args.descriptor,
        version: args.version,
        updatedAt: Date.now(),
      });
    }
  },
});
