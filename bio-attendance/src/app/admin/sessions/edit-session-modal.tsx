"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, Clock, MapPin, Loader2 } from "lucide-react"
import { AttendanceSession } from "@/lib/types"
import { Id } from "@/convex/_generated/dataModel"

interface Course {
  code: string
  name: string
}

interface EditSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: AttendanceSession
  courses: Course[]
  onUpdateSession: (sessionId: Id<"attendance_sessions">, updates: Partial<AttendanceSession>) => void
}

export function EditSessionModal({ open, onOpenChange, session, courses, onUpdateSession }: EditSessionModalProps) {
  const [formData, setFormData] = useState({
    courseCode: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (session) {
      // Convert timestamps to date and time strings
      const startDate = new Date(session.startsAt)
      const endDate = new Date(session.endsAt)
      
      // Format date as YYYY-MM-DD
      const dateStr = startDate.toISOString().split("T")[0]
      
      // Format time as HH:MM (24-hour format for input type="time")
      const formatTime = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
      }

      setFormData({
        courseCode: session.courseUnitCode,
        date: dateStr,
        startTime: formatTime(startDate),
        endTime: formatTime(endDate),
        location: session.location,
      })
    }
  }, [session])

  const selectedCourse = courses.find((c) => c.code === formData.courseCode)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Convert date and time strings back to timestamps
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number)
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number)
    
    const startDate = new Date(formData.date)
    startDate.setHours(startHours, startMinutes, 0, 0)
    
    const endDate = new Date(formData.date)
    endDate.setHours(endHours, endMinutes, 0, 0)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    onUpdateSession(session._id, {
      courseUnitCode: formData.courseCode,
      sessionTitle: session.sessionTitle,
      startsAt: startDate.getTime(),
      endsAt: endDate.getTime(),
      location: formData.location,
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
          <DialogTitle>Edit Session</DialogTitle>
          <DialogDescription>Update session details. Changes will be saved immediately.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="courseCode">Course Unit</Label>
            <Select
              value={formData.courseCode}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, courseCode: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course unit" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.code} value={course.code}>
                    {course.code} - {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
