import { action, internalQuery, mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { internal } from "./_generated/api";

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

        export const ImagesearchResults = internalQuery({
                args:{
                        results: v.array(
                                v.object({
                                        _id: v.id("faceEmbeddings"),
                                        _score: v.number()
                                }),
                        ),
                },
                handler: async (ctx, {results}) =>{
                        
                        const students = await Promise.all(
                                results.map(async ({_id,_score}) =>{
                                        const studentEmbeddings = await ctx.db.get(_id);
                                        if(!studentEmbeddings) return null;
                                        const student = await ctx.db.get(studentEmbeddings.studentId);
                                        if(!student) return null;

                                          const photoUrls = student.photoStorageId? await Promise.all(
                                                student.photoStorageId.map(async (image: string) => {
                                                        return await ctx.storage.getUrl(image);
                                                })): []

                                        return {
                                                ...student,
                                                photoDataUrl: photoUrls,
                                                score:_score,
                                        }
                                        }
                                        ))
                                          return students.filter((b)=> b!= null && b.score > 0.9);
                                        
                                }
                                
                })

        export const ImagevectorSearch: ReturnType<typeof action> = action({
                args: { embeding: v.array(v.number()) },
                handler: async (ctx, args) => {
                        const results = await ctx.vectorSearch("faceEmbeddings", "by_photoEmbeddings", {
                                vector: args.embeding,
                                limit: 6
                        });
                        return await ctx.runQuery(
                                internal.faces.ImagesearchResults, { results }
                        );
                }

        });

        export const getFaceEmbeddings = query({
        args: { },
        handler: async (ctx) => {
                const faceEmbeddings = await ctx.db.query("faceEmbeddings").collect();
                const embeddingsWithStudent = await Promise.all(
                        faceEmbeddings.map(async (embedding) => {
                                const student = await ctx.db.get(embedding.studentId);
                                const studentImages = student?.photoStorageId ? await Promise.all(
                                        student.photoStorageId.map(async (image: string) => {
                                                return await ctx.storage.getUrl(image);
                                        })) : [];
                                return student
                                        ? {
                                                studentId: embedding.studentId,
                                                descriptor: embedding.descriptor,
                                                version: embedding.version,
                                                firstName: student.firstName,
                                                lastName: student.lastName,
                                                studentCode: student.studentId,
                                                studentImages:studentImages.filter((url) => url !== null),
                                        }
                                        : null;
                        }),
                );
                const filteredEmbeddings = embeddingsWithStudent.filter((entry): entry is NonNullable<typeof entry> => entry !== null);
                console.log("Filtered Embeddings:", filteredEmbeddings);
                return filteredEmbeddings;
        },
        });