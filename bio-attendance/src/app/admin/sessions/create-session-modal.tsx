"use client"

import type React from "react"
import { useEffect, useState } from "react"
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
import { CalendarDays, Clock, MapPin, Loader2, Check } from "lucide-react"
import useGetCourseUnits from "@/hooks/useGetCourseUnits"
import { Checkbox } from "@/components/ui/checkbox"
import { AttendanceSession } from "@/lib/types"
import { useLecturerSession } from "@/hooks/useLecturerSession"
import { Id } from "@/convex/_generated/dataModel"

interface Course {
  code: string
  name: string
}

interface CreateSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateSession: (session: Omit<AttendanceSession, "_id" | "_creationTime"|"sessionId">) => void
}

export function CreateSessionModal({ open, onOpenChange,onCreateSession }: CreateSessionModalProps) {
  const [formData, setFormData] = useState({
    courseCode: "",
    date: "",
    startTime: "",
    endTime: "",
    title: "",
    location: "",
    description: "",
    autoStart: false,
    autoClose: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { courseUnits} = useGetCourseUnits()
  const [coursesData, setCoursesData] = useState<Course[]>(courseUnits || [])

  useEffect(() => {
        if (courseUnits) {
      setCoursesData(courseUnits);
    }
  }, [courseUnits]);
  

  const selectedCourse = coursesData.find((c) => c.code === formData.courseCode)
  const { session } = useLecturerSession();
  const [lecturer, setLecturer] = useState(session);

  useEffect(()=>{
        setLecturer(session);
        console.log("Lecturer session updated: ", session);
  }, [formData,session]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    onCreateSession({
      courseUnitCode: formData.courseCode,
      lecturerId: lecturer?.userId as Id<"lecturers">,
      startsAt: new Date(`${formData.date}T${formData.startTime}`).getTime(),
      endsAt: new Date(`${formData.date}T${formData.endTime}`).getTime(),
      sessionTitle: formData.title,
      description: formData.description,
      status: "scheduled",
      location: formData.location,
      autoStart: formData.autoStart,
      autoClose: formData.autoClose,
    })

    setFormData({
      courseCode: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
        title: "",
      description: "",
        autoStart: false,
        autoClose: false,
    })
    setIsSubmitting(false)
    onOpenChange(false)
  }
   useEffect(() => {
        console.log("Courses data updated:", formData);
   },[formData])
  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full md:max-w-[900px] ">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>Schedule a new class session for attendance tracking</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 bg-green-50  p-2 ">
         <div className="grid md:grid-cols-4  md:gap-4 px-5" >
                 <div className="flex flex-col  space-y-2 overflow-clip">
            <Label htmlFor="courseCode">Course Unit</Label>
            <Select
              value={formData.courseCode}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, courseCode: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course unit" />
              </SelectTrigger>
              <SelectContent>
                {coursesData.map((course) => (
                  <SelectItem key={course.code} value={course.code}>
                    {course.code} - {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

                    <div className="flex flex-col  space-y-2 mb-2">
            <Label htmlFor="location">Title</Label>
            <div className="relative">
              
              <Input
                id="title"
                name="title"
                placeholder="Session Title / Topic"
                value={formData.title}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div  className="flex space-y-2 items-center gap-3">
                <Checkbox 
                  id="autoStart"
                  checked={formData.autoStart} 
                  onCheckedChange={(checked) => setFormData((prev) => ({...prev, autoStart: checked === true}))} 
                  className="flex text-black" 
                />
                <Label htmlFor="autoStart" className="font-semibold cursor-pointer">Auto Start</Label>
          </div>
                <div  className="flex space-y-2 items-center gap-3">
                <Checkbox
                  id="autoClose"
                  checked={formData.autoClose} 
                  onCheckedChange={(checked) => setFormData((prev) => ({...prev, autoClose: checked === true}))} 
                  className="flex text-black" 
                />
                <Label htmlFor="autoClose" className="font-semibold cursor-pointer">Auto Close</Label>
          </div>
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

          <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Session Description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 p-2"
                />
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
