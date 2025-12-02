import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import {api} from "@/convex/_generated/api";
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("lecturers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      throw new ConvexError("Email already registered");
    }
  
    await ctx.db.insert("lecturers", {
      fullName: args.fullName,
      email: args.email,
      passwordHash:args.password,
        staffId: args.staffId,
        role:"lecture"
    });
    return { success: true, message: "Lecturer created successfully"  }; 
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
