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
import { Oval } from "react-loader-spinner";
import { Button } from "./ui/button";
import EditModal from "./EditModal/page";
import DeleteModal from "./DeleteModal/page";
import { useEffect, useState } from "react";
import DeleteAllModal from "./DeleteAll/page";
interface Product {
        _id:string,
  approved: boolean,
  product_cartegory: string,
  product_condition: string,
  product_description: string,
  product_image: string[],
  product_name: string,
  product_owner_id: string,
  product_price: string,
  _creationTime:number
}
interface DataTableProps {
  products: Product[];
}
const DataTable: React.FC<DataTableProps> = ({ products }) => {
        const [isvisible, setisvisible] = useState(false);
        const [isdelete, setisdelete] = useState(false);
        const [isdeleteall, setisdeleteall] = useState(false);
        const [productId, setproductId] = useState("");
        const [checked, setchecked] = useState<string[]>([]);
        const [allchecked, setallchecked] = useState(false);


        const HandleCheckboxChange=(ProductId:string)=>{
                if(!checked.includes(ProductId)){
                        setchecked([...checked,ProductId])
                }else{
                        setchecked(checked.filter(id=>id!==ProductId))
                }
        }

        const allIds = products.map(product => product._id);
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
        const HandleEdit=(ProductId:string)=>{
                setproductId(ProductId)
                setisvisible(true)
        }
        const HandleDelete=(ProductId:string)=>{
                setproductId(ProductId)
                setisdelete(true)
        }

        const HandelDeleteAll=(checked:string[])=>{
                console.log(checked)
                setisdeleteall(true)
        }


        return (
                <>
                <div className="w-full  overflow-x-auto   rounded-lg border px-2 ">
                        <div className="flex items-center justify-between p-4 bg-gray-100  dark:bg-gray-800 rounded-t-lg">
                                <div className="text-lg font-semibold">All Products</div>
                                <Button 
                                className="bg-red-400 hover:bg-red-700 transition-transform duration-500" 
                                onClick={() => HandelDeleteAll(checked)}
                                disabled={checked.length === 0}>
                                        Delete Selected
                                </Button>
                        </div>
                {products?( 
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
                      <TableHead className="text-right">Condition</TableHead>
                      <TableHead className="text-right">Image</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Date Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                        
                      <TableRow key={product._id}>
                        <TableCell className="font-medium"><Checkbox
                                onCheckedChange={() => HandleCheckboxChange(product._id)}
                                checked={checked.includes(product._id)}
                                aria-label="Select product"
                         /></TableCell>
                        <TableCell className="font-medium">{product.product_name}</TableCell>
                        <TableCell className="font-medium">{product.product_cartegory}</TableCell>
                        <TableCell>{product.product_description}</TableCell>
                        <TableCell className="text-right">{product.product_condition}</TableCell>
                        <TableCell className="text-right">
                          <Image
                            src={product.product_image[0] || ""}
                            width={50}
                            height={50}
                            alt={product.product_name}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="text-right">{product.product_price}</TableCell>
                        <TableCell className="text-right">
                          {product.approved ? "Approved" : "Pending"}
                        </TableCell>
                        <TableCell className="text-right">
                          <time dateTime={new Date(product._creationTime).toISOString()}>
                            {new Date(product._creationTime).toLocaleDateString()}
                          </time>
                        </TableCell>
                        <TableCell className=" justify-center  flex gap-1">
                        <Button className="flex  bg-blue-400 hover:bg-blue-700 transition-transform duration-500 " onClick={()=>{HandleEdit(product._id)}} >Edit</Button>
                        <Button className="flex bg-red-400  hover:bg-red-700 transition-transform duration-500 " onClick={()=>{HandleDelete(product._id)}}  >Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>):(
                        <Oval
                        visible={true}
                                    height="80"
                                    width="80"
                                    color="#0000FF"
                                    secondaryColor="#ddd"
                                    ariaLabel="oval-loading"
                                    wrapperClass=""
                        />
                )}
              </div>
                <EditModal isvisible={isvisible} onClose={() => setisvisible(false)} productId={productId} />
                <DeleteModal isdelete={isdelete} onClose={() => setisdelete(false)} productId={productId} />
                        <DeleteAllModal isdeleteall={isdeleteall} onClose={() => setisdeleteall(false)} productIds={checked} />
                </>
              
        )
      }
      export default DataTable;