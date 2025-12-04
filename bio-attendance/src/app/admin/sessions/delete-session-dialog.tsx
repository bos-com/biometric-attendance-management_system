"use client"

import type { ClassSession } from "../dashboard/DashboardPage"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/adminComponents/ui/alert-dialog"
import { Badge } from "@/adminComponents/ui/badge"
import { Id } from "@/convex/_generated/dataModel"
import { AttendanceSession } from "@/lib/types"
import { Dateformat } from "@/lib/utils"
import { Calendar, Clock, MapPin, AlertTriangle } from "lucide-react"

interface DeleteSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: AttendanceSession
  onDeleteSession: (sessionId: Id<"attendance_sessions">) => void
}

export function DeleteSessionDialog({ open, onOpenChange, session, onDeleteSession }: DeleteSessionDialogProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const handleDelete = () => {
    onDeleteSession(session._id)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4">
            <p>Are you sure you want to delete this session? This action cannot be undone.</p>
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{session.sessionTitle}</span>
                <Badge variant="outline">{session.courseUnitCode}</Badge>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {Dateformat(session._creationTime||0)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {Dateformat(session.startsAt||0)} - {Dateformat(session.endsAt||0)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {session.location}
                </span>
              </div>
              {/* {session.attendanceRecords.length > 0 && (
                <p className="text-sm text-amber-600 font-medium">
                  Warning: This session has {session.attendanceRecords.length} attendance records that will also be
                  deleted.
                </p>
              )} */}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
