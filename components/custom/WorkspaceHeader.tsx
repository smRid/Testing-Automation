import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import React from 'react'

function WorkspaceHeader() {
  return (
    <header className='flex h-[124px] w-full items-start border-t-[2px] border-[#8ecbd1] bg-white px-5 pt-[22px] text-black'>
      <div className='grid w-full grid-cols-[1fr_auto_1fr] items-start'>
        <Image src={'/logo.svg'} alt='logo' width={214} height={40} className='h-[40px] w-[214px]' />

        <ul className='flex items-center gap-[42px] text-[26px] font-medium leading-none'>
          <li className='cursor-pointer rounded-lg p-2 hover:text-blue-600'>Workspace</li>
          <li className='cursor-pointer rounded-lg p-2 hover:text-blue-600'>Pricing</li>
          <li className='cursor-pointer rounded-lg p-2 hover:text-blue-600'>Support</li>
        </ul>

        <div className='flex justify-end pt-1'>
          <UserButton />
        </div>
      </div>
    </header>
  )
}

export default WorkspaceHeader
