"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/adminComponents/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/adminComponents/ui/badge"
import { Avatar, AvatarFallback } from "@/adminComponents/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Clock, MapPin, Users, Play, Square, Check, X, AlertCircle } from "lucide-react"
import { AttendanceSession, Student } from "@/lib/types"
import { Dateformat } from "@/lib/utils"
import { Id } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

interface SessionDetailModalProps {
  session: AttendanceSession | null
  students: Student[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onMarkAttendance: (sessionId: Id<"attendance_sessions">, studentId: Id<"students">, status: "present" | "absent" | "late") => void
  onStartSession: (sessionId: Id<"attendance_sessions">) => void
  onEndSession: (sessionId: Id<"attendance_sessions">) => void
}

export function SessionDetailModal({
  session,
  students,
  open,
  onOpenChange,
  onMarkAttendance,
  onStartSession,
  onEndSession,
}: SessionDetailModalProps) {
  // Fetch attendance records for this session
  const attendanceRecords = useQuery(
    api.attendance.forSession,
    session ? { sessionId: session._id } : "skip"
  );

  if (!session) return null

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const getStudentAttendance = (studentId: Id<"students">) => {
    return attendanceRecords?.find((r) => r && r.studentId === studentId)?.status
  }

  const getStatusColor = (status?: "present" | "absent" | "late") => {
    switch (status) {
      case "present":
        return "bg-success/10 text-success border-success/20"
      case "absent":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "late":
        return "bg-warning/10 text-warning-foreground border-warning/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const records = attendanceRecords ?? []
  const presentCount = records.filter((r) => r?.status === "present").length
  const lateCount = records.filter((r) => r?.status === "late").length
  const absentCount = records.filter((r) => r?.status === "absent").length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{session.sessionTitle}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{session.courseUnitCode}</Badge>
                {session.status === "scheduled" && <Badge variant="secondary">Scheduled</Badge>}
                {session.status === "live" && <Badge className="bg-success text-success-foreground">Ongoing</Badge>}
                {session.status === "closed" && <Badge variant="outline">Completed</Badge>}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Session Info */}
        <div className="grid gap-3 sm:grid-cols-3 py-4 border-y">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{Dateformat(session._creationTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {session.startsAt} - {session.endsAt}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{session.location}</span>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span className="text-sm">{presentCount} Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-warning" />
            <span className="text-sm">{lateCount} Late</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span className="text-sm">{absentCount} Absent</span>
          </div>
        </div>

        {/* Session Controls */}
        {session.status !== "closed" && (
          <div className="flex gap-2">
            {session.status === "scheduled" && (
              <Button onClick={() => onStartSession(session._id)} className="flex-1">
                <Play className="mr-2 h-4 w-4" />
                Start Session
              </Button>
            )}
            {session.status === "live" && (
              <Button variant="destructive" onClick={() => onEndSession(session._id)} className="flex-1">
                <Square className="mr-2 h-4 w-4" />
                End Session
              </Button>
            )}
          </div>
        )}

        {/* Students List */}
        <div className="flex-1 min-h-0">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Students ({students.length})</h3>
          </div>

          <ScrollArea className="h-[250px] rounded-lg border">
            <div className="divide-y">
              {students.map((student) => {
                const attendance = getStudentAttendance(student._id)
                return (
                  <div key={student._id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {student.firstName + " " + student.lastName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none mb-1">{student.firstName}</p>
                        <p className="text-xs text-muted-foreground">{student.studentId}</p>
                      </div>
                    </div>

                    {session.status === "live" ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-8 w-8 ${attendance === "present" ? "bg-success/20 text-success" : ""}`}
                          onClick={() => onMarkAttendance(session._id, student._id, "present")}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-8 w-8 ${attendance === "late" ? "bg-warning/20 text-warning-foreground" : ""}`}
                          onClick={() => onMarkAttendance(session._id, student._id, "late")}
                        >
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-8 w-8 ${attendance === "absent" ? "bg-destructive/20 text-destructive" : ""}`}
                          onClick={() => onMarkAttendance(session._id, student._id, "absent")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="outline" className={getStatusColor(attendance)}>
                        {attendance ? attendance.charAt(0).toUpperCase() + attendance.slice(1) : "Not marked"}
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
