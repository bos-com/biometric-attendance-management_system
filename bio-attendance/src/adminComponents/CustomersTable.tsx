// import {
//         Table,
//         TableBody,
//         TableCell,
//         TableHead,
//         TableHeader,
//         TableRow,
//       } from "@/components/ui/table"
//       import { Checkbox } from "./ui/checkbox";
// import { Button } from "./ui/button";
// // import DeleteModal from "./DeleteModal/page";
// import { useEffect, useState } from "react";
// // import DeleteAllModal from "./DeleteAll/page";
// import { User } from "@/lib/utils";
// import { Id } from "../../convex/_generated/dataModel";
// import { formatDate } from "@/lib/helpers";
// import { getUserById } from "@/lib/convex";
// import { UpdateCustomer } from "@/lib/convex";
// import { useNotification } from "@/app/NotificationContext";
// import { Card, CardContent } from "./ui/card";
// import { Label } from "./ui/label";
// import { Input } from "./ui/input";
// import { Search } from "lucide-react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

// interface DataTable {
//   users: User[];
//   status?: string; 
// }
// const CustomersTable: React.FC<DataTable> = ({ users, status }) => {
//         const { setNotification } = useNotification();
//         const [searchTerm, setSearchTerm] = useState("")
//         const [statusFilter, setStatusFilter] = useState<boolean>(true)
//         const [roleFilter, setRoleFilter] = useState<string>("all");
//         // const [isvisible, setisvisible] = useState(false);
//         // const [isdelete, setisdelete] = useState(false);
//         // const [isdeleteall, setisdeleteall] = useState(false);
//         // const [productId, setproductId] = useState<Id<"Users">>("" as Id<"Users">);
//         const [checked, setchecked] = useState<Id<"customers">[]>([]);
//         const [allchecked, setallchecked] = useState(false);
//         const finalUsers = users.filter((user) => {
//         const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         user.role.toLowerCase().includes(searchTerm.toLowerCase());

//         const matchesStatus = statusFilter === true || user.isActive === statusFilter;

//         const matchesRole = roleFilter === "all" || user.role === roleFilter;

//         return matchesSearch && matchesStatus && matchesRole;
//         });


//         const HandleCheckboxChange=(UserId:Id<"Users">)=>{
//                 if(!checked.includes(UserId)){
//                         setchecked([...checked,UserId])
//                 }else{
//                         setchecked(checked.filter(id=>id!==UserId))
//                 }
//         }
//         const MakeAdmin = async (UserId: Id<"Users">) => {
//                  const user = await getUserById(UserId);
//                 if (!user || !user.user) {
//                         setNotification({
//                                 status: "error",
//                                 message: "User not found",})
//                         return false;
//                 }
//                 const updatedUser = {
//                         ...user.user,
//                         role: user.user.role === "admin" ? "customer" : "admin", // Toggle role
//                 }
//                 return await UpdateCustomer(updatedUser).then((res) => {
//                         if (!res.success) {
//                                 setNotification({
//                                         status: "error",
//                                         message: res.message || "Failed to update user status",
//                                 })
//                                 return 
//                         }                                 
//                                 setNotification({
//                                         status:"success",
//                                         message: `User ${updatedUser.username } ${updatedUser.role === "admin" ? "activated to admin" : "removed from admin"} successfully`,
//                                 })
//                                 return true;
                        
// })
//         }
//         const HandleBlockUser = async (UserId: Id<"Users">) => {
//                 const user = await getUserById(UserId);
//                 if (!user || !user.user) {
//                         setNotification({
//                                 status: "error",
//                                 message: "User not found",})
//                         return false;
//                 }
//                 const updatedUser = {
//                         ...user.user,
//                         isActive: !user.user.isActive, 
//         }
//                 return await UpdateCustomer(updatedUser).then((res) => {
//                         if (!res.success) {
//                                 setNotification({
//                                         status: "error",
//                                         message: res.message || "Failed to update user status",
//                                 })
//                                 return 
//                         }                                 
//                                 setNotification({
//                                         status:"success",
//                                         message: `User ${updatedUser.isActive ? "activated" : "blocked"} successfully`,
//                                 })
//                                 return true;
                        
