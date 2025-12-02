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
    photoDataUrl: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  })
    .index("by_studentId", ["studentId"])
    .index("by_lastName", ["lastName"]),
  classes: defineTable({
    code: v.string(),
    title: v.string(),
    lecturer: v.optional(v.string()),
    lecturerId: v.optional(v.id("lecturers")),
    description: v.optional(v.string()),
    createdAt: v.number(),
    defaultDurationMinutes: v.optional(v.number()),
  })
    .index("by_code", ["code"])
    .index("by_lecturer", ["lecturerId"]),
  rosters: defineTable({
    classId: v.id("classes"),
    studentId: v.id("students"),
    createdAt: v.number(),
  })
    .index("by_class", ["classId"])
    .index("by_student", ["studentId"])
    .index("by_class_student", ["classId", "studentId"]),
  faceEmbeddings: defineTable({
    studentId: v.id("students"),
    descriptor: v.array(v.float64()),
    version: v.string(),
    updatedAt: v.number(),
  }).index("by_student", ["studentId"]),
  sessions: defineTable({
    classId: v.id("classes"),
    startsAt: v.number(),
    endsAt: v.number(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("live"),
      v.literal("closed"),
    ),
    notes: v.optional(v.string()),
    autoClose: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_class", ["classId"])
    .index("by_status", ["status"]),
  attendance: defineTable({
    sessionId: v.id("sessions"),
    studentId: v.id("students"),
    capturedAt: v.number(),
    confidence: v.number(),
    source: v.union(v.literal("auto"), v.literal("manual")),
    frameDataUrl: v.optional(v.string()),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_student", ["sessionId", "studentId"]),
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
