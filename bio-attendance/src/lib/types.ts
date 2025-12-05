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

export type Student = {
  _id: Id<"students">;
  _creationTime: number;
  studentId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: string;
  program: string;
  courseUnits: string[];
  email: string;
  photoDataUrl?: string[];
  photoStorageId?: Id<"_storage">[];
  photoEmbeddings?: number[];
  createdAt: number;
};

export type CourseUnit = {
  _id: Id<"course_units">;
  _creationTime: number;
  code: string;
  name: string;
  semester: string;
  programId: Id<"programs">;
  lecturerId: Id<"lecturers">;
  hours_per_session: number;
};