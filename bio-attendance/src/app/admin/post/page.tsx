"use client"
// import { useUser } from '@clerk/nextjs';
import React, { ChangeEvent, useRef, useState } from 'react'
import { api } from '../../../../convex/_generated/api';
import { useMutation } from 'convex/react';
import { useSendMail } from '@/hooks/useSendMail';
import useGetCategories from '@/hooks/useGetCategories';
import { useAppSelector } from '@/hooks';
import useCreateProduct from '@/hooks/useCreateProduct';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/adminComponents/ui/card';
import { Label } from '@/adminComponents/ui/label';
import { Input } from '@/adminComponents/ui/input';
import { Textarea } from '@/adminComponents/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/adminComponents/ui/select';
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, Package, X} from 'lucide-react';
import { Button } from '@/adminComponents/ui/button';
import { cn } from '@/lib/utils';
import { ProductCreationEmail } from '@/EmailTemplates/ProductCreation';

  interface Product {
                approved: boolean,
                product_cartegory: string,
                product_condition: "new" | "used" | "refurbished",
                product_description: string,
                product_image: string[],
                product_name: string,
                product_owner_id: string,
                product_price: string,
                product_embeddings:number[],
                product_discount?:number,
                product_image_embeddings:number[]
                }

const AddProduct =  () => {
        
      const generateUploadUrl = useMutation(api.products.generateUploadUrl);
      const [selectedImage, setSelectedImage] = useState<File[] | []>([]);
      const fileInputRef = useRef<HTMLInputElement>(null);
      const { sendEmail, } = useSendMail();
      const { data: categories } = useGetCategories(); 
      const[successProduct,setsuccessProduct] = useState("")
      const [ErrorProduct,setErrorProduct] = useState("")
      const [imagePreview, setImagePreview] = useState<string[]>([])
      const admin = process.env.NEXT_PUBLIC_ADMIN
      const {CreateProduct} = useCreateProduct()
      const [isSubmitting, setIsSubmitting] = useState(false);
      const user = useAppSelector((state)=>state.user.user)
      const userid = user?.User_id || ''
        const [isDragging, setIsDragging] = useState(false)

        const [product, setProduct] = useState<Product>({
                approved: false,
                product_cartegory: "",
                product_condition: "new",
                product_description: "",
                product_image: [],
                product_name: "",
                product_owner_id: "",
                product_price: "",
                product_discount: 0,
                product_embeddings:[],
                product_image_embeddings:[]
        });
          const preventInvalidKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault()
    }
  }

    const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0 && fileInputRef.current) {
      const dataTransfer = new DataTransfer()
      Array.from(files).forEach((file) => dataTransfer.items.add(file))
      fileInputRef.current.files = dataTransfer.files
      const event = { target: fileInputRef.current } as ChangeEvent<HTMLInputElement>
      handleImageChange(event)
    }
  }

        const cleanImageField=()=>{
                        setSelectedImage([]);
                        setImagePreview([])
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                }
        const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files) {
                      const filesArray = Array.from(e.target.files)
                      const maxFileSize = 3 * 1024 * 1024; // 1MB in bytes
                      const validFiles: File[] = [];
                      for (const file of filesArray) {

                        if (!file.type.startsWith("image/")) {
                                alert(`"${file.name}" is not a valid image file.`);
                                cleanImageField();
                                return; 
                              }

                              if (file.size > maxFileSize) {
                                alert(`"${file.name}" is too large. Maximum allowed size is 3MB.`);
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
              
                    setSelectedImage(validFiles)
                    // Create preview URLs for the selected images
                    const previewUrls = validFiles.map((file) => URL.createObjectURL(file))
                    setImagePreview(previewUrls)
                  }
                }
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
                  const { name, value } = e.target;
                  setProduct((prev) => ({...prev,[name]: value,
                  }));
                };

        const cleanForm = () => {
                setProduct({
                        approved: false,
                        product_cartegory: "",
                        product_condition: "new",
                        product_description: "",
                        product_image: [],
                        product_name: "",
                        product_owner_id: "",
                        product_price: "",
                        product_discount: 0,
                        product_embeddings:[],
                        product_image_embeddings:[]
                });
                setSelectedImage([]);
                if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                        }
        };

        const RemoveImage = (index: number) => {
                const updatedSelectedImages = [...(selectedImage || [])];
                const updatedPreviews = [...imagePreview];
                updatedSelectedImages.splice(index, 1);
                updatedPreviews.splice(index, 1);
                setSelectedImage(updatedSelectedImages);
                setImagePreview(updatedPreviews);
        }

        const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  setErrorProduct("");
                  setsuccessProduct("");
                  const TIMEOUT_MS = 20000; 

                const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
                        return Promise.race([
                          promise,
                          new Promise<T>((_, reject) =>
                            setTimeout(() => reject(new Error("Request timed out")), ms)
                          
                          ),
                        ]);
                      };

                  try {
                        await withTimeout((async () => {
                         // Step 1: Get a short-lived upload URL
                        const postUrl = await generateUploadUrl();
                        const responses = await Promise.all(
                                Array.from(selectedImage || []).map(async (image: File) => {
                                  const result = await fetch(postUrl, {
                                    method: "POST",
                                    headers: { "Content-Type": image.type },
                                    body: image,
                                  });
                            
                                  if (!result.ok) throw new Error("Failed to upload image");
                                  return result.json(); 
                                })
                        );
                        const storageIds = responses.map((res) => res.storageId);
                        const updatedproduct = {
                                ...product,
                                product_image: [...storageIds], // Ensure new IDs are included
                                product_name: product.product_name,
                                product_description: product.product_description,
                                product_owner_id: userid,
                                product_cartegory: product.product_cartegory,
                                approved: false,
                        };
                            
                        // console.log("Updated Product: ", updatedproduct);
                        const create =  await CreateProduct( updatedproduct);
                        const res = await create.json()
                        if(!res.success){
                                setErrorProduct(res.message)
                                return
                        }
                        setsuccessProduct(res.message)
                      cleanForm()
                      cleanImageField()
                      setImagePreview([])
                      sendEmail( `${admin}` ,"New Product Created", `User ${user?.Username}, Added a product`,"sales");
                      sendEmail( `${user?.email}`,"New Product Created", ProductCreationEmail(user?.Username||"",updatedproduct),"sales");
                })(), TIMEOUT_MS);
                  } catch  {
                        setErrorProduct("Error creating product")
                    setTimeout(()=>{
                        setErrorProduct("")
                    },4000)
                  } finally {
                    setIsSubmitting(false);
                     setTimeout(()=>{
                        setErrorProduct("")
                        setsuccessProduct("")
                    },4000)
                    return;
                  }
                };

  return (
   <div className="min-h-screen mt-[15%] md:mt-[5%] bg-gold/5 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Success Alert */}
        {successProduct && successProduct.length > 0 && (
          <div className="mb-6 flex absolute right-20 items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/50">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Success! Your product is pending approval.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {ErrorProduct && ErrorProduct.length > 0 && (
          <div className="mb-6 flex absolute right-20 items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm font-medium text-destructive">
              Error creating product. Please try again later or contact support.
            </p>
          </div>
        )}

        <Card className="border-border/50 shadow-xl shadow-black/5">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold tracking-tight">Add <span className='text-gold' >Product</span> </CardTitle>
                <CardDescription>Fill in the details to list your product</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 px-3">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="product_name" className="text-sm font-medium">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  id="product_name"
                  name="product_name"
                  value={product.product_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                  className="h-11"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="product_description" className="text-sm font-medium">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="product_description"
                  name="product_description"
                  value={product.product_description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your product in detail..."
                  className="min-h-[120px] resize-none"
                />
              </div>

              {/* Category, Condition, Discount Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="product_cartegory" className="text-sm font-medium">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select   required>
                      <SelectTrigger className="h-11 overflow-auto">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-96 overflow-y-auto">
                        {categories?.map((category, index) => (
                          <SelectItem key={index} value={category.cartegory}>
                            {category.cartegory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <Label htmlFor="product_condition" className="text-sm font-medium">
                    Condition <span className="text-destructive">*</span>
                  </Label>
                  <Select required>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                        <SelectItem value="refurbished">Refurbished</SelectItem>
                      </SelectContent>
                    </Select>
                </div>

                {/* Discount */}
                <div className="space-y-2">
                  <Label htmlFor="product_discount" className="text-sm font-medium">
                    Discount %
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      id="product_discount"
                      name="product_discount"
                      value={product.product_discount}
                      onChange={handleChange}
                      onKeyDown={preventInvalidKeys}
                      placeholder="0"
                      className="h-11 pr-8"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="product_price" className="text-sm font-medium">
                  Price <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    id="product_price"
                    name="product_price"
                    value={product.product_price}
                    onChange={handleChange}
                    onKeyDown={preventInvalidKeys}
                    required
                    placeholder="0.00"
                    className="h-11 pl-7"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Product Images <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">Upload up to 5 images. First image will be the cover.</p>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                  )}
                >
                  <input
                    type="file"
                    id="imageUrl"
                    name="imageUrl"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    required={imagePreview.length === 0}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Drop images here or click to upload</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 3 MB each</p>
                    </div>
                  </div>
                </div>

                {/* Image Previews */}
                {imagePreview.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {selectedImage?.length || imagePreview.length}
                        </span>{" "}
                        of 5 images selected
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {imagePreview.map((src, index) => (
                        <div key={index} className="group relative overflow-hidden rounded-lg border bg-muted">
                          <Image
                            src={src || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            width={100}
                            height={100}
                            className="h-20 w-20 object-cover transition-transform group-hover:scale-105"
                          />
                          {index === 0 && (
                            <span className="absolute bottom-0 left-0 right-0 bg-primary/90 px-1 py-0.5 text-center text-[10px] font-medium text-primary-foreground">
                              Cover
                            </span>
                          )}
                         
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                RemoveImage(index)
                              }}
                              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur-sm transition-opacity hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={isSubmitting ||
                !product.product_name || 
                !product.product_cartegory||
                !product.product_description||
                !product.product_price||
                !product.product_condition||
                imagePreview.length === 0
                } className="h-12 bg-blue-700 hover:bg-blue-900 w-full text-base font-medium" size="lg">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Product...
                  </>
                ) : (
                  "Post Product"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By posting, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default AddProduct