import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

// Grace period in minutes - students arriving within this time after session starts are marked "present"
const LATE_THRESHOLD_MINUTES = 15;

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

    // Determine if student is early/on-time or late based on arrival time
    const now = Date.now();
    const lateThreshold = session.startsAt + (LATE_THRESHOLD_MINUTES * 60 * 1000);
    
    // Student is "present" if they arrive before or within the grace period
    // Student is "late" if they arrive after the grace period
    const status: "present" | "late" = now <= lateThreshold ? "present" : "late";

    return await ctx.db.insert("attendance_records", {
      sessionId: args.sessionId,
      courseUnitCode: session.courseUnitCode,
      studentId: args.studentDocId,
      confidence: args.confidence,
      status,
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

// Get attendance records for a student in a specific course unit
export const getStudentCourseAttendance = query({
  args: {
    studentId: v.id("students"),
    courseUnitCode: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all sessions for this course unit
    const sessions = await ctx.db
      .query("attendance_sessions")
      .withIndex("by_courseUnitCode", (q) => q.eq("courseUnitCode", args.courseUnitCode))
      .collect();

    // Get attendance records for this student
    const attendanceRecords = await ctx.db
      .query("attendance_records")
      .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
      .collect();

    // Filter to only records for this course unit
    const courseAttendance = attendanceRecords.filter(
      (record) => record.courseUnitCode === args.courseUnitCode
    );

    // Enrich with session details
    const enrichedRecords = await Promise.all(
      courseAttendance.map(async (record) => {
        const session = await ctx.db.get(record.sessionId);
        return {
          ...record,
          session,
        };
      })
    );

    // Calculate stats
    const totalSessions = sessions.filter((s) => s.status === "closed").length;
    const attendedSessions = courseAttendance.filter(
      (r) => r.status === "present" || r.status === "late"
    ).length;
    const presentCount = courseAttendance.filter((r) => r.status === "present").length;
    const lateCount = courseAttendance.filter((r) => r.status === "late").length;
    const absentCount = courseAttendance.filter((r) => r.status === "absent").length;
    const attendanceRate = totalSessions > 0 
      ? Math.round((attendedSessions / totalSessions) * 100) 
      : 0;

    return {
      records: enrichedRecords,
      stats: {
        totalSessions,
        attendedSessions,
        presentCount,
        lateCount,
        absentCount,
        missedSessions: totalSessions - attendedSessions,
        attendanceRate,
      },
    };
  },
});

// Get overall average attendance for all students per course unit
export const getCourseUnitAttendanceStats = query({
  args: {
    courseUnitCode: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all closed sessions for this course unit
    const sessions = await ctx.db
      .query("attendance_sessions")
      .withIndex("by_courseUnitCode", (q) => q.eq("courseUnitCode", args.courseUnitCode))
      .collect();

    const closedSessions = sessions.filter((s) => s.status === "closed");
    const totalSessions = closedSessions.length;

    if (totalSessions === 0) {
      return {
        courseUnitCode: args.courseUnitCode,
        totalSessions: 0,
        totalStudents: 0,
        averageAttendanceRate: 0,
        presentCount: 0,
        lateCount: 0,
        absentCount: 0,
        sessionStats: [],
      };
    }

    // Get all students enrolled in this course
    const allStudents = await ctx.db.query("students").collect();
    const enrolledStudents = allStudents.filter((s) =>
      s.courseUnits.includes(args.courseUnitCode)
    );
    const totalStudents = enrolledStudents.length;

    // Get all attendance records for this course unit
    const attendanceRecords = await ctx.db
      .query("attendance_records")
      .withIndex("by_courseUnitCode", (q) => q.eq("courseUnitCode", args.courseUnitCode))
      .collect();

    // Calculate overall counts
    const presentCount = attendanceRecords.filter((r) => r.status === "present").length;
    const lateCount = attendanceRecords.filter((r) => r.status === "late").length;
    const absentCount = attendanceRecords.filter((r) => r.status === "absent").length;

    // Calculate expected total attendance (students * sessions)
    const expectedTotalAttendance = totalStudents * totalSessions;
    
    // Calculate actual attendance (present + late counts as attended)
    const actualAttendance = presentCount + lateCount;

    // Calculate average attendance rate
    const averageAttendanceRate = expectedTotalAttendance > 0
      ? Math.round((actualAttendance / expectedTotalAttendance) * 100)
      : 0;

    // Get per-session stats
    const sessionStats = await Promise.all(
      closedSessions.map(async (session) => {
        const sessionRecords = attendanceRecords.filter(
          (r) => r.sessionId === session._id
        );
        const sessionPresent = sessionRecords.filter((r) => r.status === "present").length;
        const sessionLate = sessionRecords.filter((r) => r.status === "late").length;
        const sessionAbsent = sessionRecords.filter((r) => r.status === "absent").length;
        const sessionAttended = sessionPresent + sessionLate;
        const sessionRate = totalStudents > 0
          ? Math.round((sessionAttended / totalStudents) * 100)
          : 0;

        return {
          sessionId: session._id,
          sessionTitle: session.sessionTitle,
          date: session.startsAt,
          presentCount: sessionPresent,
          lateCount: sessionLate,
          absentCount: sessionAbsent,
          attendanceRate: sessionRate,
        };
      })
    );

    return {
      courseUnitCode: args.courseUnitCode,
      totalSessions,
      totalStudents,
      averageAttendanceRate,
      presentCount,
      lateCount,
      absentCount,
      sessionStats,
    };
  },
});

// Get attendance stats for all course units (for a lecturer)
export const getAllCourseUnitsAttendanceStats = query({
  args: {
    lecturerId: v.id("lecturers"),
  },
  handler: async (ctx, args) => {
    // Get all course units for this lecturer
    const courseUnits = await ctx.db
      .query("course_units")
      .withIndex("by_lecturer", (q) => q.eq("lecturerId", args.lecturerId))
      .collect();

    // Get stats for each course unit
    const stats = await Promise.all(
      courseUnits.map(async (courseUnit) => {
        // Get all closed sessions for this course unit
        const sessions = await ctx.db
          .query("attendance_sessions")
          .withIndex("by_courseUnitCode", (q) => q.eq("courseUnitCode", courseUnit.code))
          .collect();

        const closedSessions = sessions.filter((s) => s.status === "closed");
        const totalSessions = closedSessions.length;

        // Get all students enrolled in this course
        const allStudents = await ctx.db.query("students").collect();
        const enrolledStudents = allStudents.filter((s) =>
          s.courseUnits.includes(courseUnit.code)
        );
        const totalStudents = enrolledStudents.length;

        // Get all attendance records for this course unit
        const attendanceRecords = await ctx.db
          .query("attendance_records")
          .withIndex("by_courseUnitCode", (q) => q.eq("courseUnitCode", courseUnit.code))
          .collect();

        const presentCount = attendanceRecords.filter((r) => r.status === "present").length;
        const lateCount = attendanceRecords.filter((r) => r.status === "late").length;

        const expectedTotalAttendance = totalStudents * totalSessions;
        const actualAttendance = presentCount + lateCount;
        const averageAttendanceRate = expectedTotalAttendance > 0
          ? Math.round((actualAttendance / expectedTotalAttendance) * 100)
          : 0;

        return {
          courseUnitCode: courseUnit.code,
          courseUnitName: courseUnit.name,
          totalSessions,
          totalStudents,
          averageAttendanceRate,
        };
      })
    );

    return stats;
  },
});
