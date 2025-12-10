import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";
import bcrypt from "bcryptjs";
import {
  MutationCtx,
  internalMutation,
  internalQuery,
  mutation,
  action,
  query,
} from "./_generated/server";

type Response = {
  success: boolean;
  message: string;
  status: number;
  user:{
        _id: string,
         fullName: string,
            email: string,
            passwordHash: string,
            staffId?: string,
            _creationTime: number,
            role?:string
  }|null
  token?: string | null;
};
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

const generateToken = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
        const lecturer =  await ctx.db
      .query("lecturers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    return {success:true, user: lecturer, message: "Lecturer fetched successfully" , status: 200}
  },
});

export const createLecturer = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    password: v.string(),
    staffId: v.string(),
    courseUnitIds: v.optional(v.array(v.id("course_units"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("lecturers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      throw new ConvexError("Email already registered");
    }

    // Check for course units that are already assigned to another lecturer
    const conflictMessages: string[] = [];
    if (args.courseUnitIds && args.courseUnitIds.length > 0) {
      for (const unitId of args.courseUnitIds) {
        const unit = await ctx.db.get(unitId);
        if (unit && unit.lecturerId) {
          const existingLecturer = await ctx.db.get(unit.lecturerId);
          conflictMessages.push(
            `"${unit.name}" is already assigned to ${existingLecturer?.fullName || "another lecturer"}`
          );
        }
      }
    }

    // Create the lecturer
    const lecturerId = await ctx.db.insert("lecturers", {
      fullName: args.fullName,
      email: args.email,
      passwordHash: args.password,
      staffId: args.staffId,
      role: "admin"
    });

    // Assign selected course units to this lecturer
    if (args.courseUnitIds && args.courseUnitIds.length > 0) {
      for (const unitId of args.courseUnitIds) {
        await ctx.db.patch(unitId, { lecturerId });
      }
    }

    return { 
      success: true, 
      message: "Lecturer created successfully",
      conflicts: conflictMessages,
      hasConflicts: conflictMessages.length > 0
    }; 
  },
});

export const AuthenticateUser = action({
                args:{email:v.string(), password:v.string()},
                handler:async(ctx,args): Promise<Response>=>{
                        const user = await ctx.runQuery(api.lecturers.getByEmail, {
                                email: args.email,
                        });
                        if (!user.success || !user.user) {
                               return { success:false ,status: 404,message: "User not Found",user:user.user };
                        }
                  
                        
                        const isMatch = await bcrypt.compare(args.password, user.user?.passwordHash ?? "");
                        if (!isMatch) {
                          return { success:false ,status: 401,message: "Invalid Credentials",user:null};
                }
                   const session = await ctx.runMutation(api.lecturers.createSession, { lecturerId: user.user._id });
                   console.log("Generated session token:", session.token);
                     return { success:true ,status: 201,message: "Success",user:user.user, token: session?.token ?? null };
}
})

export const GetLecturerById = query({
        args:{
                id:v.id("lecturers"),
        },
        handler:async(ctx,args)=>{
                const lecturer = await ctx.db.get(args.id);
                if(!lecturer){
                        throw new ConvexError("Lecturer not found");
                }
                return lecturer;
        }
})

export const createSession = mutation({
  args: { lecturerId: v.id("lecturers") },
  handler: async (ctx, args) => {
    const token = generateToken();
    const expiresAt = Date.now() + SESSION_TTL_MS;
    const existingSessions = await ctx.db
      .query("lecturerSessions")
      .withIndex("by_lecturer", (q) => q.eq("lecturerId", args.lecturerId))
      .collect();
        for (const session of existingSessions) {
        await ctx.db.delete(session._id);
        }
    await ctx.db.insert("lecturerSessions", {
      lecturerId: args.lecturerId,
      token,
      expiresAt,
      createdAt: Date.now(),
    });
    return { token, expiresAt };
  },
});

export const profile = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("lecturerSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const lecturer = await ctx.db.get(session.lecturerId);
    if (!lecturer) {
      return null;
    }

    return {
      _id: lecturer._id,
      fullName: lecturer.fullName,
      email: lecturer.email,
      staffId: lecturer.staffId,
    };
  },
});

