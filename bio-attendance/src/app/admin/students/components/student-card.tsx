"use client"

import { User, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/adminComponents/ui/avatar"
import { Badge } from "@/adminComponents/ui/badge"
import { Student } from "@/lib/types";

interface StudentCardProps {
  student: Student
  attendanceRate: number
  onClick: () => void
}

export function StudentCard({ student, attendanceRate, onClick }: StudentCardProps) {
  const getAttendanceBadge = () => {
    if (attendanceRate >= 80) {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 gap-1">
          <TrendingUp className="h-3 w-3" />
          {attendanceRate}%
        </Badge>
      )
    } else if (attendanceRate >= 60) {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 gap-1">
          <Minus className="h-3 w-3" />
          {attendanceRate}%
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 gap-1">
          <TrendingDown className="h-3 w-3" />
          {attendanceRate}%
        </Badge>
      )
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group" onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
            <AvatarImage src={student.photoDataUrl?.[0] || "/placeholder.svg"} alt={student.firstName} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {student.photoDataUrl?.[0] ? <User className="h-6 w-6" /> : getInitials(student.firstName + " " + student.lastName    )}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{student.firstName} {student.lastName}</h3>
            <p className="text-sm text-muted-foreground">{student.studentId}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{student.program}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Attendance</span>
          {getAttendanceBadge()}
        </div>
      </CardContent>
    </Card>
  )
}
