import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function WorkspaceHeader() {
  return (
    <header className='sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 text-slate-950 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-xl'>
      <div className='mx-auto grid h-[72px] w-full max-w-[1480px] grid-cols-[1fr_auto] items-center gap-4 px-4 sm:h-[78px] sm:px-6 md:grid-cols-[1fr_auto_1fr] lg:px-8'>
        <Link
          href='/'
          aria-label='Go to TestFlow home page'
          className='flex w-fit items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
        >
          <Image
            src='/logo.png'
            alt='TestFlow'
            width={519}
            height={481}
            priority
            className='h-10 w-10 shrink-0 object-contain transition-transform duration-300 hover:scale-105 sm:h-11 sm:w-11'
          />
          <span className='leading-none text-lg font-bold tracking-[-0.03em] text-slate-950 sm:text-xl'>
            TestFlow
          </span>
        </Link>

        <ul className='hidden items-center gap-2 text-sm font-semibold text-slate-500 md:flex lg:gap-4'>
          <li className='cursor-pointer rounded-full bg-blue-50 px-4 py-2 text-blue-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800'>Workspace</li>
          <li className='cursor-pointer rounded-full px-4 py-2 transition-all duration-200 hover:bg-slate-100 hover:text-slate-950'>Pricing</li>
          <li className='cursor-pointer rounded-full px-4 py-2 transition-all duration-200 hover:bg-slate-100 hover:text-slate-950'>Support</li>
        </ul>

        <div className='flex justify-end'>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'h-9 w-9',
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}

export default WorkspaceHeader