export const signOut = mutation({
  args: { lecturerId: v.id("lecturers"), },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("lecturerSessions")
      .withIndex("by_lecturer", (q) => q.eq("lecturerId", args.lecturerId))
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const updateProfile = mutation({
  args: {
    lecturerId: v.id("lecturers"),
    fullName: v.optional(v.string()),
    email: v.optional(v.string()),
    staffId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const lecturer = await ctx.db.get(args.lecturerId);
    if (!lecturer) {
      throw new ConvexError("Lecturer not found");
    }

    // Check if email is being changed and if it's already taken
    if (args.email && args.email !== lecturer.email) {
      const existing = await ctx.db
        .query("lecturers")
        .withIndex("by_email", (q) => q.eq("email", args.email!))
        .unique();
      if (existing) {
        throw new ConvexError("Email already in use");
      }
    }

    const updates: Partial<{
      fullName: string;
      email: string;
      staffId: string;
    }> = {};

    if (args.fullName) updates.fullName = args.fullName;
    if (args.email) updates.email = args.email;
    if (args.staffId) updates.staffId = args.staffId;

    await ctx.db.patch(args.lecturerId, updates);

    return { success: true, message: "Profile updated successfully" };
  },
});

export const changePassword = mutation({
  args: {
    lecturerId: v.id("lecturers"),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const lecturer = await ctx.db.get(args.lecturerId);
    if (!lecturer) {
      throw new ConvexError("Lecturer not found");
    }

    await ctx.db.patch(args.lecturerId, {
      passwordHash: args.newPassword,
    });

    return { success: true, message: "Password changed successfully" };
  },
});

// Password Reset Token Generation
const RESET_TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutes

export const createPasswordResetToken = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const lecturer = await ctx.db
      .query("lecturers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
console.log("Creating password reset token for email:", lecturer?.fullName);
    if (!lecturer) {
      // Don't reveal if email exists - return success anyway for security
      return { success: true, message: "If the email exists, a reset link has been sent" };
    }

    // Invalidate any existing tokens for this user
    const existingTokens = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_lecturer", (q) => q.eq("lecturerId", lecturer._id))
      .collect();

    for (const token of existingTokens) {
      await ctx.db.patch(token._id, { used: true });
    }

    // Generate a secure token
    const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 15)}-${Math.random().toString(36).slice(2, 15)}`;

    await ctx.db.insert("passwordResetTokens", {
      lecturerId: lecturer._id,
      token,
      expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
      createdAt: Date.now(),
      used: false,
    });

    return { 
      success: true, 
      message: "Password reset token created",
      token, // This will be used by the action to send the email
      lecturerEmail: lecturer.email,
      lecturerName: lecturer.fullName,
    };
  },
});

export const validateResetToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!resetToken) {
      return { valid: false, message: "Invalid reset token" };
    }

    if (resetToken.used) {
      return { valid: false, message: "This reset link has already been used" };
    }

    if (resetToken.expiresAt < Date.now()) {
      return { valid: false, message: "This reset link has expired" };
    }

    return { valid: true, lecturerId: resetToken.lecturerId };
  },
});

// Internal query to validate token (used by action to avoid circular reference)
export const validateResetTokenInternal = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!resetToken) {
      return { valid: false as const, message: "Invalid reset token", tokenId: null, lecturerId: null };
    }

    if (resetToken.used) {
      return { valid: false as const, message: "This reset link has already been used", tokenId: null, lecturerId: null };
    }

    if (resetToken.expiresAt < Date.now()) {
      return { valid: false as const, message: "This reset link has expired", tokenId: null, lecturerId: null };
    }

    return { valid: true as const, lecturerId: resetToken.lecturerId, tokenId: resetToken._id, message: null };
  },
});

// Internal mutation to update password (called by the action)
export const updatePasswordInternal = internalMutation({
  args: {
    lecturerId: v.id("lecturers"),
    passwordHash: v.string(),
    tokenId: v.id("passwordResetTokens"),
  },
  handler: async (ctx, args) => {
    // Update the password
    await ctx.db.patch(args.lecturerId, {
      passwordHash: args.passwordHash,
    });

    // Mark token as used
    await ctx.db.patch(args.tokenId, { used: true });

    return { success: true };
  },
});

export const resetPasswordWithToken = action({
  args: { 
    token: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    // Validate the token using internal query
    const tokenValidation = await ctx.runQuery(internal.lecturers.validateResetTokenInternal, {
      token: args.token,
    });

    if (!tokenValidation.valid) {
      return { success: false, message: tokenValidation.message || "Invalid reset token" };
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(args.newPassword, 10);

    // Update the password using internal mutation
    await ctx.runMutation(internal.lecturers.updatePasswordInternal, {
      lecturerId: tokenValidation.lecturerId!,
      passwordHash,
      tokenId: tokenValidation.tokenId!,
    });

    return { success: true, message: "Password has been reset successfully" };
  },
});
