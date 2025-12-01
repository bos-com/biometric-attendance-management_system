'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';

const StudentRegistrationPage = () => {
  const classes = useQuery(api.classes.list, {});
  const registerStudent = useMutation(api.students.registerWithFace);
  const generateUploadUrl = useAction(api.uploads.generateUploadUrl);

  const [studentId, setStudentId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [program, setProgram] = useState('');
  const [gender, setGender] = useState('');
  const [courseUnitInput, setCourseUnitInput] = useState('');
  const [courseUnits, setCourseUnits] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<Id<'classes'>[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoStorageId, setPhotoStorageId] = useState<Id<'_storage'> | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitState, setSubmitState] = useState<{ status: 'idle' | 'success' | 'error'; message?: string }>({
    status: 'idle',
  });

  const classOptions = useMemo<Doc<'classes'>[]>(() => classes ?? [], [classes]);

  const handleAddCourseUnit = () => {
    const trimmed = courseUnitInput.trim();
    if (!trimmed || courseUnits.includes(trimmed)) return;
    setCourseUnits((prev) => [...prev, trimmed]);
    setCourseUnitInput('');
  };

  const removeCourseUnit = (unit: string) => {
    setCourseUnits((prev) => prev.filter((item) => item !== unit));
  };

  const toggleClassSelection = (classId: Id<'classes'>) => {
    setSelectedClasses((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId],
    );
  };

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    try {
      setUploadingPhoto(true);
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const { storageId } = await response.json();
      setPhotoStorageId(storageId as Id<'_storage'>);
    } catch (err) {
      console.error(err);
      setSubmitState({ status: 'error', message: 'Photo upload failed' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSubmitState({ status: 'idle' });
      await registerStudent({
        studentId: studentId.trim(),
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        program: program.trim() || undefined,
        gender: gender || undefined,
        courseUnits,
        classIds: selectedClasses,
        descriptor: undefined,
        descriptorVersion: undefined,
        photoDataUrl: undefined,
        photoStorageId: photoStorageId ?? undefined,
      });
      setSubmitState({ status: 'success', message: 'Student profile saved' });
      setStudentId('');
      setFirstName('');
      setMiddleName('');
      setLastName('');
      setEmail('');
      setProgram('');
      setGender('');
      setCourseUnits([]);
      setSelectedClasses([]);
      setPhotoPreview(null);
      setPhotoStorageId(null);
    } catch (err) {
      console.error(err);
      setSubmitState({ status: 'error', message: err instanceof Error ? err.message : 'Unable to save student' });
    }
  };

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <header>
        <h1 className="text-3xl font-semibold">Student Bio Capture</h1>
        <p className="mt-2 text-gray-600">Collect biodata, course units, and gallery photos for each student.</p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">
            Student ID
            <input
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Program
            <input
              value={program}
              onChange={(event) => setProgram(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g. BSc Computer Science"
            />
          </label>
          <label className="text-sm font-medium">
            First name
            <input
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Middle name
            <input
              value={middleName}
              onChange={(event) => setMiddleName(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Last name
            <input
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Gender
            <select
              value={gender}
              onChange={(event) => setGender(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </label>
        </section>

        <section>
          <div className="flex items-end gap-4">
            <label className="flex-1 text-sm font-medium">
              Course unit
              <input
                value={courseUnitInput}
                onChange={(event) => setCourseUnitInput(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="e.g. CSC2104"
              />
            </label>
            <button
              type="button"
              onClick={handleAddCourseUnit}
              className="h-10 rounded-md border border-gray-300 px-4 text-sm font-semibold"
            >
              Add unit
            </button>
          </div>
          {courseUnits.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {courseUnits.map((unit) => (
                <li key={unit} className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
                  {unit}
                  <button type="button" onClick={() => removeCourseUnit(unit)} className="text-gray-500">
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section>
          <p className="text-sm font-semibold">Assign to course units / classes</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {classOptions.map((klass) => (
              <label key={klass._id} className="flex items-start gap-2 rounded-lg border border-gray-200 p-3">
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(klass._id)}
                  onChange={() => toggleClassSelection(klass._id)}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium">{klass.code}</span>
                  <span className="block text-sm text-gray-500">{klass.title}</span>
                </span>
              </label>
            ))}
            {classOptions.length === 0 ? (
              <p className="text-sm text-gray-500">No classes have been created yet.</p>
            ) : null}
          </div>
        </section>

        <section className="space-y-3">
          <label className="text-sm font-medium">
            Student photo
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="mt-1 w-full rounded-md border border-dashed border-gray-300 px-3 py-2"
            />
          </label>
          {uploadingPhoto ? <p className="text-sm text-gray-500">Uploading photo…</p> : null}
          {photoPreview ? (
            <Image
              src={photoPreview}
              alt="Student preview"
              width={160}
              height={160}
              unoptimized
              className="h-40 w-40 rounded-lg object-cover"
            />
          ) : null}
        </section>

        {submitState.status === 'error' ? (
          <p className="text-sm text-red-600">{submitState.message}</p>
        ) : null}
        {submitState.status === 'success' ? (
          <p className="text-sm text-green-600">{submitState.message}</p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-black px-6 py-3 font-semibold text-white"
            disabled={uploadingPhoto}
          >
            Save student profile
          </button>
        </div>
      </form>
    </main>
  );
};

export default StudentRegistrationPage;
