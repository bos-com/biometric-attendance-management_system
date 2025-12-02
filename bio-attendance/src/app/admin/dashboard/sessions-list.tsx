"use client"

import type { ClassSession } from "./DashboardPage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/adminComponents/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/adminComponents/ui/tabs"
import { Calendar, Clock, MapPin, Users, Play, Square, Eye, ChevronRight } from "lucide-react"

interface SessionsListProps {
  sessions: ClassSession[]
  activeTab: "all" | "scheduled" | "ongoing" | "completed"
  onTabChange: (tab: "all" | "scheduled" | "ongoing" | "completed") => void
  onSelectSession: (session: ClassSession) => void
  onStartSession: (sessionId: string) => void
  onEndSession: (sessionId: string) => void
}

export function SessionsList({
  sessions,
  activeTab,
  onTabChange,
  onSelectSession,
  onStartSession,
  onEndSession,
}: SessionsListProps) {
  const getStatusBadge = (status: ClassSession["status"]) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>
      case "ongoing":
        return <Badge className="bg-success text-success-foreground hover:bg-success/90">Ongoing</Badge>
      case "completed":
        return <Badge variant="outline">Completed</Badge>
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Class Sessions</CardTitle>
            <CardDescription>Manage your class sessions and track attendance</CardDescription>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No sessions found</p>
            <p className="text-sm text-muted-foreground">Create a new session to get started</p>
          </div>
        ) : (
          <div className="divide-y">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/50 transition-colors gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold truncate">{session.courseName}</h3>
                    <Badge variant="outline" className="shrink-0">
                      {session.courseCode}
                    </Badge>
                    {getStatusBadge(session.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(session.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {session.startTime} - {session.endTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {session.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {session.attendanceRecords.length} attended
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {session.status === "scheduled" && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onStartSession(session.id)
                      }}
                    >
                      <Play className="mr-1.5 h-3.5 w-3.5" />
                      Start
                    </Button>
                  )}
                  {session.status === "ongoing" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEndSession(session.id)
                      }}
                    >
                      <Square className="mr-1.5 h-3.5 w-3.5" />
                      End
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => onSelectSession(session)}>
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    View
                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
