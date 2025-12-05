"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/adminComponents/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/adminComponents/ui/avatar"
import { GraduationCap, Plus, Bell, Settings, LogOut as SignOut, User, ExternalLink, Camera, Video } from "lucide-react"
import { useLecturerSession } from '@/hooks/useLecturerSession';
import useGetLecturer from "@/hooks/useGetLecturer"
import { Id } from "@/convex/_generated/dataModel"
import useLogout from "@/hooks/useLogout"
import { useCameraControl } from "@/hooks/useCameraControl"

interface DashboardHeaderProps {
  onCreateSession?: () => void
}

export function DashboardHeader({ onCreateSession }: DashboardHeaderProps) {
  const {session} = useLecturerSession();
     const Lecturer = useGetLecturer(session?.userId as Id<"lecturers">);
        const {LogOut} = useLogout();
  const { cameraState, toggleCameraMinimize } = useCameraControl();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold leading-none">AttendanceHub</span>
              <span className="text-xs text-muted-foreground">Lecturer Portal</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Camera Status Indicator */}
            {cameraState.isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleCameraMinimize}
                className="flex items-center gap-2 bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
                </span>
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Recording</span>
              </Button>
            )}

            {/* Link to attendance module */}
            <Button variant="outline" size="sm" asChild className="hidden sm:flex bg-transparent">
              <Link href="/attendance">
                <ExternalLink className="mr-2 h-4 w-4" />
                Attendance Module
              </Link>
            </Button>

            {/* Notifications */}
            {/* <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                3
              </span>
            </Button> */}

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                    {Lecturer.user?.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{Lecturer.user?.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{Lecturer.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/admin/profile" className="flex items-center w-full ">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/attendance" className="flex items-center sm:hidden">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Attendance Module
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive"
                onClick={() => LogOut(Lecturer.user?._id as Id<"lecturers">)}
                >
                  <SignOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