// })
// }
//         const HandleBlockMany = async (UserIds: Id<"Users">[]) => {
//         if (UserIds.length === 0) {
//                 setNotification({
//                         status: "error",
//                         message: "No users selected for blocking",
//                 });
//                 return;
//         }
//         UserIds.forEach(async (UserId) => {
//                 await HandleBlockUser(UserId).then((res) => {
//                         if (!res) {
//                                 setNotification({
//                                         status: "error",
//                                         message: `Failed to update user with ID ${UserId}`,
//                                 });
//                                 return;
//                         }
//         })})
//         setNotification({
//                 status: "success",
//                 message: `Selected users ${UserIds.length > 1 ? "blocked" : "activated"} successfully`,
//         });


//         }

//         const allIds = users.map(user => user._id).filter((id): id is Id<"Users"> => id !== undefined);
//         const allSelected = allIds.every(id => checked.includes(id));
//         useEffect(()=>{
//                         if (allSelected) {
//                         setallchecked(true);
//                 }else{
//                         setallchecked(false);
//                 }
//         },[checked, allSelected]);

//         const HandleSelectAll = () => {
//                 if (!allSelected) {
//                         setchecked(allIds);
//                         setallchecked(true);
//                 } else if (allSelected) {
//                         setchecked([]);
//                 }

// }

//         const HandleDelete=(UserId:Id<"Users">)=>{
//                 console.log(UserId)
//                 // setproductId(UserId)
//                 // setisdelete(true)
//         }

//         const HandelDeleteAll=()=>{
//                 // console.log(checked)
//                 // setisdeleteall(true)
//         }



//         return (
//                 <>
//                 <div className="w-full  overflow-x-auto rounded-lg border px-2 ">
//                                 {/* Search and Filters */}
//                                 <Card className="mb-6 dark:bg-gray-600">
//                                   <CardContent className="p-6">
//                                     <div className="flex flex-col md:flex-row gap-4">
//                                       <div className="flex-1">
//                                         <Label htmlFor="search">Search Orders</Label>
//                                         <div className="relative mt-1">
//                                           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                                           <Input
//                                             id="search"
//                                             placeholder="Search by role, name, contact, or email..."
//                                             value={searchTerm}
//                                             onChange={(e) => setSearchTerm(e.target.value)}
//                                             className="pl-10"
//                                           />
//                                         </div>
//                                       </div>
//                                       <div className="md:w-48">
//                                         <Label htmlFor="status-filter">Filter by Status</Label>
//                                         <Select
//                                           value={statusFilter ? "true" : "false"}
//                                           onValueChange={(value) => setStatusFilter(value === "true")}
//                                         >
//                                           <SelectTrigger className="mt-1">
//                                             <SelectValue />
//                                           </SelectTrigger>
//                                           <SelectContent>
//                                             <SelectItem value="true">Active</SelectItem>
//                                             <SelectItem value="false">InActive</SelectItem>
//                                             {/* <SelectItem value="Active">Active</SelectItem>
//                                             <SelectItem value="blocked">blocked</SelectItem> */}
//                                           </SelectContent>
//                                         </Select>
//                                       </div>

//                                       <div className="md:w-48">
//                                         <Label htmlFor="status-filter">Filter by Role</Label>
//                                         <Select value={roleFilter} onValueChange={setRoleFilter}>
//                                           <SelectTrigger className="mt-1">
//                                             <SelectValue />
//                                           </SelectTrigger>
//                                           <SelectContent>
//                                             <SelectItem value="all">All</SelectItem>
//                                             <SelectItem value="admin">admin</SelectItem>
//                                             <SelectItem value="customer">customers</SelectItem>
//                                             {/* <SelectItem value="Active">Active</SelectItem>
//                                             <SelectItem value="blocked">blocked</SelectItem> */}
//                                           </SelectContent>
//                                         </Select>
//                                       </div>
//                                     </div>
//                                   </CardContent>
//                                 </Card>
//                         <div className="flex items-center justify-between p-4 bg-gray-100  dark:bg-gray-800 rounded-t-lg">
//                                 <div className="text-lg font-semibold">{status} Users</div>
                                
