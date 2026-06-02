import React from 'react'
import { Link2 } from 'lucide-react'
import { Button } from '../ui/button'

const EmptyWorkspace = () => {
  return (
    <div className='flex min-h-[370px] flex-col items-center justify-center px-6 pb-2 text-center'>
      <div className='relative mb-[43px] h-[70px] w-[92px]' aria-hidden='true'>
        <div className='absolute left-[7px] top-0 h-[22px] w-[45px] rounded-t-[7px] bg-[#ffd744]' />
        <div className='absolute left-[32px] top-[1px] h-[17px] w-[34px] rounded-t-[6px] bg-[#ef3f72]' />
        <div className='absolute left-[4px] top-[9px] h-[58px] w-[84px] rounded-[8px] bg-[#f4bd13] shadow-[inset_-6px_0_0_#5aa6ec]' />
        <div className='absolute left-0 top-[14px] h-[56px] w-[86px] rounded-[8px] bg-gradient-to-b from-[#ffd626] to-[#f8a915] shadow-[inset_-6px_0_0_#56a2ed]' />
      </div>

      <h3 className='text-[31px] font-semibold leading-none tracking-normal text-black'>
        No Repository Connected
      </h3>
      <p className='mt-[27px] max-w-[820px] text-[22px] font-normal leading-tight tracking-normal text-black'>
        Connect your Github accounts and add a repository to generate and run test cases
      </p>
      <Button className='mt-[29px] h-[46px] rounded-[6px] px-[22px] text-[17px] font-semibold shadow-[0_2px_4px_rgba(0,0,0,0.25)] cursor-pointer'>
        <Link2 className='mr-3 size-5' />
        Connect Repo
      </Button>
    </div>
  )
}

export default EmptyWorkspace
