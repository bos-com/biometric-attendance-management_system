"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TbListDetails } from "react-icons/tb";
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Search,
  Eye,
//   Trash
} from "lucide-react"
import Image from "next/image"
import useGetSellersOrders from "@/hooks/useGetSellersOrders"
import { formatDate } from "@/lib/helpers"
import { Order} from "@/lib/types"
import { CardHeader } from "@/adminComponents/ui/card"
import { truncateString } from "@/lib/helpers"
import {getUserById,getOrderById,UpdateOrder,getProductById} from "@/lib/convex"
import { Id } from "../../../convex/_generated/dataModel"
import { useNotification } from "@/app/NotificationContext"
import { useSendMail } from '@/hooks/useSendMail';
import {generateStatusChangeEmailHTML} from "@/EmailTemplates/OrderStatusChange";

const statusConfig = {
  pending: { color: "bg-orange-500", icon: Clock, label: "Pending" },
  confirmed: { color: "bg-blue-500", icon: CheckCircle, label: "Confirmed" },
  "out-for-delivery": { color: "bg-indigo-500", icon: Truck, label: "Out for Delivery" },
  delivered: { color: "bg-green-500", icon: CheckCircle, label: "Delivered" },
  cancelled: { color: "bg-red-500", icon: XCircle, label: "Cancelled" },
}

