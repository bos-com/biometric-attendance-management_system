"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Users,
  BookOpen,
  GraduationCap,
  Search,
  ArrowLeft,
  ChevronDown,
  Calendar,
  Download,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/adminComponents/ui/dropdown-menu"
import { Badge } from "@/adminComponents/ui/badge"
import type { StudentDetail, AttendanceEntry } from "../students"
import { AttendanceRecord, CourseUnit } from "@/lib/types";
import { Student } from "@/lib/types";
import { StudentCard } from "./student-card"
import { StudentDetailModal } from "./student-detail-modal"
import { Id } from "@/convex/_generated/dataModel"

interface CourseStudentsViewProps {
  courseUnits: Partial<CourseUnit>[]
  selectedCourse: CourseUnit
  students: Student[]
  onCourseChange: (courseCode: string|null) => void
  getAttendanceForStudent?: (studentId: Id<"students">) => AttendanceRecord[]
}

export function CourseStudentsView({
  courseUnits,
  selectedCourse,
  students,
  onCourseChange,
  getAttendanceForStudent,
}: CourseStudentsViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [sortBy, setSortBy] = useState<"name" | "regNo" | "attendance">("name")
//   console.log("Selected Course in View:", selectedCourse);

  const filteredStudents = students
    .filter((s) => {
      // First, filter by selected course - student must be enrolled in this course
      const isEnrolledInCourse = s.courseUnits.includes(selectedCourse.code);
      if (!isEnrolledInCourse) return false;

      // Then, apply search filter if there's a search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          s.firstName.toLowerCase().includes(query) ||
          s.lastName.toLowerCase().includes(query) ||
          s.middleName?.toLowerCase().includes(query) ||
          s.studentId.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.firstName.localeCompare(b.firstName)

      if (sortBy === "regNo") return a.studentId.localeCompare(b.studentId)
      // Sort by attendance rate (we'd calculate this from actual data)
      return 0
    })



  return (
    <div className="min-h-full w-full bg-green-50/80 pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl font-semibold">Enrolled Students</h1>
                  <p className="text-sm text-muted-foreground">View and manage enrolled students</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/attendance">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Calendar className="h-4 w-4" />
                  Attendance Module
                </Button>
              </Link>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export List
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Course Selector and Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {/* Course Selector Card */}
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Select Course Unit</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-auto py-3 bg-transparent">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{selectedCourse.code}</p>
                        <p className="text-sm text-muted-foreground">{selectedCourse.name}</p>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80">
                  {courseUnits.map((course) => (
                    <DropdownMenuItem
                      key={course._id}
                      onClick={() => onCourseChange(course.code ?? null)}
                      className="flex items-center gap-3 py-3"
                    >
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{course.code}</p>
                        <p className="text-sm text-muted-foreground">{course.name}</p>
                      </div>
                      <Badge variant="secondary" className="ml-auto">
                        {/* {course.enrolledStudents.length} */}
                      </Badge>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-sm text-muted-foreground">Enrolled Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{selectedCourse.hours_per_session}</p>
                  <p className="text-sm text-muted-foreground">Credit Units</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or registration number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-green-100 border  border-green-400 "
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Sort by: {sortBy === "name" ? "Name" : sortBy === "regNo" ? "Reg. No" : "Attendance"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("name")}>Name</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("regNo")}>Registration Number</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("attendance")}>Attendance Rate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No students found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery ? "Try adjusting your search query" : "No students are enrolled in this course unit yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStudents.map((student) => (
              <StudentCard
                key={student._id}
                student={student}
                onClick={() => setSelectedStudent(student)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudent}
        courseCode={selectedCourse.code}
        open={!!selectedStudent}
        onOpenChange={(open) => !open && setSelectedStudent(null)}
      />
    </div>
  )
}
