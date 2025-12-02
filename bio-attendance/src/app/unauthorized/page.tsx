import React from 'react'
import { TriangleAlert } from 'lucide-react';

const page = () => {
  return (
    <div className='flex flex-col gap-10 h-screen   items-center justify-center bg-gray-100 font-sans'>
        <h1 className='text-9xl  ' >
                💩
        </h1>
        <h1 className=' flex items-center gap-4 font-bold text-4xl ' >
                <TriangleAlert className='text-red-500 w-12 h-10 '  /> Unauthorised
        </h1>
    </div>
  )
}

export default page