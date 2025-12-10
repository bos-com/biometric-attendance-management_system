import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  students: defineTable({
    studentId: v.string(),
    firstName: v.string(),
    middleName: v.optional(v.string()),
    lastName: v.string(),
    gender: v.optional(v.string()),
    program: v.string(),
    courseUnits: v.array(v.string()),
    email: v.string(),
    photoDataUrl: v.optional(v.array(v.string())),
    photoStorageId: v.optional(v.array(v.id("_storage"))),
    photoEmbeddings: v.optional(v.array(v.float64())),
    createdAt: v.number(),
  })
    .index("by_studentId", ["studentId"])
    .index("by_courseUnits", ["courseUnits"])
    .index("by_lastName", ["lastName"]),

    programs: defineTable({
        program_code: v.string(),
        name: v.string(),
        description: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_program_code", ["program_code"]),

    course_units: defineTable({
        code: v.string(),
        name: v.string(),
        semester: v.string(),
        programId: v.id("programs"),
        lecturerId: v.optional(v.id("lecturers")),
        hours_per_session: v.number(),
    }).index("by_courseCode", ["code"])
    .index("by_lecturer", ["lecturerId"]),

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

  attendance_sessions: defineTable({
    sessionId: v.string(),
    courseUnitCode: v.string(),
    lecturerId: v.optional(v.id("lecturers")),
    sessionTitle: v.string(),
    description: v.optional(v.string()),
    startsAt: v.number(),
    endsAt: v.number(),
    location: v.string(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("live"),
      v.literal("closed"),
    ),
    notes: v.optional(v.string()),
    autoStart: v.optional(v.boolean()),
    autoClose: v.optional(v.boolean()),
  })
    .index("by_session", ["sessionId"])
    .index("by_status", ["status"])
     .index("by_courseUnitCode", ["courseUnitCode"])
    .index("by_lecturer", ["lecturerId"]),
    
  attendance_records: defineTable({
        courseUnitCode: v.string(), 
        sessionId: v.id("attendance_sessions"),
        studentId: v.id("students"),
        confidence: v.number(),
        status: v.union(
                v.literal("present"),
                v.literal("absent"),
                v.literal("late")),
  })
  .index("by_courseUnitCode", ["courseUnitCode"])
    .index("by_session", ["sessionId"])
    .index("by_status", ["status"])
    .index("by_studentId_and_sessionId", ["studentId", "sessionId"])
    .index("by_studentId", ["studentId"]),

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

  // Password reset tokens for forgot password flow
  passwordResetTokens: defineTable({
    lecturerId: v.id("lecturers"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    used: v.boolean(),
  })
    .index("by_token", ["token"])
    .index("by_lecturer", ["lecturerId"]),

});
