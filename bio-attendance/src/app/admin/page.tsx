"use client"
import { ChartAreaInteractive } from "@/adminComponents/chart-area-interactive"
import PieChart  from "@/adminComponents/pie-chart"
import DataTable  from "@/adminComponents/data-table"
import { SiteHeader } from "../../adminComponents/site-header"
import { SidebarInset,  } from "../../adminComponents/ui/sidebar"
import { useLecturerSession } from "@/hooks/useLecturerSession"
import useGetLecturer from "@/hooks/useGetLecturer"
import { Id } from "@/convex/_generated/dataModel"
import DashboardPage  from "./dashboard/DashboardPage"

const Profile=()=> {
        const {session} = useLecturerSession();
        const User = useGetLecturer(session?.userId as Id<"lecturers">);
        
        
  return (
    
      
      <SidebarInset>
        {/* <SiteHeader /> */}
        <div className="flex flex-1 flex-col mt-5 ">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="w-full" >
                <DashboardPage/>
              </div>
              <div className=" flex flex-col md:flex-row @2xl:flex  gap-3 p-4 lg:px-6 ">
                {/* <ChartAreaInteractive /> */}
                {/* <PieChart products={products?.length||0} orders={orders?.length||0} /> */}
                
              </div>
              
              <div className="flex flex-col gap-4 px-4 lg:px-6">
                <div className=" px-4 " id="all" >
                {/* <DataTable  products={products ?? [] } /> */}
              </div>
              </div>
              
            </div>
          </div>
        </div>
      </SidebarInset>
  )
}
export default Profile
