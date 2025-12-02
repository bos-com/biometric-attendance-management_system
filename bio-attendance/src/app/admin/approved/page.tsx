"use client";
import React from 'react'
import DataTable  from "@/adminComponents/DataTable"
import useGetProductsByOwner from '@/hooks/useGetProductsByOwner';
import { useAppSelector } from '@/hooks';

const Approved = () => {
        const User = useAppSelector((state)=>state.user.user)
        const { data: products, } = useGetProductsByOwner(User?.User_id||'');
        const newProducts = products?.filter(product => product.approved)
  return (
    <div className='mt-20' >
        <div className=" px-4 " id="Approved" >
                <DataTable status='Approved' products={newProducts ?? [] } />
              </div>
        </div>
  )
}

export default Approved