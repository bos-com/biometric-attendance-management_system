"use client"

import { useState, useMemo } from "react"
import type { ClassSession, } from "../dashboard/DashboardPage"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/adminComponents/ui/sheet"
import { Button } from "@/adminComponents/ui/button"
import { Badge } from "@/adminComponents/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/adminComponents/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/adminComponents/ui/tabs"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Play,
  Square,
  Search,
  Check,
  X,
  AlertCircle,
  UserCheck,
  UserX,
  UserMinus,
} from "lucide-react"
import { AttendanceSession } from "@/lib/types"
import { Dateformat } from "@/lib/utils"
import { Id } from "@/convex/_generated/dataModel"
import useGetAttendancePerSession from "@/hooks/useGetAttendancePerSession"
import { Student } from "@/lib/types";
import {CourseUnitName} from "@/app/admin/sessions/session-management";

interface SessionDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: AttendanceSession
  students: Student[]
  onStartSession: (sessionId: Id<"attendance_sessions">) => void
  onEndSession: (sessionId: Id<"attendance_sessions">) => void
  onMarkAttendance: (sessionId: Id<"attendance_sessions">, studentId: Id<"students">, status: "present" | "absent" | "late") => void
}

export function SessionDetailDrawer({
  open,
  onOpenChange,
  session,
  students,
  onStartSession,
  onEndSession,
  onMarkAttendance,
}: SessionDetailDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const { attendance, loading: attendanceLoading, error: attendanceError } = useGetAttendancePerSession(session._id)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  // Get attendance status for a student
  const getAttendanceStatus = (studentId?: Id<"students">) => {
    if (!studentId) return undefined
    return sessionAttendance.find((r) => r?.studentId === studentId)?.status
  }
  const sessionAttendance = attendanceLoading || attendanceError || !attendance ? [] : attendance

  // Get students enrolled in this course
  const courseStudents = useMemo(() => {
    return students.filter((student) => 
      student.courseUnits.includes(session.courseUnitCode)
    );
  }, [students, session.courseUnitCode]);

  // Filter students based on search and tab
  const filteredStudents = useMemo(() => {
    return courseStudents.filter((student) => {
      const matchesSearch =
        student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase())

      const status = getAttendanceStatus(student._id)

      if (activeTab === "all") return matchesSearch
      if (activeTab === "present") return matchesSearch && status === "present"
      if (activeTab === "late") return matchesSearch && status === "late"
      if (activeTab === "absent") return matchesSearch && status === "absent"
      if (activeTab === "unmarked") return matchesSearch && !status

      return matchesSearch
    })
  }, [courseStudents, searchQuery, activeTab, sessionAttendance])

  // Stats
  const stats = useMemo(() => {
    const present = sessionAttendance.filter((r) => r?.status === "present").length
    const late = sessionAttendance.filter((r) => r?.status === "late").length
    const absent = sessionAttendance.filter((r) => r?.status === "absent").length
    const unmarked = courseStudents.length - sessionAttendance.length

    return { present, late, absent, unmarked, total: courseStudents.length }
  }, [sessionAttendance, courseStudents.length])

  const getStatusBadge = (status: AttendanceSession["status"]) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>
      case "live":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Ongoing</Badge>
      case "closed":
        return <Badge variant="outline">Completed</Badge>
    }
  }

  const getAttendanceBadge = (status?: "present" | "absent" | "late") => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
            <Check className="mr-1 h-3 w-3" />
            Present
          </Badge>
        )
      case "late":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
            <AlertCircle className="mr-1 h-3 w-3" />
            Late
          </Badge>
        )
      case "absent":
        return (
          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">
            <X className="mr-1 h-3 w-3" />
            Absent
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <UserMinus className="mr-1 h-3 w-3" />
            Unmarked
          </Badge>
        )
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div>
                <CourseUnitName courseCode={session.courseUnitCode} />
              <SheetTitle className="text-xl">[{session.sessionTitle}]</SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{session.courseUnitCode}</Badge>
                {getStatusBadge(session.status)}
              </SheetDescription>
            </div>
          </div>

          {/* Session Info */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground pt-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {Dateformat(session._creationTime||0)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {Dateformat(session.startsAt||0)} - {Dateformat(session.endsAt||0)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {session.location}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {session.status === "scheduled" && (
              <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600" onClick={() => onStartSession(session._id)}>
                <Play className="mr-2 h-4 w-4" />
                Start Session
              </Button>
            )}
            {session.status === "live" && (
              <Button variant="destructive" className="flex-1" onClick={() => onEndSession(session._id)}>
                <Square className="mr-2 h-4 w-4" />
                End Session
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Attendance Stats */}
        <div className="grid grid-cols-4 gap-2 p-4 border-b bg-muted/30">
          <div className="text-center p-2 rounded-lg bg-emerald-500/10">
            <UserCheck className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
            <p className="text-lg font-semibold text-emerald-600">{stats.present}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-600 mx-auto mb-1" />
            <p className="text-lg font-semibold text-amber-600">{stats.late}</p>
            <p className="text-xs text-muted-foreground">Late</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-500/10">
            <UserX className="h-4 w-4 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-semibold text-red-600">{stats.absent}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-gray-500/10">
            <UserMinus className="h-4 w-4 text-gray-500 mx-auto mb-1" />
            <p className="text-lg font-semibold text-gray-500">{stats.unmarked}</p>
            <p className="text-xs text-muted-foreground">Unmarked</p>
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 space-y-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-5">
                <TabsTrigger value="all" className="text-xs">
                  All
                </TabsTrigger>
                <TabsTrigger value="present" className="text-xs">
                  Present
                </TabsTrigger>
                <TabsTrigger value="late" className="text-xs">
                  Late
                </TabsTrigger>
                <TabsTrigger value="absent" className="text-xs">
                  Absent
                </TabsTrigger>
                <TabsTrigger value="unmarked" className="text-xs">
                  Unmarked
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {filteredStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No students found</p>
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const status = getAttendanceStatus(student._id)
                  const isOngoing = session.status === "live"

                  return (
                    <div
                      key={student._id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.photoDataUrl?.[0] || "/placeholder.svg"} />
                          <AvatarFallback>
                            {student.firstName[0]}{student.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-muted-foreground">{student.studentId}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isOngoing ? (
                          getAttendanceBadge(status)
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={status === "present" ? "default" : "outline"}
                              className={
                                status === "present" ? "bg-emerald-500 hover:bg-emerald-600 h-8 w-8 p-0" : "h-8 w-8 p-0"
                              }
                              onClick={() => onMarkAttendance(session._id, student._id, "present")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={status === "late" ? "default" : "outline"}
                              className={
                                status === "late" ? "bg-amber-500 hover:bg-amber-600 h-8 w-8 p-0" : "h-8 w-8 p-0"
                              }
                              onClick={() => onMarkAttendance(session._id, student._id, "late")}
                            >
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={status === "absent" ? "default" : "outline"}
                              className={
                                status === "absent" ? "bg-red-500 hover:bg-red-600 h-8 w-8 p-0" : "h-8 w-8 p-0"
                              }
                              onClick={() => onMarkAttendance(session._id, student._id, "absent")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
