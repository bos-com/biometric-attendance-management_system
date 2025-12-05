"use client"

import { AttendanceSession } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/adminComponents/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/adminComponents/ui/tabs"
import { Calendar, Clock, MapPin, Users, Play, Square, Eye, ChevronRight } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"
import { Dateformat } from "@/lib/utils"

interface SessionsListProps {
  sessions: AttendanceSession[]
  activeTab: "all" | "scheduled" | "live" | "closed"
  onTabChange: (tab: "all" | "scheduled" | "live" | "closed") => void
  onSelectSession: (session: AttendanceSession) => void
  onStartSession: (sessionId: Id<"attendance_sessions">) => void
  onEndSession: (sessionId: Id<"attendance_sessions">) => void
}

export function SessionsList({
  sessions,
  activeTab,
  onTabChange,
  onSelectSession,
  onStartSession,
  onEndSession,
}: SessionsListProps) {
  const getStatusBadge = (status: AttendanceSession["status"]) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>
      case "live":
        return <Badge className="bg-success text-success-foreground hover:bg-success/90">Live</Badge>
      case "closed":
        return <Badge variant="outline">Closed</Badge>
    }
  }

  const formatDateFromTimestamp = (timestamp: number) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date(timestamp))
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
              <TabsTrigger value="live">Live</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
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
                key={session._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/50 transition-colors gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold truncate">{session.sessionTitle}</h3>
                    <Badge variant="outline" className="shrink-0">
                      {session.courseUnitCode}
                    </Badge>
                    {getStatusBadge(session.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateFromTimestamp(session.startsAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {Dateformat(session.startsAt)} - {Dateformat(session.endsAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {session.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {session.status === "scheduled" && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onStartSession(session._id)
                      }}
                    >
                      <Play className="mr-1.5 h-3.5 w-3.5" />
                      Start
                    </Button>
                  )}
                  {session.status === "live" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEndSession(session._id)
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
