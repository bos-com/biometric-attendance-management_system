'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import VideoCapture from '@/components/VideoCapture/VideoCapture';
// import { useLecturerAuth } from '@/contexts/LecturerAuthContext';

const AttendancePage = () => {
  const router = useRouter();
  const lecturer = localStorage.getItem("lecturerToken");
  const signOut = () => {
    localStorage.removeItem("lecturerToken");
    router.replace('/auth/signin');
  };
  const classes = useQuery(
    api.classes.listForLecturer,
    lecturer ? { lecturerId: lecturer as Id<"lecturers"> } : 'skip',
  );
  const ensureLiveSession = useMutation(api.sessions.ensureLiveSession);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [sessionId, setSessionId] = useState<Id<'sessions'> | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

 

  const classOptions = useMemo<Doc<'classes'>[]>(() => classes ?? [], [classes]);

  const beginCapture = async () => {
    if (!selectedClassId) {
      setStatusMessage('Select a class before starting attendance');
      return;
    }
    try {
      setStarting(true);
      setStatusMessage(null);
      const liveSessionId = await ensureLiveSession({
        classId: selectedClassId as Id<'classes'>,
        durationMinutes: 90,
      });
      setSessionId(liveSessionId);
      setStatusMessage('Live session is active. Start capturing faces.');
    } catch (err) {
      console.error(err);
      setStatusMessage(err instanceof Error ? err.message : 'Unable to start session');
    } finally {
      setStarting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2 border-b border-gray-100 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Attendance capture</h1>
          <p className="text-gray-600">Authenticate, select your lecture, and start recording attendance.</p>
        </div>
        {lecturer ? (
          <div className="text-sm text-gray-500">
            Signed in as <span className="font-medium text-gray-900">{lecturer.fullName}</span>
            <button className="ml-4 rounded-md border border-gray-200 px-3 py-1 text-xs" onClick={signOut}>
              Sign out
            </button>
          </div>
        ) : null}
      </header>

      <section className="grid gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <label className="text-sm font-medium text-gray-700">
          Choose course / lecture
          <select
            value={selectedClassId}
            onChange={(event) => setSelectedClassId(event.target.value)}
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
            disabled={!classOptions.length}
          >
            <option value="">Select a class</option>
            {classOptions.map((klass) => (
              <option value={klass._id} key={klass._id}>
                {klass.code} — {klass.title}
              </option>
            ))}
          </select>
        </label>
        {classOptions.length === 0 ? (
          <p className="text-sm text-gray-500">
            You do not have any classes assigned. Ask an admin to assign you or create a class first.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={beginCapture}
            disabled={starting || !selectedClassId}
            className="rounded-md bg-black px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {starting ? 'Starting...' : 'Start capture'}
          </button>
        </div>
        {statusMessage ? <p className="text-sm text-blue-600">{statusMessage}</p> : null}
      </section>

      {sessionId ? (
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Live capture</h2>
          <p className="text-sm text-gray-500">Session ID: {sessionId}</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
            <VideoCapture />
          </div>
        </section>
      ) : null}
    </main>
  );
};

export default AttendancePage;
