import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  students: defineTable({
    studentId: v.string(),
    firstName: v.string(),
    middleName: v.optional(v.string()),
    lastName: v.string(),
    gender: v.optional(v.string()),
    program: v.optional(v.string()),
    courseUnits: v.optional(v.array(v.string())),
    email: v.optional(v.string()),
    photoDataUrl: v.optional(v.array(v.string())),
    photoStorageId: v.optional(v.array(v.id("_storage"))),
    photoEmbeddings: v.optional(v.array(v.float64())),
    createdAt: v.number(),
  })
    .index("by_studentId", ["studentId"])
    .index("by_lastName", ["lastName"]),

  faceEmbeddings: defineTable({
    studentId: v.id("students"),
    descriptor: v.array(v.float64()),
    version: v.string(),
    studentImages: v.optional(v.array(v.id("_storage"))),
    updatedAt: v.number(),
  }).index("by_student", ["studentId"])
     .vectorIndex("by_photoEmbeddings",{
        vectorField:"descriptor",
        dimensions:128,
  }),

  sessions: defineTable({
    sessionId: v.id("classes"),
    courseUnitCode: v.string(),
    studentIds: v.array(v.id("students")),
    lecturerId: v.optional(v.id("lecturers")),
    sessionTitle: v.string(),
    description: v.optional(v.string()),
    startsAt: v.number(),
    endsAt: v.number(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("live"),
      v.literal("closed"),
    ),
    notes: v.optional(v.string()),
    autoClose: v.optional(v.boolean()),
  })
    .index("by_session", ["sessionId"])
    .index("by_status", ["status"])
     .index("by_courseUnitCode", ["courseUnitCode"])
    .index("by_lecturer", ["lecturerId"]),
    
  attendance: defineTable({
        courseUnitCode: v.string(), 
        sessionId: v.id("sessions"),
        studentIds: v.array(v.id("students")),
        capturedAt: v.number(),
        confidence: v.number(),
        source: v.union(v.literal("auto"), v.literal("manual")),
        frameDataUrl: v.optional(v.string()),
  })
  .index("by_courseUnitCode", ["courseUnitCode"])
    .index("by_session", ["sessionId"])
    .index("by_session_student", ["sessionId", "studentIds"]),

  lecturers: defineTable({
    fullName: v.string(),
    email: v.string(),
    role: v.optional(v.string()),
    passwordHash: v.string(),
    staffId: v.optional(v.string()),
  })
  .index("by_email", ["email"]),

  lecturerSessions: defineTable({
    lecturerId: v.id("lecturers"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_token", ["token"])
  .index("by_lecturer", ["lecturerId"]),


});
