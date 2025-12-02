"use client"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import useGetCategories from "@/hooks/useGetCategories"
import { api } from "../../../convex/_generated/api"
import { useMutation } from "convex/react"
import { useSendMail } from "@/hooks/useSendMail"
// import { useUser } from "@clerk/nextjs"
import useGetProductById from "@/hooks/useGetProductById"
import type { Id } from "../../../convex/_generated/dataModel"
import { useAppSelector } from "@/hooks"
import Image from "next/image"
interface Product {
  _id: string
  product_cartegory?: string
  product_condition?: "new" | "used" | "refurbished"
  product_description?: string
  product_image?: string[]
  product_name?: string
  product_price?: string
  product_discount?: number
  approved: boolean
}

interface EditModalProps {
  isvisible: boolean
  onClose: () => void
  productId: string
}

const EditModal: React.FC<EditModalProps> = ({ isvisible, onClose, productId }) => {
  const { data: categories } = useGetCategories()
  const generateUploadUrl = useMutation(api.products.generateUploadUrl)
  const UpdateProduct = useMutation(api.products.UpdateProduct)
  const { sendEmail } = useSendMail()
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
//   const { user } = useUser()
  const admin = process.env.NEXT_PUBLIC_ADMIN
  const { data: Initialproduct } = useGetProductById(productId)
  const [product, setProduct] = useState<Product | null>(null)
  const [imagePreview, setImagePreview] = useState<string[]>([])
  const user = useAppSelector((state)=>state.user.user)
  useEffect(() => {
    if (Initialproduct) {
      setProduct({
        _id: Initialproduct._id,
        product_cartegory: Initialproduct.product_cartegory,
        product_condition: Initialproduct.product_condition,
        product_description: Initialproduct.product_description,
        product_image: Initialproduct.product_image || [],
        product_name: Initialproduct.product_name,
        product_price: Initialproduct.product_price,
        approved: Initialproduct.approved,
      })
    }
  }, [Initialproduct])
  const cleanImageField=()=>{
        setSelectedImages([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
}
const handleclose =()=>{
        cleanImageField()
        onClose()
        setImagePreview([])
}
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProduct((prev) => {
      if (!prev) return prev // Ensure prev is not null
      return {
        ...prev,
        [name]: value,
      }
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const filesArray = Array.from(e.target.files)
        const maxFileSize = 1 * 1024 * 1024; // 1MB in bytes
        const validFiles: File[] = [];
        for (const file of filesArray) {
                if (file.size > maxFileSize) {
                  alert(`"${file.name}" is too large. Maximum allowed size is 1MB.`);
                  cleanImageField()
                } else {
                  validFiles.push(file);
                }
              }
     
      // Check if adding these files would exceed the 5 image limit
      if (validFiles.length > 5) {
        alert("You can only upload up to 5 images")
        cleanImageField()
        return
      }

      setSelectedImages(validFiles)

      // Create preview URLs for the selected images
      const previewUrls = validFiles.map((file) => URL.createObjectURL(file))
      setImagePreview(previewUrls)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const cleanForm = () => {
      setProduct({
        _id: product?._id || "",
        product_cartegory: "",
        product_condition: "new",
        product_description: "",
        product_image: [],
        product_name: "",
        product_price: "",
        approved: false,
      })
      setSelectedImages([])
      setImagePreview([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }

    try {
      if (selectedImages.length > 5) {
        alert("Error, You can only upload up to Five Images")
        return
      }

      let storageIds: string[] = []

      // Only upload images if there are any selected
      if (selectedImages.length > 0) {
        // console.log("Images to upload: ", selectedImages)
        // Step 1: Get a short-lived upload URL for each image
        const uploadPromises = selectedImages.map(async (image) => {
          const postUrl = await generateUploadUrl()
          const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": image.type },
            body: image,
          })

          if (!result.ok) throw new Error("Failed to upload image")
          return result.json()
        })

        const responses = await Promise.all(uploadPromises)
        storageIds = responses.map((res) => res.storageId)
      }

      const updatedProduct = {
        ...product,
        _id: product?._id as Id<"products">,
        product_price: product?.product_price || "",
        // If we have new images, use those, otherwise keep the existing ones
        product_image: storageIds.length > 0 ? storageIds :[],
        product_name: product?.product_name || "",
        product_condition: product?.product_condition || "new",
        product_description: product?.product_description || "",
        product_cartegory: product?.product_cartegory || "",
        approved: false,
      }

      await UpdateProduct({ _id: product?._id as Id<"products">, product: updatedProduct })
      alert("Product updated successfully!")
      cleanForm()

      // Send notification emails
      if (admin) {
        sendEmail(admin, "Product Updated", `User ${user?.Username}, updated  product ${product?._id} ${product?.product_name}`,"sales")
      }

      if (user?.email) {
        
        const html = `
         <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Password Reset</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    .button {
      display: inline-block;
      padding: 14px 28px;
      font-size: 16px;
      color: #fff;
      background-color: #007bff;
      border-radius: 5px;
      text-decoration: none;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #0056b3;
    }
    .container {
      max-width: 480px;
      margin: auto;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      padding: 32px;
      font-family: Arial, sans-serif;
      color: black;
    }
    .footer {
      font-size: 12px;
      color: #999;
      margin-top: 32px;
      text-align: center;
    }
  </style>
</head>
<body style="background:#f4f4f4;">

  <div class="container">
<a href="https://shopcheapug.com/" > 
<div 
  style="
    background-image: url('https://cheery-cod-687.convex.cloud/api/storage/143325e4-3c05-4b88-82ba-cbbfa7fcd594');
    background-size: contain;  
    background-repeat: no-repeat;
    background-position: center; 
    width: 200px;
    height: 100px;
  "
>
  
</div></a>
    <h2><strong>Product Updated"</strong></h2>
    <h1 class="" style="color:black" >Hello, <span style="color:blue"> ${user?.Username} </span></h1>
    <h3> Your product was updated successfully and is pending approval.\n

You will be notified once your product is approved.

Best regards,\n
ShopCheap\n
https://shopcheapug.com/</h3>
    <div class="footer">
      &copy; 2025 ShopCheap. All rights reserved.
    </div>
  </div>
</body>
</html>
        `
        sendEmail(
          user?.email,
          "Product Updated",
          html,
                "sales"
        )
      }

      onClose()
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Failed to update product. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isvisible) return null

  return (
    <div className="fade-in fixed z-40 inset-0 backdrop-blur-sm shadow-lg shadow-black rounded-lg flex  w-[100%] h-[100%]   overflow-auto overflow-x-hidden">
      <div className="my-auto mt-[30%] md:mt-[8%] md:w-[60%] shadow-md shadow-black items-center justify-center mx-auto bg-gray-200 dark:bg-dark rounded-lg">
      <div >
        <h1 className="text-2xl font-bold text-center text-black dark:text-white ">Update Product</h1>
        <h1 className="text-sm font-bold text-center text-black dark:text-white ">Note: While Updating your Product, you must add the images again</h1>
      </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-3">
          <div>
            <label htmlFor="product_name" className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              id="product_name"
              name="product_name"
              value={product?.product_name || ""}
              onChange={handleChange}
              required
              className="bg-transparent rounded-lg relative block w-full px-3 py-1 border border-double border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-4 focus:border-gray-500 focus:z-10 sm:text-sm dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="product_description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="product_description"
              name="product_description"
              value={product?.product_description || ""}
              onChange={handleChange}
              required
              className="bg-transparent rounded-lg relative block w-full px-3 py-1 border border-double border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-4 focus:border-gray-500 focus:z-10 sm:text-sm dark:text-white"
            ></textarea>
          </div>

          <div className="flex flex-col md:flex-row md:gap-12">
            <div className="w-full md:w-1/2">
              <label htmlFor="product_cartegory" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="product_cartegory"
                name="product_cartegory"
                value={product?.product_cartegory || ""}
                onChange={handleChange}
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 
                border border-double border-gray-300 placeholder-gray-500 
                text-gray-900 focus:outline-none focus:border-4 focus:border-gray-500 focus:z-10 sm:text-sm"
              >
                <option value="">Select category</option>
                {categories?.map((category, index) => (
                  <option key={index} value={category.cartegory}>
                    {category.cartegory}
                  </option>
                ))}
              </select>
            </div>

            <div>
        <label htmlFor="condition" className="flex text-sm font-medium text-gray-700 dark:text-white">
          Condition
        </label>
        <select 
        id="product_condition"
          name="product_condition"
          onChange={handleChange}
          required 
           className="appearance-none rounded-lg relative block w-full px-3 py-2 
                border border-double border-gray-300 placeholder-gray-500 
                text-gray-900 focus:outline-none focus:border-4 focus:border-gray-500 focus:z-10 sm:text-sm"
          >
                 <option value=""  >Select category</option>
                        <option className="dark:bg-dark dark:text-white" value="new"  >New</option>
                        <option className="dark:bg-dark dark:text-white" value="used"  >Used</option>
                        <option className="dark:bg-dark dark:text-white" value="refurbished"  >Refurbished</option>
                
        </select>
      </div>

      <div>
        <label htmlFor="product_discount" className="flex text-sm font-medium text-gray-700 dark:text-white">
          Discount (Optional)
        </label>
               <input
          type="number"
          id="product_discount"
          name="product_discount"
          value={product?.product_discount }
          onChange={handleChange}
          onKeyDown={(e) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  }}
          required
           className="bg-transparent rounded-lg relative block w-full px-3 py-2 border border-double border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:border-4  focus:border-gray-500 focus:z-10 sm:text-sm dark:text-white "
        />
      </div>
          </div>

          <div>
            <label htmlFor="product_price" className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              id="product_price"
              name="product_price"
              value={product?.product_price || ""}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault()
                }
              }}
              required
              className="bg-transparent  rounded-lg relative block w-full px-3 py-2 border border-double border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-4 focus:border-gray-500 focus:z-10 sm:text-sm dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
              Attach Images (Up to 5 images)
            </label>
            <input
              type="file"
              id="imageUrl"
              name="imageUrl"
              ref={fileInputRef}
              multiple
              required
              accept="image/*"
              onChange={handleImageChange}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />

            {/* Image preview section */}
            { imagePreview.length > 0 && (
              <div className="">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Images: {selectedImages.length} of 5 images selected</p>  
                <div className="flex flex-wrap gap-2">
                  {imagePreview.map((src, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={src || "/placeholder.svg"}
                        width={100}
                        height={100}
                        alt={`Preview ${index + 1}`}
                        className="h-20 w-20 object-cover rounded-md border border-gray-300"
                      />
                      {/* <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button> */}
                    </div>
                  ))}
                </div>
              
              </div>
            )}
              { imagePreview.length == 0 && product && product.product_image?product.product_image.length > 0 && (
              <div className="">
                <p className="text-sm font-medium text-gray-700 mb-2">Current Images: {product.product_image.length} </p>  
                <div className="flex flex-wrap gap-2">
                  {product.product_image.map((src:string,) => (
                    <div key={src} className="relative">
                      <Image
                        src={src || "/placeholder.svg"}
                        width={80}
                        height={80}
                        alt={`Preview `}
                        className="h-20 w-20 object-cover rounded-md border border-gray-300"
                      />
                     
                    </div>
                  ))}
                </div>
              
              </div>
            ):("")}
          </div>

          <div className="flex justify-between space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update"}
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-400 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleclose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditModal
