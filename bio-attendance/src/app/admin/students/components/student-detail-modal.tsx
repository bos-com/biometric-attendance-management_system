"use client"

import { useMemo } from "react"
import {
  User,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  ExternalLink,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/adminComponents/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/adminComponents/ui/avatar"
import { Badge } from "@/adminComponents/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/adminComponents/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts"
import type { StudentDetail, AttendanceEntry } from "../students"

interface StudentDetailModalProps {
  student: StudentDetail | null
  courseCode: string
  open: boolean
  onOpenChange: (open: boolean) => void
  attendanceHistory: AttendanceEntry[]
}

export function StudentDetailModal({
  student,
  courseCode,
  open,
  onOpenChange,
  attendanceHistory,
}: StudentDetailModalProps) {
  const courseAttendance = useMemo(() => {
    return attendanceHistory.filter((a) => a.courseCode === courseCode)
  }, [attendanceHistory, courseCode])

  const stats = useMemo(() => {
    const total = courseAttendance.length
    const present = courseAttendance.filter((a) => a.status === "present").length
    const late = courseAttendance.filter((a) => a.status === "late").length
    const absent = courseAttendance.filter((a) => a.status === "absent").length
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0

    return { total, present, late, absent, rate }
  }, [courseAttendance])

  const weeklyChartData = useMemo(() => {
    const weekMap = new Map<string, { week: string; present: number; late: number; absent: number }>()

    courseAttendance.forEach((entry) => {
      const weekNum = Math.ceil((new Date().getTime() - entry.sessionDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      const weekLabel = `Week ${13 - weekNum}`

      if (!weekMap.has(weekLabel)) {
        weekMap.set(weekLabel, { week: weekLabel, present: 0, late: 0, absent: 0 })
      }

      const weekData = weekMap.get(weekLabel)!
      if (entry.status === "present") weekData.present += 1
      else if (entry.status === "late") weekData.late += 1
      else weekData.absent += 1
    })

    return Array.from(weekMap.values()).sort((a, b) => {
      const numA = Number.parseInt(a.week.split(" ")[1])
      const numB = Number.parseInt(b.week.split(" ")[1])
      return numA - numB
    })
  }, [courseAttendance])

  const attendanceRateData = useMemo(() => {
    let cumulativePresent = 0
    let cumulativeTotal = 0

    return weeklyChartData.map((week) => {
      cumulativeTotal += week.present + week.late + week.absent
      cumulativePresent += week.present + week.late
      const rate = cumulativeTotal > 0 ? Math.round((cumulativePresent / cumulativeTotal) * 100) : 0
      return { week: week.week, rate }
    })
  }, [weeklyChartData])

  if (!student) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[80vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Student Details</DialogTitle>
        </DialogHeader>

        {/* Student Header */}
        <div className="flex flex-col sm:flex-row items-start gap-6 pb-6 border-b">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage src={student.photo || "/placeholder.svg"} alt={student.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
              {student.photo ? <User className="h-10 w-10" /> : getInitials(student.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">{student.name}</h2>
              <Badge
                variant="outline"
                className={
                  stats.rate >= 80
                    ? "border-emerald-500 text-emerald-600"
                    : stats.rate >= 60
                      ? "border-amber-500 text-amber-600"
                      : "border-red-500 text-red-600"
                }
              >
                {stats.rate}% Attendance
              </Badge>
            </div>
            <p className="text-muted-foreground mb-4">{student.program}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span>{student.registrationNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>Year {student.yearOfStudy}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold">{stats.present}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold">{stats.late}</p>
              <p className="text-xs text-muted-foreground">Late</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-2">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold">{stats.absent}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and History */}
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">Attendance Trends</TabsTrigger>
            <TabsTrigger value="breakdown">Weekly Breakdown</TabsTrigger>
            <TabsTrigger value="history">Session History</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Cumulative Attendance Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceRateData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`${value}%`, "Attendance Rate"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breakdown" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Weekly Attendance Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="late" name="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Session History for {courseCode}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {courseAttendance.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No attendance records yet</p>
                  ) : (
                    courseAttendance
                      .sort((a, b) => b.sessionDate.getTime() - a.sessionDate.getTime())
                      .map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                entry.status === "present"
                                  ? "bg-emerald-500/10"
                                  : entry.status === "late"
                                    ? "bg-amber-500/10"
                                    : "bg-red-500/10"
                              }`}
                            >
                              {entry.status === "present" ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : entry.status === "late" ? (
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {entry.sessionDate.toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                              <p className="text-xs text-muted-foreground">{entry.courseCode}</p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              entry.status === "present"
                                ? "border-emerald-500 text-emerald-600"
                                : entry.status === "late"
                                  ? "border-amber-500 text-amber-600"
                                  : "border-red-500 text-red-600"
                            }
                          >
                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                          </Badge>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button className="gap-2" asChild>
            <a href={`mailto:${student.email}`}>
              <Mail className="h-4 w-4" />
              Contact Student
            </a>
          </Button>
          <Button variant="secondary" className="gap-2" asChild>
            <a href="/attendance">
              <ExternalLink className="h-4 w-4" />
              View in Attendance Module
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
