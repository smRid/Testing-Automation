import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import React from 'react'

function WorkspaceHeader() {
  return (
    <header className='sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 text-slate-950 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-xl'>
      <div className='mx-auto grid h-[72px] w-full max-w-[1480px] grid-cols-[1fr_auto] items-center gap-4 px-4 sm:h-[78px] sm:px-6 md:grid-cols-[1fr_auto_1fr] lg:px-8'>
        <Image src={'/logo.svg'} alt='logo' width={214} height={40} className='h-auto w-[150px] transition-transform duration-300 hover:scale-[1.02] sm:w-[180px] lg:w-[214px]' />

        <ul className='hidden items-center gap-2 text-sm font-semibold text-slate-500 md:flex lg:gap-4'>
          <li className='cursor-pointer rounded-full bg-blue-50 px-4 py-2 text-blue-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800'>Workspace</li>
          <li className='cursor-pointer rounded-full px-4 py-2 transition-all duration-200 hover:bg-slate-100 hover:text-slate-950'>Pricing</li>
          <li className='cursor-pointer rounded-full px-4 py-2 transition-all duration-200 hover:bg-slate-100 hover:text-slate-950'>Support</li>
        </ul>

        <div className='flex justify-end'>
          <div className='rounded-full border border-slate-200 bg-white p-1 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md'>
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  )
}

export default WorkspaceHeader
