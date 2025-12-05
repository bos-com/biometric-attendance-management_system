"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/adminComponents/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/adminComponents/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/adminComponents/ui/dropdown-menu"
import {
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  Users,
  Play,
  Square,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  ScanLine,
  CalendarPlus,
  CalendarCheck,
  CalendarX,
  Filter,
} from "lucide-react"
import { CreateSessionModal } from "./create-session-modal"
import { EditSessionModal } from "./edit-session-modal"
import { SessionDetailDrawer } from "./session-detail-drawer"
import { DeleteSessionDialog } from "./delete-session-dialog"
import { AttendanceSession } from "@/lib/types"
import { Id } from "@/convex/_generated/dataModel"
import {Dateformat } from "@/lib/utils"
import Loader from "@/components/Loader/loader"
import useGetCourseUnitByCode from "@/hooks/useGetCourseUnitByCode"
import { Student } from "@/lib/types";
import useGetAttendancePerSession from "@/hooks/useGetAttendancePerSession"

// Separate component to safely use hook inside a loop
export function CourseUnitName({ courseCode }: { courseCode: string }) {
  const { courseUnit, loading } = useGetCourseUnitByCode(courseCode);
  if (loading) return <span className="text-muted-foreground">Loading...</span>;
  return <span className="font-bold" >{courseUnit?.name ?? courseCode}</span>;
}

// Component to display attendance count for a session
function SessionAttendanceCount({ sessionId }: { sessionId: Id<"attendance_sessions"> }) {
  const { attendance, loading } = useGetAttendancePerSession(sessionId);
  
  if (loading) return <span className="text-muted-foreground">...</span>;
  
  const presentCount = attendance?.filter((r) => r?.status === "present" || r?.status === "late").length ?? 0;
  
  return <span>{presentCount} attended</span>;
}

interface Course {
  code: string
  name: string
}

interface SessionManagementProps {
  sessions: AttendanceSession[]
  sessionLoading: boolean
  students: Student[]
  courses: Course[]
  onCreateSession: (session: Omit<AttendanceSession, "_id" | "_creationTime"|"sessionId">) => void
  onUpdateSession: (sessionId: Id<"attendance_sessions">, updates: Partial<AttendanceSession>) => void
  onDeleteSession: (sessionId: Id<"attendance_sessions">) => void
  onStartSession: (sessionId: Id<"attendance_sessions">) => void
  onEndSession: (sessionId: Id<"attendance_sessions">) => void
  onMarkAttendance: (sessionId: Id<"attendance_sessions">, studentId: Id<"students">, status: "present" | "absent" | "late") => void
}

