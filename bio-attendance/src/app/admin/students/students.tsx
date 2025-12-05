"use client"

import { useEffect, useState } from "react"
import { CourseStudentsView } from "./components/course-students-view"
import useGetStudentsPerLecturer from "@/hooks/useGetStudentsPerLecturer"
import { useLecturerSession } from "@/hooks/useLecturerSession"
import { Id } from "@/convex/_generated/dataModel"
import { Student } from "@/lib/types";
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

// Demo data
const demoCourseUnits: CourseUnit[] = [
  {
    id: "cu1",
    code: "CS101",
    name: "Introduction to Programming",
    semester: "Semester 1",
    creditUnits: 4,
    enrolledStudents: ["1", "2", "3", "4", "5", "6"],
  },
  {
    id: "cu2",
    code: "CS201",
    name: "Data Structures & Algorithms",
    semester: "Semester 1",
    creditUnits: 4,
    enrolledStudents: ["1", "2", "7", "8", "9", "10"],
  },
  {
    id: "cu3",
    code: "CS301",
    name: "Database Systems",
    semester: "Semester 2",
    creditUnits: 3,
    enrolledStudents: ["3", "4", "5", "11", "12"],
  },
  {
    id: "cu4",
    code: "CS401",
    name: "Software Engineering",
    semester: "Semester 2",
    creditUnits: 4,
    enrolledStudents: ["1", "6", "7", "8", "11", "12"],
  },
]

const demoStudents: StudentDetail[] = [
  {
    id: "1",
    name: "John Doe",
    registrationNumber: "21/U/001",
    email: "john.doe@university.edu",
    phone: "+256 700 123 456",
    program: "BSc Computer Science",
    yearOfStudy: 2,
    enrolledCourses: ["cu1", "cu2", "cu4"],
  },
  {
    id: "2",
    name: "Jane Smith",
    registrationNumber: "21/U/002",
    email: "jane.smith@university.edu",
    phone: "+256 700 234 567",
    program: "BSc Computer Science",
    yearOfStudy: 2,
    enrolledCourses: ["cu1", "cu2"],
  },
  {
    id: "3",
    name: "Michael Johnson",
    registrationNumber: "21/U/003",
    email: "michael.j@university.edu",
    phone: "+256 700 345 678",
    program: "BSc Information Technology",
    yearOfStudy: 3,
    enrolledCourses: ["cu1", "cu3"],
  },
  {
    id: "4",
    name: "Emily Davis",
    registrationNumber: "21/U/004",
    email: "emily.davis@university.edu",
    phone: "+256 700 456 789",
    program: "BSc Computer Science",
    yearOfStudy: 2,
    enrolledCourses: ["cu1", "cu3"],
  },
  {
    id: "5",
    name: "Robert Wilson",
    registrationNumber: "21/U/005",
    email: "robert.w@university.edu",
    phone: "+256 700 567 890",
    program: "BSc Software Engineering",
    yearOfStudy: 2,
    enrolledCourses: ["cu1", "cu3"],
  },
  {
    id: "6",
    name: "Sarah Brown",
    registrationNumber: "21/U/006",
    email: "sarah.b@university.edu",
    phone: "+256 700 678 901",
    program: "BSc Computer Science",
    yearOfStudy: 3,
    enrolledCourses: ["cu1", "cu4"],
  },
  {
    id: "7",
    name: "David Lee",
    registrationNumber: "21/U/007",
    email: "david.lee@university.edu",
    phone: "+256 700 789 012",
    program: "BSc Information Systems",
    yearOfStudy: 2,
    enrolledCourses: ["cu2", "cu4"],
  },
  {
    id: "8",
    name: "Lisa Anderson",
    registrationNumber: "21/U/008",
    email: "lisa.a@university.edu",
    phone: "+256 700 890 123",
    program: "BSc Computer Science",
    yearOfStudy: 2,
    enrolledCourses: ["cu2", "cu4"],
  },
  {
    id: "9",
    name: "James Taylor",
    registrationNumber: "21/U/009",
    email: "james.t@university.edu",
    phone: "+256 700 901 234",
    program: "BSc Software Engineering",
    yearOfStudy: 3,
    enrolledCourses: ["cu2"],
  },
  {
    id: "10",
    name: "Amanda Martinez",
    registrationNumber: "21/U/010",
    email: "amanda.m@university.edu",
    phone: "+256 700 012 345",
    program: "BSc Computer Science",
    yearOfStudy: 2,
    enrolledCourses: ["cu2"],
  },
  {
    id: "11",
    name: "Christopher White",
    registrationNumber: "21/U/011",
    email: "chris.w@university.edu",
    phone: "+256 700 111 222",
    program: "BSc Information Technology",
    yearOfStudy: 3,
    enrolledCourses: ["cu3", "cu4"],
  },
  {
    id: "12",
    name: "Jessica Thomas",
    registrationNumber: "21/U/012",
    email: "jessica.t@university.edu",
    phone: "+256 700 222 333",
    program: "BSc Computer Science",
    yearOfStudy: 3,
    enrolledCourses: ["cu3", "cu4"],
  },
]

// Generate attendance history for students
const generateAttendanceHistory = (studentId: string): AttendanceEntry[] => {
  const statuses: ("present" | "absent" | "late")[] = ["present", "present", "present", "late", "absent"]
  const courses = ["CS101", "CS201", "CS301", "CS401"]
  const entries: AttendanceEntry[] = []

  // Generate 12 weeks of attendance data
  for (let week = 0; week < 12; week++) {
    const sessionDate = new Date()
    sessionDate.setDate(sessionDate.getDate() - (12 - week) * 7)

    courses.forEach((courseCode, idx) => {
      // Randomly assign attendance based on student ID for consistency
      const randomSeed = Number.parseInt(studentId) + week + idx
      const status = statuses[randomSeed % statuses.length]
      entries.push({
        sessionId: `session-${week}-${idx}`,
        sessionDate,
        courseCode,
        status,
      })
    })
  }

  return entries
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
    return <div>Loading course...</div>
  }

  const getAttendanceForStudent = (studentId: string): AttendanceEntry[] => {
    return generateAttendanceHistory(studentId)
  }

  return (
    <div className="w-full h-full" >
        <CourseStudentsView
      courseUnits={lecturerCourseUnits}
      selectedCourse={selectedCourse}
      students={lecturerStudents}
      onCourseChange={setSelectedCourseCode}
      getAttendanceForStudent={getAttendanceForStudent}
    />
    </div>
  )
}
