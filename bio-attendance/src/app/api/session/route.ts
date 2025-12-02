import { NextResponse } from "next/server";
import { decrypt } from "@/lib/sessions";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const rawSession = cookieStore.get("lecturerSession")?.value;

    if (!rawSession) {
      return NextResponse.json(
        { success: false, message: "No active session" },
        { status: 401 },
      );
    }

    const payload = await decrypt(rawSession);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { success: true, session: payload },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to read session", error);
    return NextResponse.json(
      { success: false, message: "Failed to read session" },
      { status: 500 },
    );
  }
}
