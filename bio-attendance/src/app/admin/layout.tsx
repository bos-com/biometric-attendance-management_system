"use client";
import { AppSidebar } from "@/adminComponents/app-sidebar";
import { SidebarProvider,SidebarTrigger } from "@/adminComponents/ui/sidebar";


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
        <SidebarTrigger className="absolute z-50 bg-dark text-white bg-blue-800 top-[13%] " />
        {children}
      </main>
      </SidebarProvider>
    </div>
  );}