"use client"

import {
        // Rocket,
         type LucideIcon } from "lucide-react"
import { IoBagCheckOutline  } from "react-icons/io5";
import {HomeIcon,SquarePlus,Rows4,Edit2Icon,LucideShare2
        // Users,HandCoins,SquareStack,Newspaper,User
} from "lucide-react"
import { handleShare } from "@/lib/helpers";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link";
import { MdOutlinePending } from "react-icons/md";
import { FcApproval } from "react-icons/fc";
import { useAppSelector } from "@/hooks";
import useGetShopBySellerId from "@/hooks/useGetShopBySellerId";
import { Id } from "../../convex/_generated/dataModel";


export function NavMain() {

         const User = useAppSelector((state) => state.user.user);
        const { data: shop } = useGetShopBySellerId(User? User.User_id as Id<"customers">: "" as Id<"customers">);
        const shopName = shop ? shop.shop?.shop_name : "your-shop";
        const items = [
                {
                        title: "Home",
                        icon: HomeIcon as LucideIcon,
                        link:"/admin",
                },
                
              
                {
                        title: "Orders",
                        icon: IoBagCheckOutline as LucideIcon,
                        link:"/admin/orders",
                },
             
                 {
                        title: "Add products",
                        icon: SquarePlus   as LucideIcon,
                        link:"/admin/post",
                },
                {
                        title: "All products",
                        icon: Rows4    as LucideIcon,
                        link:"/admin/#all",
                },
                {
                        title: "Approved Products",
                        icon: FcApproval    as LucideIcon,
                        link:"/admin/approved",
                },
                
                {
                        title: "Pending",
                        icon: MdOutlinePending     as LucideIcon,
                        link:"/admin/pending",
                },
                
                // {
                //         title: "Boost ",
                //         icon: Rocket   as LucideIcon,
                //         link:"/admin/boost",
                // },
                {
                        title: "Edit Shop Details",
                        icon: Edit2Icon      as LucideIcon,
                        link:"/admin/edit-shop",
                },
                
                
        ]
  return (
    <SidebarGroup  >
      <SidebarGroupContent className="flex flex-col gap-2 ">
<SidebarMenu className="font-semibold gap-2  ">
          {items.map((item) => (
                 <Link key={item.title} href={item.link} className="w-full mx-auto hover:bg-black   border hover:border-blue-400 rounded-2xl">
            <SidebarMenuItem  className="flex items-center gap-2 p-2  rounded-2xl hover:bg-blue-400 transition-colors duration-500 hover:cursor-pointer " >
                <SidebarMenuButton tooltip={item.title} className="gap-4 w-full h-full bg-transparent hover:bg-transparent hover:cursor-pointer " >
                {item.icon && <item.icon className="text-gray-500 w-full " />}
                <span className="text-blue flex " >{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             </Link>
          ))}
          <SidebarMenuItem  
          className="flex items-center    border hover:border-blue-400  gap-2 p-2  rounded-2xl
           hover:bg-blue-400 transition-colors duration-500 hover:cursor-pointer " 
                  onClick={() => handleShare(`https://shopcheapug.com/shops/${shopName}`,`${shopName}`) }
           >
                <SidebarMenuButton tooltip="Share your Business" className="gap-4 w-full h-full bg-transparent hover:bg-transparent hover:cursor-pointer " >
                <LucideShare2 className="text-gray-500 w-full " />
                <span className="text-blue flex " >Share Your Business</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
