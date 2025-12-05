"use client"

import type React from "react"

import { useState } from "react"
import { AttendanceSession } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/adminComponents/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarDays, BookOpen, Clock, MapPin } from "lucide-react"
import { useLecturerSession } from "@/hooks/useLecturerSession"
import { Id } from "@/convex/_generated/dataModel"

interface CreateSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateSession: (session: Omit<AttendanceSession, "_id" | "_creationTime" | "sessionId">) => void
}

export function CreateSessionModal({ open, onOpenChange, onCreateSession }: CreateSessionModalProps) {
  const { session: lecturerSession } = useLecturerSession();
  const [formData, setFormData] = useState({
    courseUnitCode: "",
    sessionTitle: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Convert date and time to timestamps
    const startDate = new Date(`${formData.date}T${formData.startTime}`)
    const endDate = new Date(`${formData.date}T${formData.endTime}`)

    onCreateSession({
      courseUnitCode: formData.courseUnitCode,
      sessionTitle: formData.sessionTitle,
      description: formData.description,
      startsAt: startDate.getTime(),
      endsAt: endDate.getTime(),
      location: formData.location,
      status: "scheduled",
      lecturerId: lecturerSession?.userId as Id<"lecturers">,
    })

    setFormData({
      courseUnitCode: "",
      sessionTitle: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
    })
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>Schedule a new class session for attendance tracking</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="courseUnitCode">Course Code</Label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="courseUnitCode"
                  name="courseUnitCode"
                  placeholder="CS101"
                  value={formData.courseUnitCode}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTitle">Session Title</Label>
              <Input
                id="sessionTitle"
                name="sessionTitle"
                placeholder="Introduction to Programming"
                value={formData.sessionTitle}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="Session description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="location"
                name="location"
                placeholder="Room A101"
                value={formData.location}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
