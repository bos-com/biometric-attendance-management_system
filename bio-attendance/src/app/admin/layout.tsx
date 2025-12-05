"use client";
import { AppSidebar } from "@/adminComponents/app-sidebar";
import { SidebarProvider,SidebarTrigger } from "@/adminComponents/ui/sidebar";
import { DashboardHeader } from "./dashboard/dashboard-header"
import { FloatingCameraWidget } from "@/components/FloatingCameraWidget";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
         
  return (
    <div className="flex flex-col h-screen backdrop-blur-2xl">
        
        <SidebarProvider >
        <AppSidebar   />
      <main className="flex-1 overflow-y-auto">
        <DashboardHeader />
        <SidebarTrigger className="absolute z-50 w-10 h-10 text-white bg-blue-800 -ml-5 hover:scale-125 hover:cursor-pointer top-[13%] " />
        {children}
      </main>
      </SidebarProvider>
      
      {/* Floating Camera Widget - visible when recording */}
      <FloatingCameraWidget />
    </div>      
  );}