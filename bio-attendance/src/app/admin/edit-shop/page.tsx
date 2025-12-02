"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {  Save, ImageIcon } from "lucide-react"
import useGetShopBySellerId from "@/hooks/useGetShopBySellerId"
import { useAppSelector } from "@/hooks"
import { Id } from "../../../../convex/_generated/dataModel"
import { ShopData } from "@/lib/types"
import Loader from "@/components/Loader/loader"
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useNotification } from "@/app/NotificationContext"
import useUpdateShop from "@/hooks/useUpdateShop"
// import ImageCropper from "@/components/ImageCropper/ImageCropper"



interface UploadshopData {
         _id: Id<"shops">;
         slogan?: string;
    profile_image?: string ;
    cover_image?: string;
    description?: string;
    shop_name?: string;
}

const ShopEditForm=()=> {
 
        const User = useAppSelector((state) => state.user.user);
        const { data: shop } = useGetShopBySellerId(User? User.User_id as Id<"customers">: "" as Id<"customers">);
         const [formData, setFormData] = useState<ShopData|null>(null)
         const [loading, setloading] = useState(true)
         const [profilepreview, setprofilepreview] = useState("")
         const [profileUpload, setprofileUpload] = useState<File|null>(null)
         const [coverpreview, setcoverpreview] = useState("")
         const [coverUpload, setcoverUpload] = useState<File|null>(null)
         const [uploading, setUploading] = useState(false)
         const { setNotification } = useNotification();
        const { updateShop } = useUpdateShop();

          const generateUploadUrl = useMutation(api.products.generateUploadUrl);
          
  const handleChange = (field: keyof ShopData, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated as ShopData)
  }

  useEffect(()=>{
        if(shop?.shop){
                setFormData(shop.shop)
                setloading(false)
                return
        }
  }, [shop?.shop])


  const ImageSelect = ( type: "profile" | "cover") => {
        const fileInput = document.createElement("input")
        fileInput.type = "file"
        fileInput.accept = "image/*"
        fileInput.onchange = () => {
          const file = fileInput.files ? fileInput.files[0] : null
                if (!file) {
                        setNotification({
                                status: 'info',
                                message: 'No file selected.',
                        })
                }

                if (file && file.size <= 3 * 1024 * 1024) {
                        if(type==="profile"){
                                setprofilepreview(URL.createObjectURL(file))
                                setprofileUpload(file)
                                return
                        }
                        if(type==="cover"){
                                setcoverpreview(URL.createObjectURL(file))
                                setcoverUpload(file)
                                return
                        }
                }
                else {
                        setNotification({
                                status: 'error',
                                message: `File ${file?.name} size exceeds 3MB limit.`,
                        })
                }
        }
          fileInput.click();
} 
const handleUpload = async (file:File|null) => {
        if(!file) {
                setNotification({
                        status: 'info',
                        message: 'No file selected for upload.',
                })
                return
         };
          const uploadUrl = await generateUploadUrl();
                        const res = await fetch(uploadUrl,
                        {
                                method:"post",
                                headers:{"Content-Type": file.type },
                                body: file
                        }
                )
                if(!res.ok){
                        throw new Error("Upload failed, Are you connected to the internet?");
                }
                const { storageId } = await res.json();
                        return storageId;

}


  const handleSave = async () => {
        if(!formData){
                setNotification({
                        status: 'info',
                        message: 'Form data is incomplete.',
                })
        }
        setUploading(true);
        try{
                // if(profileUpload){
                //         const profile_image = await handleUpload(profileUpload);
                //         console.log(profile_image);
                //         if(profile_image && profile_image.length>0){
                //                   handleChange("profile_image", profile_image);
                //         }
                      
                // }

                // if(coverUpload){
                //         const cover_image = await handleUpload(coverUpload);
                //         if(cover_image && cover_image.length>0){
                //                   handleChange("cover_image", cover_image);
                //         }
                // }
                // console.log("form data: ",formData);
                const updatedShopData: UploadshopData = {
                        ...(formData as UploadshopData),
                        profile_image: profileUpload ? await handleUpload(profileUpload) : formData?.profile_image,
                        cover_image: coverUpload ? await handleUpload(coverUpload) : formData?.cover_image,
                };
                await updateShop(updatedShopData).then((res)=>{
                        if(!res.success){
                                 setNotification({
                                        status: 'error',
                                        message: res.message,
                                })
                                setUploading(false);
                                return
                        }
                setNotification({
                        status: 'success',
                        message: res.message,
                })
                setFormData(null)
                })
                
        }catch(e){
                setNotification({
                        status: 'error',
                        message: (e instanceof Error ? e.message : String(e)) || 'An error occurred during upload.',
                })
                setUploading(false);
                return
        }finally{
                setUploading(false);
        }
        
  }
  if(loading){
    return <div className="justify-center h-screen mx-auto items-center " ><Loader/></div>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 mt-28 p-4">
      {/* Branding Section */}
      <Card className="dark:bg-gray-900" >
        <CardHeader>
          <CardTitle>Shop Branding</CardTitle>
          <CardDescription>Customize your shop&apos;s visual identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field>
            <FieldLabel>Shop Name</FieldLabel>
            <FieldContent>
              <Input
                value={formData?.shop_name}
                onChange={(e) => handleChange("shop_name", e.target.value)}
                placeholder="Enter your shop name"
              />
              <FieldDescription>This will be displayed as your shop&apos;s main title</FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Tagline</FieldLabel>
            <FieldContent>
              <Input
                value={formData?.slogan}
                onChange={(e) => handleChange("slogan", e.target.value)}
                placeholder="A short description of your shop"
              />
              <FieldDescription>A catchy phrase that describes your shop</FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Shop Description</FieldLabel>
            <FieldContent>
              <Textarea
                value={formData?.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Tell customers about your shop..."
                rows={4}
              />
              <FieldDescription>Detailed information about your shop and products</FieldDescription>
            </FieldContent>
          </Field>

          {/* <Field>
            <FieldLabel>Category</FieldLabel>
            <FieldContent>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Fashion">Fashion</SelectItem>
                  <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Books">Books</SelectItem>
                  <SelectItem value="Toys">Toys</SelectItem>
                  <SelectItem value="Beauty">Beauty</SelectItem>
                  <SelectItem value="Automotive">Automotive</SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>Primary category for your shop</FieldDescription>
            </FieldContent>
          </Field> */}
        </CardContent>
      </Card>

      {/* Images Section */}
      <Card className="dark:bg-gray-900" >
        <CardHeader>
          <CardTitle>Shop Images</CardTitle>
          <CardDescription>Upload your logo and banner image</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field>
            <FieldLabel>Shop Logo</FieldLabel>
            <FieldContent>
              <div className="flex items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-gray-600 border-dashed bg-muted hover:cursor-pointer "
                onClick={() => ImageSelect("profile")}
                >
                  {profilepreview ? (
                    <img
                      src={profilepreview || "/placeholder.svg"}
                      alt="Logo"
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) :formData?.profile_image? (
                         <img
                      src={formData?.profile_image || "/placeholder.svg"}
                      alt="Logo"
                      className="h-full w-full rounded-lg object-cover"
                    />
                    
                  ):(
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

              </div>
              <FieldDescription>Recommended size: 200x200px, PNG or JPG</FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Shop Banner</FieldLabel>
            <FieldContent>
              <div className="space-y-4 mt-2">
                <div className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-gray-600 border-dashed bg-muted hover:cursor-pointer "
                onClick={() => ImageSelect("cover")}
                >
                  {coverpreview && coverpreview.length >0 ? (
                    <img
                      src={coverpreview || "/placeholder.svg"}
                      width={1024}
                      height={300}
                      alt="Banner"
                      className="h-full w-full rounded-lg object-cover"
                    />
                    
                  ) : formData?.cover_image?(
                     <img
                      src={formData?.cover_image || "/placeholder.svg"}
                      width={1024}
                      height={200}
                      alt="Banner"
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ):(
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                  
                </div>

              </div>
              <FieldDescription>Recommended size: 1200x300px, PNG or JPG</FieldDescription>
            </FieldContent>
          </Field>
        </CardContent>
      </Card>


      {/* Save Button - Full Width */}
      <div className="lg:col-span-2 ">
        <Card className="dark:bg-gray-900" >
          <CardContent className="flex flex-col md:flex-row items-center justify-between py-2 px-12">
            <div>
              <h3 className="font-semibold mb-1">Ready to save your changes?</h3>
              <p className="text-sm text-muted-foreground">Your shop details will be updated immediately</p>
            </div>
            <Button size="lg" onClick={handleSave} className="bg-gold hover:bg-gold/80" 
            disabled={shop?.shop?.shop_name===formData?.shop_name
                 && profilepreview.length===0
                 && coverpreview.length===0
             && shop?.shop?.description===formData?.description
              &&shop?.shop?.slogan===formData?.slogan||uploading} >
              <Save className="mr-2 h-5 w-5" />
              {uploading? "Saving Changes...":"Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export default  ShopEditForm;