export default function OrdersTracking() {
        const { setNotification } = useNotification()
                const { sendEmail, } = useSendMail();
        const { data:Orders, } = useGetSellersOrders()
        // const {handleDelete} = useDeleteOrder()
        const [selectedOrder, setSelectedOrder] = useState<Order |null>(null)
        const [searchTerm, setSearchTerm] = useState("")
        const [statusFilter, setStatusFilter] = useState<string>("all")
        const [activeTab, setActiveTab] = useState("all")
        const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
        const finalOrders = filteredOrders.filter((order) => {
        const matchesSearch = filteredOrders.some((item)=>
        item?.product?.product_name?.toLowerCase().includes(searchTerm.toLowerCase())||
        item?.product?.product_cartegory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item?.product?.product_description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        

    const matchesStatus = statusFilter === "all" || order.order_status === statusFilter
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && !["delivered", "cancelled"].includes(order.order_status)) ||
      (activeTab === "completed" && ["delivered", "cancelled"].includes(order.order_status))

    return matchesSearch && matchesStatus && matchesTab
  })
  const GetUser = async (userId: Id<"customers">) => {
        const user = await getUserById(userId)
        if (!user.user){
                return null
        }
        return user.user
  }

  const ChangeOrderStatus = async (OrderId: Id<"orders">, newStatus: "pending" | "confirmed" | "out-for-delivery" | "delivered" | "cancelled") => {
    const order = await getOrderById(OrderId);
    
    if (!order.success) {
        setNotification({
            status: "error",
            message: "Order not found",
        });
        return false;
    }

    if (!order.order?._id) {
        setNotification({
            status: "error",
            message: "Invalid order data",
        });
        return false;
    }

    const updatedOrder = {
        _id: order.order._id,
        user_id: order.order.user_id,
        order_status: newStatus,
        updatedAt: new Date().getTime(),
        quantity: order.order.quantity,
        product_id: order.order.product_id,
        specialInstructions: order.order.specialInstructions,
        cost: order.order.cost,
        sellerId: order.order.sellerId,
    };
    const user = await GetUser(order.order.user_id as Id<"customers">)
    const newProduct = (await getProductById(updatedOrder.product_id)).product

    return await UpdateOrder(updatedOrder).then(async (res) => {
        if (!res.success) {
            setNotification({
                status: "error",
                message: res.message || "Failed to confirm order",
            });
            return false; 
        }

        setNotification({
            status: "success",
            message: `Order  has been marked as  ${newStatus} successfully`,
        });
        // Send An Email To the user if user is valid
        if (user !== null && user?.email ) {
            sendEmail(user?.email, `Your order has been marked as ${newStatus}`, await generateStatusChangeEmailHTML({
                ...updatedOrder,
                _creationTime: order.order?._creationTime || Date.now(),
            },newProduct,user),"shopcheap" );
        }

        return true;
    });
};
  
useEffect(() => {
  if (Orders) {
    // Async function to resolve all user Promises
    const fetchUsersAndSetOrders = async () => {
      const sanitizedOrders = await Promise.all(
        Orders.map(async (order) => ({
          ...order,
          user: await GetUser(order.user_id as Id<"customers">),
                // product: await getOrderById(order._id as Id<"orders">).then(res => res.order?.product_id ? res.order.product_id : null)
        }))
      );
      setFilteredOrders(sanitizedOrders);
    };
    fetchUsersAndSetOrders();
  }
}, [Orders]);


  const getStatusBadge = (
    status: keyof typeof statusConfig
  ) => {
    const config = statusConfig[status]
    const Icon = config.icon
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen mt-20 bg-gray-50 dark:bg-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2"> Orders</h1>
          <p className="text-gray-500">Track available  orders and view order history</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 dark:bg-gray-600">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Orders</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by order number, restaurant, or item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Label htmlFor="status-filter">Filter by Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="active">Active Orders</TabsTrigger>
            <TabsTrigger value="completed">Order History</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 ">
            {/* Orders List */}
            <div className="space-y-4">
              {finalOrders?.length === 0 ? (
                <Card className="dark:bg-gray-700" >
                  <CardContent className="p-12 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-600">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "You haven't placed any orders yet"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                finalOrders?.map((order) => (
                  <Card key={order._id} className="hover:shadow-md transition-shadow border border-purple-400 dark:bg-gray-900 rounded-2xl ">
                    <CardHeader className="p-4 bg-blue-700">
                                        <div className="flex flex-col lg:flex-row justify-between gap-4">
                                        {/* Main Order Info Section */}
                                        <div className="flex-1 space-y-4">
                                        {/* User Info and Status Row */}
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-blue-50 rounded-xl">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                                                <h2 className="font-semibold text-gray-900">
                                                {order.user?.username || 'Guest User'}
                                                </h2>
                                                <div className="flex items-center">
                                                {getStatusBadge(order.order_status as keyof typeof statusConfig)}
                                                </div>
                                                <span className="text-sm text-gray-600">
                                                {order._creationTime ? formatDate(order._creationTime) : 'No date'}
                                                </span>
                                        </div>
                                        </div>

                                        </div>

                                        {/* Action Section */}
                                        <div className="grid grid-cols-3 items-start justify-end gap-1">
                                        <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2 text-blue-600 hover:blue-red-700 hover:bg-blue-50 border-blue-200"
                                        onClick={() => ChangeOrderStatus(order._id as Id<"orders">, "confirmed")}
                                        >
                                        <CheckCircle className="w-4 h-4" />
                                        Confirm
                                        </Button>
                                        <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2 text-indigo-600 hover:indigo-red-700 hover:bg-indigo-50 border-indigo-200"
                                        onClick={() => ChangeOrderStatus(order._id as Id<"orders">, "out-for-delivery")}
                                        >
                                        <Truck className="w-4 h-4" />
                                        out-for-delivery
                                        </Button>
                                        <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2 text-green-600 hover:green-red-700 hover:bg-green-50 border-green-200"
                                        onClick={() => ChangeOrderStatus(order._id as Id<"orders">, "delivered")}
                                        >
                                        <CheckCircle className="w-4 h-4" />
                                        delivered
                                        </Button>

                                        <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                        onClick={() => ChangeOrderStatus(order._id as Id<"orders">, "cancelled")}
                                        >
                                        <XCircle className="w-4 h-4" />
                                        Cancel
                                        </Button>
                                        <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-red-50 border-red-200"
                                        onClick={() =>  ChangeOrderStatus(order._id as Id<"orders">, "pending")}
                                        >
                                        <Clock className="w-4 h-4" />
                                        pending
                                        </Button>
                                        </div>
                                        </div>
                                </CardHeader>
                    <CardContent className="md:p-6 grid  md:grid-cols-2 lg:grid-cols-3  border  gap-3 p-2 rounded-2xl ">
                        
                        <div className="flex  space-x-4 gap-2  bg-blue-500/10 items-center  border border-purple-400 rounded-2xl p-1   ">
                                                <div className="flex gap-3 items-center  w-[25%] h-[85%] rounded-md ">
                                                       {order.product?.product_image ? (
                                                                          <Image
                                                                            src={order.product.product_image[0]||"/placeholder.svg"}
                                                                            alt={order.product.product_name || "Product Image"}
                                                                            width={40}
                                                                            height={40}
                                                                            className="rounded-lg  w-[100%] h-[100%] "
                                                                            />
                                                                            ) : (
                                                                                <Package className="w-6 h-6 text-gray-400" />
                                                                                )}
                                                </div>

                                                <div className="flex" >
                                                        <div className="text-sm text-gray-600 space-y-1">
                                                                <h3 className="text-lg font-semibold">{order.product?.product_name}</h3>
                                                                <div className="flex items-center gap-2">
                                                                        Price: {order.product?.product_price ? `Ugx: ${Number(order.product.product_price).toLocaleString()}` : "N/A"}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                <TbListDetails className="w-4 h-4" />
                                                                {truncateString(order.product?.product_description||"",7) || "No description available"}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                Quantity: 
                                                                {order.quantity}
                                                                </div>
                                                        </div>

                                                        <div className="flex flex-col bg-amber-3d00  items-start sm:items-center gap-3">
                                                        <div className=" flex flex-col text-right">
                                                        
                                                        </div>
                                                        <div className="flex gap-2">
                                                        <Dialog>
                                                        <DialogTrigger asChild>
                                                                <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                View
                                                                </Button>
                                                                
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                                                <DialogHeader>
                                                                <DialogTitle>Order Details for - {order?.product?.product_name}</DialogTitle>
                                                                <DialogDescription>
                                                                Placed on {order._creationTime ? formatDate(order._creationTime) : ""}
                                                                </DialogDescription>
                                                                </DialogHeader>

                                                                {selectedOrder && (
                                                                <div className="space-y-6">
                                                                <Separator />

                                                                {/* Order Items */}
                                                                <div>
                                                                <h4 className="font-semibold mb-3">Order Items</h4>
                                                                <div className="space-y-3">
                                                                        <div  className="flex items-center gap-3">
                                                                        <Image
                                                                        src={order.product?.product_image[0] || "/placeholder.svg"}
                                                                        alt={order.product?.product_name || "Product Image"}
                                                                        width={60}
                                                                        height={60}
                                                                        className="rounded-lg object-cover"
                                                                        />
                                                                        <div className="flex-1">
                                                                        <h5 className="font-medium">{order.product?.product_name}</h5>
                                                                        {/* {item.customizations && (
                                                                                <p className="text-sm text-gray-600">
                                                                                {item.customizations.join(", ")}
                                                                                </p>
                                                                        )} */}
                                                                        <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                        <p className="font-medium">Ugx:{(Number(order.product?.product_price) * order.quantity).toLocaleString()}</p>
                                                                        </div>
                                                                        </div>
                                                                </div>
                                                                </div>

                                                                <Separator />

                                                                {/* Order Details */}
                                                                <div>
                                                                <h4 className="font-semibold mb-3">Order Details</h4>
                                                                <div className="space-y-2 text-sm">
                                                                <div>
                                                                        <h1>
                                                                                {order.product?.product_description}
                                                                        </h1>
                                                                </div>
                                                                        <div className="flex justify-between">
                                                                        <span>Delivery Fee</span>
                                                                        {/* <span>${selectedOrder.deliveryFee.toFixed(2)}</span> */}
                                                                        </div>
                                                                        <Separator />
                                                                        <div className="flex justify-between font-semibold text-base">
                                                                        <span>Total</span>
                                                                        Ugx: {(Number(order.product?.product_price) * order.quantity).toLocaleString()}
                                                                        </div>
                                                                </div>
                                                                </div>

                                                                <Separator />

                                                                {/* Delivery & Payment Info */}
                                                                <div className="grid md:grid-cols-2 gap-6">
                                                                <div>
                                                                        <h4 className="font-semibold mb-2">Delivery Address</h4>
                                                                        {/* <p className="text-sm text-gray-600">{selectedOrder.deliveryAddress}</p> */}
                                                                </div>
                                                                <div>
                                                                        <h4 className="font-semibold mb-2">Payment Method</h4>
                                                                        {/* <p className="text-sm text-gray-600">{selectedOrder.paymentMethod}</p> */}
                                                                </div>
                                                                </div>

                                                                <Separator />

                                                                
                                                                </div>
                                                                )}
                                                        </DialogContent>
                                                        </Dialog>

                                                        </div>
                                                        </div>
                                                </div>
                        </div> 

                        {/* Order Details Row */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-amber-50 rounded-xl">
                                        <div className="space-y-1">
                                                <p className="text-xs font-bold text-gray-700 break-all">
                                                Order #: {order._id}
                                                </p>
                                                <p>Special Instructions: {order.specialInstructions || 'None'}</p>
                                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Total: UGX {order?.cost?.toLocaleString() || '0'}
                                                </p>
                                        </div>
                                        </div>

                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}