import useGetProductsByOwner from "@/hooks/useGetProductsByOwner";
import useGetSellersOrders from "@/hooks/useGetSellersOrders"
import '../app/globals.css'
import {
  Card,
  CardDescription,
//   CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAppSelector } from "@/hooks"

export function SectionCards() {
        const User = useAppSelector((state)=>state.user.user)
         const { data: products, } = useGetProductsByOwner(User?.User_id||'') ;
        const { data: orders } = useGetSellersOrders();
        // const approved = products?.filter((product) => product.approved).length || 0;
        const pending = products?.filter((product) => !product.approved).length || 0;
  return (
    <div className="  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-54 2xl:grid-cols-4 gap-4 px-4  lg:px-6">
      <Card className="@container/card bg-blue-100 transition-transform duration-200 hover:border-pink-400 hover:cursor-pointer hover:scale-105 dark:text-black  dark:bg-gray-500 ">
        <CardHeader className="relative p-12">
          <CardDescription className="text-black t">Total Products</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {products?.length} Products
          </CardTitle>
         
        </CardHeader>
        
      </Card>

      <Card className="@container/card bg-pink-100 transition-transform duration-200 hover:border-blue-400 hover:cursor-pointer hover:scale-105 dark:text-black dark:bg-gray-500 ">
        <CardHeader className="relative">
          <CardDescription>Pending Products</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {pending} Pending Products
          </CardTitle>
        </CardHeader>
        
      </Card>

      <Card className="@container/card bg-pink-100 transition-transform duration-200 hover:border-blue-400 hover:cursor-pointer hover:scale-105 dark:text-black dark:bg-gray-500 ">
        <CardHeader className="relative p-12">
          <CardDescription>Total Orders OverTime</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {orders?.length || 0} Orders
          </CardTitle>
          
        </CardHeader>
        
      </Card>

      <Card className="@container/card bg-blue-100 transition-transform duration-200 hover:border-pink-400 hover:cursor-pointer hover:scale-105 dark:text-black dark:bg-gray-500 ">
        <CardHeader className="relative p-12">
          <CardDescription>Active Orders</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {orders?.filter((order) => order.order_status ==="pending").length || 0} Pending Orders
          </CardTitle>
          
        </CardHeader>
    
      </Card>

      
    </div>
  )
}
