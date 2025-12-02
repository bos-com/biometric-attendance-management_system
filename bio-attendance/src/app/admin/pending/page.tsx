"use client";
import React from 'react'
import DataTable from '@/components/DataTable';
import useGetProductsByOwner from '@/hooks/useGetProductsByOwner';
import { useAppSelector } from '@/hooks';

const Pending = () => {
        const User = useAppSelector((state)=>state.user.user)
        const { data: products, } = useGetProductsByOwner(User?.User_id||'');
        const newProducts = products?.filter(product => !product.approved)
  return (
    <div className='mt-20' >
        <div className=" px-4 " id="pending" >
                <DataTable status='Pending'  products={newProducts ?? [] } />
              </div>
        </div>
  )
}

export default Pending