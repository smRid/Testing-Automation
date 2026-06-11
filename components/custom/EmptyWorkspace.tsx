import React from 'react'
import { Link2 } from 'lucide-react'
import { Button } from '../ui/button'

const EmptyWorkspace = () => {
  return (
    <div className='flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/70 px-5 py-10 text-center sm:px-8'>
      <div className='relative mb-8 h-[70px] w-[92px] transition-transform duration-300 hover:-translate-y-1 hover:scale-105' aria-hidden='true'>
        <div className='absolute left-[7px] top-0 h-[22px] w-[45px] rounded-t-[7px] bg-[#ffd744]' />
        <div className='absolute left-[32px] top-[1px] h-[17px] w-[34px] rounded-t-[6px] bg-[#ef3f72]' />
        <div className='absolute left-[4px] top-[9px] h-[58px] w-[84px] rounded-[8px] bg-[#f4bd13] shadow-[inset_-6px_0_0_#5aa6ec]' />
        <div className='absolute left-0 top-[14px] h-[56px] w-[86px] rounded-[8px] bg-gradient-to-b from-[#ffd626] to-[#f8a915] shadow-[inset_-6px_0_0_#56a2ed]' />
      </div>

      <h3 className='text-2xl font-bold leading-tight tracking-[-0.03em] text-slate-900 sm:text-3xl'>
        No Repository Connected
      </h3>
      <p className='mt-4 max-w-xl text-sm font-normal leading-6 text-slate-500 sm:text-base'>
        Connect your GitHub account and add a repository to generate and run test cases.
      </p>
      <Button className='mt-7 h-11 cursor-pointer rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_12px_24px_rgba(37,99,235,0.26)]'>
        <Link2 className='mr-2 size-4' />
        Connect Repo
      </Button>
    </div>
  )
}

export default EmptyWorkspace
