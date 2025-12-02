"use client"
import type React from "react"
import { useSendMail } from "@/hooks/useSendMail"
// import { useUser } from "@clerk/nextjs"
import useGetProductById from "@/hooks/useGetProductById"
import useDeleteProduct from "@/hooks/useDeleteProduct"
import { useAppSelector } from "@/hooks"


interface DeleteModalProps {
        isdelete: boolean
  onClose: () => void
  productId: string
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isdelete, onClose, productId }) => {
  const { sendEmail } = useSendMail()
  const {data:Product} = useGetProductById(productId)
  const user  = useAppSelector((state)=>state.user.user) 
  const admin = process.env.NEXT_PUBLIC_ADMIN
  const Delete = useDeleteProduct()


  const HandleDelete=async (id:string|undefined)=>{
        try{
        await Delete(id)
        onClose()
        //       Send notification emails
        }catch (error) {
                alert(error)
                return
        }
      if (admin) {
        sendEmail(admin, "Product Deletion", `User ${user?.Username}, Deleted product ${Product?.product_name}`,"sales")
      }

      if (user?.email) {
        sendEmail(
          user?.email,
          "Product Deletion",
          `Hello ${user.Username}, Your product ${Product?.product_name} was Deleted \nyou can always add more products   \n Thank you for Doing Business with Us... \n Regards \n ShopCheap \n https://shopcheapug.com/ .`,
        "sales")
      }

  }




  if (!isdelete) return null

  return (
    <div className="fade-in fixed z-40 inset-0 backdrop-blur-sm shadow-lg shadow-black rounded-lg flex  w-[100%] h-[100%]   overflow-auto overflow-x-hidden">
      <div className="  md:w-[60%] h-64 shadow-md shadow-black items-center justify-center my-auto mx-auto bg-gray-200 dark:bg-gray-600 rounded-lg">
        <h1 className="text-2xl font-bold text-center text-black">Delete Product  -<span className="text-gold" >&apos;{Product?.product_name}&apos;</span></h1>
        <div className="flex space-x-3 justify-center mt-10  py-10">
            <button
              type="submit"
              onClick={()=>{HandleDelete(Product?._id)}}
              className=" w-48 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Delete
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

export default DeleteModal