export function SessionManagement({
  sessions,
  sessionLoading,
  students,
  courses,
  onCreateSession,
  onUpdateSession,
  onDeleteSession,
  onStartSession,
  onEndSession,
  onMarkAttendance,
}: SessionManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "scheduled" | "live" | "closed">("all")
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null)

  // Filter and search sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesSearch =
        session.sessionTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.courseUnitCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.location?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || session.status === statusFilter
      const matchesCourse = courseFilter === "all" || session.courseUnitCode === courseFilter
      return matchesSearch && matchesStatus && matchesCourse
    })
  }, [sessions, searchQuery, statusFilter, courseFilter])

  // Stats
  const stats = useMemo(() => {
    return {
      total: sessions.length,
      scheduled: sessions.filter((s) => s.status === "scheduled").length,
      ongoing: sessions.filter((s) => s.status === "live").length,
      completed: sessions.filter((s) => s.status === "closed").length,
    }
  }, [sessions])

  const getStatusBadge = (status: Partial<AttendanceSession>["status"]) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="secondary" className="gap-1 bg-amber-200">
            <CalendarPlus className="h-3 w-3" />
            Scheduled
          </Badge>
        )
      case "live":
        return (
          <Badge className="gap-1 bg-green-600">
            <Play className="h-3 w-3" />
            Ongoing
          </Badge>
        )
      case "closed":
        return (
          <Badge variant="outline" className="gap-1 bg-red-300 ">
            <CalendarCheck className="h-3 w-3" />
            Completed
          </Badge>
        )
    }
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }

    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const handleEditSession = (session: AttendanceSession) => {
    setSelectedSession(session)
    setEditModalOpen(true)
  }

  const handleDeleteSession = (session: AttendanceSession) => {
    setSelectedSession(session)
    setDeleteDialogOpen(true)
  }

  const handleViewSession = (session: AttendanceSession) => {
    setSelectedSession(session)
    setDetailDrawerOpen(true)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-green-100/80">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="px-3" >
              <h1 className="text-xl font-semibold">Session Management</h1>
              <p className="text-sm text-muted-foreground">Create, schedule, and manage class sessions</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2">
            <Link href="/admin/attendance">
              <Button variant="outline" size="sm">
                <ScanLine className="mr-2 h-4 w-4" />
                Attendance Module
              </Button>
            </Link>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Session
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 px-3 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setStatusFilter("all")}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => setStatusFilter("scheduled")}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <CalendarPlus className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setStatusFilter("live")}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <Play className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.ongoing}</p>
                <p className="text-sm text-muted-foreground">Ongoing</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => setStatusFilter("closed")}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-500/10">
                <CalendarCheck className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.code} value={course.code}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                    <TabsTrigger value="live">Ongoing</TabsTrigger>
                    <TabsTrigger value="closed">Completed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Class Sessions</CardTitle>
            <CardDescription>
              {filteredSessions.length} session{filteredSessions.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
         {sessionLoading ?(
                <div className="w-[90%] h-[50%] " >
                        <Loader />
                </div>
         ):(
                <CardContent className="p-0">
            {filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <CalendarX className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">No sessions found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all" || courseFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first session to get started"}
                </p>
                {!searchQuery && statusFilter === "all" && courseFilter === "all" && (
                  <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Session
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y  p-2">
                {filteredSessions.sort((b, a) => a.startsAt - b.startsAt).map((session) => (
                  <div
                    key={session._id}
                    className="flex flex-col gap-4 p-4 rounded-lg border border-green-100 mt-2 transition-colors hover:bg-blue-50/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1 min-w-0  ">
                      <div className="flex flex-wrap items-center gap-2 mb-2  ">
                        <CourseUnitName courseCode={session.courseUnitCode} />
                        <Badge variant="outline">{session.courseUnitCode}</Badge>
                        <h3 className="">[{session.sessionTitle}]</h3>
                        
                        {getStatusBadge(session.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(new Date(session._creationTime||0))}
                        </span>
                        <span className="flex items-center gap-1.5 text-black md:font-semibold ">
                          <Clock className="h-3.5 w-3.5" />
                          from <span className="text-green-800 md:font-bold" >{Dateformat(session.startsAt||0)}</span> <span className="md:font-bold" >to</span> <span className="text-red-500" >{Dateformat(session.endsAt||0)}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {session.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          <SessionAttendanceCount sessionId={session._id} />
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {session.status === "scheduled" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            if (session._id !== undefined) {
                              onStartSession(session._id)
                            }
                          }}
                          className="bg-emerald-500 hover:bg-emerald-600 hover:cursor-pointer"
                        >
                          <Play className="mr-1.5 h-3.5 w-3.5" />
                          Start Session
                        </Button>
                      )}
                      {session.status === "live" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="hover:cursor-pointer"
                          onClick={() => {
                            if (session._id !== undefined) {
                              onEndSession(session._id)
                            }
                          }}
                        >
                          <Square className="mr-1.5 h-3.5 w-3.5" />
                          End Session
                        </Button>
                      )}
                      {session.status === "closed" && (
                        <Button
                          size="sm"
                          className="hover:cursor-not-allowed bg-red-400 hover:bg-red-400 "
                        >
                          Session Ended
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleViewSession(session)}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        View
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewSession(session)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {session.status !== "closed" && (
                            <DropdownMenuItem onClick={() => handleEditSession(session)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Session
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteSession(session)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Session
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
         ) }
        </Card>
      </main>

      {/* Modals */}
      <CreateSessionModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreateSession={onCreateSession}
      />

      {selectedSession && (
        <>
          <EditSessionModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            session={selectedSession}
            courses={courses}
            onUpdateSession={onUpdateSession}
          />
          <DeleteSessionDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            session={selectedSession}
            onDeleteSession={onDeleteSession}
          />
          <SessionDetailDrawer
            open={detailDrawerOpen}
            onOpenChange={setDetailDrawerOpen}
            session={selectedSession}
            students={students}
            onStartSession={onStartSession}
            onEndSession={onEndSession}
            onMarkAttendance={onMarkAttendance}
          />
        </>
      )}
    </div>
  )
}
