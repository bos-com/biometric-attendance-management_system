import { NextResponse } from 'next/server';
import { deleteSession } from "../../../lib/sessions"
import { revalidatePath } from 'next/cache';

export async function POST() {

  try {
    await deleteSession();
    revalidatePath('/');
    return NextResponse.json({ success: true, message: 'Session deleted',redirect:'/' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}