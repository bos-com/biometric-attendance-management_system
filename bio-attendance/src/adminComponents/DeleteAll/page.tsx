"use client"
import type React from "react"
import { useSendMail } from "@/hooks/useSendMail"
import useDeleteProduct from "@/hooks/useDeleteProduct"
import useGetProductsByIds from "@/hooks/useGetProductsByIds"
import { useAppSelector } from "@/hooks"
import { Id } from "../../../convex/_generated/dataModel"


interface DeleteModalProps {
        isdeleteall: boolean
  onClose: () => void
  productIds: string[]
}

const DeleteAllModal: React.FC<DeleteModalProps> = ({ isdeleteall, onClose, productIds }) => {
  const { sendEmail } = useSendMail()
  const user  = useAppSelector((state)=>state.user.user) 
  const admin = process.env.NEXT_PUBLIC_ADMIN
  const Delete = useDeleteProduct()
  const { data: Products } = useGetProductsByIds(productIds as  Id<"products">[])

        const productNames = Products?.map(product => product?.product_name).join(" , ") || "Products"
          const HandleDeleteAll=(checked:string[])=>{
                try{
                checked.forEach(element => {
                        Delete(element)
                });
                onClose()
                 if (admin) {
        sendEmail(admin, "Product Deletion", `User ${user?.Username}, Deleted product ${productNames}`,"management")
      }

                if (user?.email) {
                        sendEmail(
                        user?.email,
                        "Product Deletion",
                        `Hello ${user.Username}, Your products ${productNames} was Deleted \nyou can always add more products   \n Thank you for Doing Business with Us... \n Regards \n ShopCheap \n https://shopcheapug.com/ .`,
                        "management"
                        )
                }
                }catch (error) {
                alert(error)
                return
        }}


  if (!isdeleteall) return null

  return (
    <div className="fade-in fixed z-40 inset-0 backdrop-blur-sm shadow-lg shadow-black rounded-lg flex  w-[100%] h-[100%]   overflow-auto overflow-x-hidden">
      <div className="  md:w-[60%] h-64 shadow-md shadow-black items-center justify-center my-auto mx-auto bg-gray-200 dark:bg-gray-600 rounded-lg">
        <h1 className="text-2xl font-bold text-center text-black">Delete Products  -<span className="text-gold" >&apos;{productNames}&apos;</span></h1>
        <div className="flex space-x-3 justify-center mt-10  py-10">
            <button
              type="submit"
              onClick={()=>{HandleDeleteAll(productIds)}}
              className=" w-48 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Delete Selected
            </button>
            <button
              type="button"
              className="w-48 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-400 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
      </div>
    </div>
  )
}

export default DeleteAllModal
