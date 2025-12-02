"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, CalendarDays, TrendingUp, Clock } from "lucide-react"

interface DashboardStatsProps {
  totalSessions: number
  totalStudents: number
  averageAttendance: number
  ongoingSessions: number
}

export function DashboardStats({
  totalSessions,
  totalStudents,
  averageAttendance,
  ongoingSessions,
}: DashboardStatsProps) {
  const stats = [
    {
      label: "Total Sessions",
      value: totalSessions,
      icon: CalendarDays,
      description: "All class sessions",
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      label: "Total Students",
      value: totalStudents,
      icon: Users,
      description: "Registered students",
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      label: "Avg. Attendance",
      value: `${averageAttendance}%`,
      icon: TrendingUp,
      description: "Overall attendance rate",
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      label: "Ongoing Sessions",
      value: ongoingSessions,
      icon: Clock,
      description: "Currently active",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
