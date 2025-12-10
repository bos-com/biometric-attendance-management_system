"use client"

import { useEffect, useState } from "react"
import { CourseStudentsView } from "./components/course-students-view"
import useGetStudentsPerLecturer from "@/hooks/useGetStudentsPerLecturer"
import { useLecturerSession } from "@/hooks/useLecturerSession"
import { Id } from "@/convex/_generated/dataModel"
import { AttendanceRecord, Student } from "@/lib/types";
import useGetCourseUnitByLecture from "@/hooks/useGetCourseUnitByLecture";
import Loader from "@/components/Loader/loader"
// Types
export interface CourseUnit {
  id: string
  code: string
  name: string
  semester: string
  creditUnits: number
  enrolledStudents: string[] // student IDs
}

export interface StudentDetail {
  id: string
  name: string
  registrationNumber: string
  email: string
  phone: string
  photo?: string
  program: string
  yearOfStudy: number
  enrolledCourses: string[] // course IDs
}

export interface AttendanceEntry {
  sessionId: string
  sessionDate: Date
  courseCode: string
  status: "present" | "absent" | "late"
}


export default function CourseStudentsPage() {
       
//   const [selectedCourseId, setSelectedCourseId] = useState<string>(demoCourseUnits[0].id)
  const { session } = useLecturerSession()
 const {courseUnits: lecturerCourseUnits, loading: coursesLoading, error: coursesError} = useGetCourseUnitByLecture(session?.userId as Id<"lecturers">)
  const { students: lecturerStudents, loading, error } = useGetStudentsPerLecturer(session?.userId as Id<"lecturers">)

    const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null)

  // Set default selection when courses load
  useEffect(() => {
    if (lecturerCourseUnits?.length && !selectedCourseCode) {
        console.log("Setting default selected course code:", lecturerCourseUnits[0].code);
      setSelectedCourseCode(lecturerCourseUnits[0].code)
    }

  }, [lecturerCourseUnits, selectedCourseCode])
//   console.log("Selected Course Code:", selectedCourseCode);

    if (loading || coursesLoading || lecturerStudents === undefined || lecturerCourseUnits === undefined) {
    return <Loader />
  }

  if (error) {
    return <div>Error loading students: {error}</div>
  }

  const selectedCourse = lecturerCourseUnits?.find((c) => c.code === selectedCourseCode)

  // Guard against no selected course
  if (!selectedCourse) {
    return <div>No Selected Course</div>
  }


  return (
    <div className="w-full min-h-full" >
        <CourseStudentsView
      courseUnits={lecturerCourseUnits}
      selectedCourse={selectedCourse}
      students={lecturerStudents}
      onCourseChange={setSelectedCourseCode}
//       getAttendanceForStudent={getAttendanceForStudent}
    />
    </div>
  )
}
