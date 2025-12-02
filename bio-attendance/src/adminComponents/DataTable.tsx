import {
        Table,
        TableBody,
        TableCell,
        TableHead,
        TableHeader,
        TableRow,
      } from "@/components/ui/table"
      import { Checkbox } from "./ui/checkbox";
      import Image from "next/image";
import { Button } from "./ui/button";
import EditModal from "./EditModal/page";
import DeleteModal from "./DeleteModal/page";
import { useEffect, useState } from "react";
import DeleteAllModal from "./DeleteAll/page";
import { Product } from "@/lib/types";
import { Id } from "../../convex/_generated/dataModel";

interface DataTable {
  products: Product[];
  status?: string; 
}
const PendingDataTable: React.FC<DataTable> = ({ products, status }) => {

        const [isvisible, setisvisible] = useState(false);
        const [isdelete, setisdelete] = useState(false);
        const [isdeleteall, setisdeleteall] = useState(false);
        const [productId, setproductId] = useState<Id<"products">>("" as Id<"products">);
        const [checked, setchecked] = useState<Id<"products">[]>([]);
        const [allchecked, setallchecked] = useState(false);
        // const newProducts = products.filter(product => !product.approved);

        const HandleCheckboxChange=(ProductId:Id<"products">)=>{
                if(!checked.includes(ProductId)){
                        setchecked([...checked,ProductId])
                }else{
                        setchecked(checked.filter(id=>id!==ProductId))
                }
        }

        const allIds = products.map(product => product._id).filter((id): id is Id<"products"> => id !== undefined);
        const allSelected = allIds.every(id => checked.includes(id));
        useEffect(()=>{
                        if (allSelected) {
                        setallchecked(true);
                }else{
                        setallchecked(false);
                }
        },[checked, allSelected]);

        const HandleSelectAll = () => {
                if (!allSelected) {
                        setchecked(allIds);
                        setallchecked(true);
                } else if (allSelected) {
                        setchecked([]);
                }

}
        const HandleEdit=(ProductId:Id<"products">)=>{
                setproductId(ProductId)
                setisvisible(true)
        }
        const HandleDelete=(ProductId:Id<"products">)=>{
                setproductId(ProductId)
                setisdelete(true)
        }

        const HandelDeleteAll=()=>{
                // console.log(checked)
                setisdeleteall(true)
        }



        return (
                <>
                <div className="w-full  overflow-x-auto rounded-lg border px-2 ">
                        <div className="flex items-center justify-between p-4 bg-gray-100  dark:bg-gray-800 rounded-t-lg">
                                <div className="text-lg font-semibold">{status} Products</div>
                                
                                <Button 
                                className="bg-red-400 hover:bg-red-700 transition-transform duration-500" 
                                onClick={() => HandelDeleteAll()}
                                disabled={checked.length === 0}>
                                        Delete Selected
                                </Button>
                        </div>
                {products && products.length > 0 ?( 
                        <Table className="min-w-[800px]">
                  
                  <TableHeader>
                    <TableRow>
                            <TableHead className="w-[50px]"><Checkbox
                                onCheckedChange={HandleSelectAll}
                                checked={allchecked}
                                aria-label="Select all products"
                            /></TableHead>
                      <TableHead className="w-[100px]">Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Image</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Date Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                {products.map((product) => (
                                        
                                      <TableRow key={product._id}>
                                        <TableCell className="font-medium">
                                          <Checkbox
                                            onCheckedChange={() => {
                                              if (product._id !== undefined) {
                                                HandleCheckboxChange(product._id);
                                              }
                                            }}
                                            checked={product._id !== undefined && checked.includes(product._id)}
                                            aria-label="Select product"
                                          />
                                        </TableCell>
                                        <TableCell className="font-medium">{product.product_name}</TableCell>
                        <TableCell className="font-medium">{product.product_cartegory}</TableCell>
                        <TableCell>{product.product_description}</TableCell>
                        <TableCell className="text-right">
                          <Image
                            src={product.product_image[0]||""}
                            width={50}
                            height={50}
                            alt={product.product_name||""}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="text-right">{product.product_price}</TableCell>
                        <TableCell className="text-right">
                          <time dateTime={product._creationTime !== undefined ? new Date(product._creationTime).toISOString() : ""}>
                            {product._creationTime !== undefined ? new Date(product._creationTime).toLocaleDateString() : "N/A"}
                          </time>
                        </TableCell>
                        <TableCell className=" justify-center  flex gap-1">
                        <Button
                          className="flex  bg-blue-400 hover:bg-blue-700 transition-transform duration-500 "
                          onClick={() => {
                            if (product._id !== undefined) {
                              HandleEdit(product._id);
                            }
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          className="flex bg-red-400  hover:bg-red-700 transition-transform duration-500 "
                          onClick={() => {
                            if (product._id !== undefined) {
                              HandleDelete(product._id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>):(
                        <div>
                                <h1 className="text-2xl font-bold text-center mt-10">No {status} Products</h1>
                                <p className="text-center text-gray-500">You have no products {status} .</p>
                        </div>
                )}
              </div>
                <EditModal isvisible={isvisible} onClose={() => setisvisible(false)} productId={productId} />
                <DeleteModal isdelete={isdelete} onClose={() => setisdelete(false)} productId={productId} />
                        <DeleteAllModal isdeleteall={isdeleteall} onClose={() => setisdeleteall(false)} productIds={checked} />
                </>
              
        )
      }
      export default PendingDataTable;