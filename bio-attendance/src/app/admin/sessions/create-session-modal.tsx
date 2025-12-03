"use client"

import type React from "react"
import { useState } from "react"
import type { ClassSession } from "../dashboard/DashboardPage"
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

interface Course {
  code: string
  name: string
}

interface CreateSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courses: Course[]
  onCreateSession: (session: Omit<ClassSession, "id" | "attendanceRecords" | "status">) => void
}

export function CreateSessionModal({ open, onOpenChange, courses, onCreateSession }: CreateSessionModalProps) {
  const [formData, setFormData] = useState({
    courseCode: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedCourse = courses.find((c) => c.code === formData.courseCode)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    onCreateSession({
      courseCode: formData.courseCode,
      courseName: selectedCourse?.name || "",
      date: new Date(formData.date),
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location,
    })

    setFormData({
      courseCode: "",
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
            <Button type="submit" disabled={isSubmitting || !formData.courseCode}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Session"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
