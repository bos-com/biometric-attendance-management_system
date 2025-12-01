'use node';

import bcrypt from 'bcryptjs';
import { ConvexError, v } from 'convex/values';
import { action } from './_generated/server';
import { api } from './_generated/api';

export const signUp = action({
  args: {
    fullName: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();
    const existing = await ctx.runQuery(api.internal.lecturers.getByEmail, { email });
    if (existing) {
      throw new ConvexError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(args.password, 10);
    const lecturerId = await ctx.runMutation(api.internal.lecturers.createLecturer, {
      fullName: args.fullName,
      email,
      passwordHash,
    });

    const session = await ctx.runMutation(api.internal.lecturers.createSession, { lecturerId });
    return { token: session.token, lecturerId, expiresAt: session.expiresAt };
  },
});

export const signIn = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase();
    const lecturer = await ctx.runQuery(api.internal.lecturers.getByEmail, { email });
    if (!lecturer) {
      throw new ConvexError('Invalid credentials');
    }

    const matches = await bcrypt.compare(args.password, lecturer.passwordHash);
    if (!matches) {
      throw new ConvexError('Invalid credentials');
    }

    const session = await ctx.runMutation(api.internal.lecturers.createSession, { lecturerId: lecturer._id });
    return { token: session.token, lecturerId: lecturer._id, expiresAt: session.expiresAt };
  },
});
