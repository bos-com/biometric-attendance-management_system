"use client";
import { AppSidebar } from "@/adminComponents/app-sidebar";
import { SidebarProvider,SidebarTrigger } from "@/components/ui/sidebar";


export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
         
  return (
    <div className="flex flex-col h-screen backdrop-blur-2xl">
        
        <SidebarProvider >
        <AppSidebar   />
                {/* <button
                  className={`fixed hidden md:flex  top-24 ${isopen? "left-60":"left-4"} z-50 p-2 bg-blue-400  text-white rounded-full shadow-lg shadow-black/50 border  hover:bg-blue-600 dark:bg-white dark:text-black transition-colors`}
                  onClick={toggleSidebar}
                >
                  {isopen ? <FaAngleLeft /> : <FaAngleRight />}
                </button> */}
      <main className="flex-1 overflow-y-auto">
        <SidebarTrigger className="absolute z-50 bg-dark text-white dark:bg-blue-800 top-[13%] " />
        {children}
      </main>
      </SidebarProvider>
    </div>
  );}