//                                 <Button 
//                                 className="bg-gray-500 hover:bg-gray-700 transition duration-500" 
//                                 onClick={() => HandleBlockMany(checked)}
//                                 disabled={checked.length === 0}>
//                                         Block / Activate Selected
//                                 </Button>
//                                 <Button 
//                                 className="bg-red-400 hover:bg-red-700 transition-transform duration-500" 
//                                 onClick={() => HandelDeleteAll()}
//                                 disabled={checked.length === 0}>
//                                         Delete Selected
//                                 </Button>
//                         </div>
//                 {finalUsers && finalUsers.length > 0 ?( 
//                         <Table className="min-w-[800px]">
                  
//                   <TableHeader>
//                     <TableRow className="bg-blue-100  rounded-t-3xl hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 transition duration-300" >
//                             <TableHead className="w-[50px]">
//                                 <Checkbox
//                                 onCheckedChange={HandleSelectAll}
//                                 checked={allchecked}
//                                 aria-label="Select all products"
//                                 className="border border-black"/>
//                                 </TableHead>
//                       <TableHead className="w-[100px] font-bold">User</TableHead>
//                       <TableHead className="text-center font-bold" >Email</TableHead>
//                       <TableHead className="text-center font-bold">Contact</TableHead>
//                       <TableHead className="text-center font-bold">Role</TableHead>
//                       <TableHead className="text-center font-bold">Status</TableHead>
//                       <TableHead className="text-center font-bold">Last Log In</TableHead>
//                       <TableHead className="text-right font-bold">Created At</TableHead>
//                       <TableHead className="text-center font-bold">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                 {users.map((user) => (
                                        
//                                       <TableRow key={user._id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300">
//                                         <TableCell className="font-medium">
//                                           <Checkbox
//                                             onCheckedChange={() => {
//                                               if (user._id !== undefined) {
//                                                 HandleCheckboxChange(user._id);
//                                               }
//                                             }}
//                                             checked={user._id !== undefined && checked.includes(user._id)}
//                                             aria-label="Select product"
//                                             className="border border-black"
//                                           />
//                                         </TableCell>
//                                         <TableCell className="font-medium">{user.username}</TableCell>
//                         <TableCell className="font-medium text-center">{user.email}</TableCell>
//                         <TableCell className="text-center" >{user.phoneNumber}</TableCell>
//                         <TableCell className="text-center">{user.role}</TableCell>
//                         <TableCell className="text-center">{user.isActive?"Active":"Inactive"}</TableCell>
//                         <TableCell className="text-center">{ formatDate(user.lastLogin||0)}</TableCell>
//                         <TableCell className="text-right">
//                           <time dateTime={user._creationTime !== undefined ? new Date(user._creationTime).toISOString() : ""}>
//                             {user._creationTime !== undefined ? new Date(user._creationTime).toLocaleDateString() : "N/A"}
//                           </time>
//                         </TableCell>
//                         <TableCell className=" justify-center  flex gap-1">
//                                 <Button 
//                                 className="bg-gray-500 hover:bg-gray-700 transition duration-500" 
//                                 onClick={() => MakeAdmin(user._id)}>
//                                         Make/Remove Admin
//                                 </Button>
//                         <Button
//                           className={`flex ${user.isActive?"bg-gray-500 hover:bg-gray-700":"bg-green-500 hover:bg-green-700"}   transition duration-500 `}
//                           onClick={() => {
//                             if (user._id !== undefined) {
//                               HandleBlockUser(user._id);
//                             }
//                           }}
//                         >
//                           {user.isActive?"Block":"Activate"}
//                         </Button>
//                         <Button
//                           className="flex bg-red-400  hover:bg-red-700 transition-transform duration-500 "
//                           onClick={() => {
//                             if (user._id !== undefined) {
//                               HandleDelete(user._id);
//                             }
//                           }}
//                         >
//                           Delete
//                         </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>):(
//                         <div>
//                                 <h1 className="text-2xl font-bold text-center mt-10">No {status} Users</h1>
//                                 <p className="text-center text-gray-500">No Users {status} .</p>
//                         </div>
//                 )}
//               </div>
//                 {/* 
//                 <DeleteModal isdelete={isdelete} onClose={() => setisdelete(false)} productId={productId} /> */}
//                         {/* <DeleteAllModal isdeleteall={isdeleteall} onClose={() => setisdeleteall(false)} productIds={checked} /> */}
//                 </>
              
//         )
//       }
//       export default CustomersTable;