import { NextRequest, NextResponse } from 'next/server';
import { createSession } from "../../../lib/sessions"
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const { userId, role,fullName } = await req.json();
  console.log("Creating session for userId:", userId, "role:", role);
  try {
    await createSession(userId, role,fullName);
    revalidatePath('/');
    return NextResponse.json({ success: true, message: 'Session created' }, { status: 200 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}