import { Id } from '@/convex/_generated/dataModel';
import { JWTPayload } from 'jose';
export interface SessionPayload extends JWTPayload {
  userId: string;
  role: string; 
  expiresAt:Date
}

export type AttendanceSession = {
  _id: Id<"attendance_sessions">;
  _creationTime: number;
  sessionId: string;
  courseUnitCode: string;
  lecturerId: Id<"lecturers">;
  sessionTitle: string;
  description: string;
  startsAt: number;
  endsAt: number;
  location: string;
  status: "scheduled" | "live" | "closed";
  autoStart?: boolean;
  autoClose?: boolean;
};