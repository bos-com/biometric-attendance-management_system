"use client"
import { ChartAreaInteractive } from "@/adminComponents/chart-area-interactive"
import PieChart  from "@/adminComponents/pie-chart"
import DataTable  from "@/adminComponents/data-table"
import { SectionCards } from "../../adminComponents/section-cards"
import { SiteHeader } from "../../adminComponents/site-header"
import { SidebarInset,  } from "../../adminComponents/ui/sidebar"
import useGetProductsByOwner from "@/hooks/useGetProductsByOwner"
import useGetSellersOrders from "@/hooks/useGetSellersOrders"
import { useAppSelector } from "@/hooks"

const Profile=()=> {
        const User = useAppSelector((state)=>state.user.user)
        const { data: products, } = useGetProductsByOwner(User?.User_id||'') ;
        const { data: orders } = useGetSellersOrders();
        
        
  return (
    
      
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col mt-5 ">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className=" flex flex-col md:flex-row @2xl:flex  gap-3 p-4 lg:px-6 ">
                <ChartAreaInteractive />
                <PieChart products={products?.length||0} orders={orders?.length||0} />
              </div>

              <div className="flex flex-col gap-4 px-4 lg:px-6">
                <div className=" px-4 " id="all" >
                <DataTable  products={products ?? [] } />
              </div>
              </div>
              
            </div>
          </div>
        </div>
      </SidebarInset>
  )
}
export default Profile
