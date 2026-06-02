import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import React from 'react'

function WorkspaceHeader() {
  return (
    <div className='flex w-full justify-between p-4'>
      {/* Logo */}
      <Image src={'/logo.svg'} alt='logo' width={200} height={200} />

      {/* menu Options */}
      <ul className='flex gap-5 text-xl'>
        <li className='hover:text-blue-600 p-2 cursor-pointer rounded-lg'>Workspace</li>
        <li className='hover:text-blue-600 p-2 cursor-pointer rounded-lg'>Pricing</li>
        <li className='hover:text-blue-600 p-2 cursor-pointer rounded-lg'>Support</li>
      </ul>
      {/* User Button */}

      <UserButton />
    </div>
  )
}

export default WorkspaceHeader