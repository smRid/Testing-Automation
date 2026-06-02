"use client"
import { UserDetailContext } from '@/context/UserDetailContext'
import React, { useContext } from 'react'
import { Card } from '../ui/card';
import Image from 'next/image';
import { Button } from '../ui/button';

function WorkspaceBody() {

  const { userDetail } = useContext(UserDetailContext);

  return (
    <div>
        <div className='flex justify-between items-center'>
            <h2 className='text-4xl font-medium'>Workspace</h2>
            <h2 className='bg-purple-100 p-2 rounded-lg font-medium text-purple-700'>{userDetail?.credits } Credits remains:</h2>
        </div>

        <Card className={'mt-5 flex justify-between items-center'}>
            <div className='flex items-center gap-5'>
                <Image src={'/github.svg'} alt='github' width={50} height={50} />
                <h2 className='text-lg'>Connect Github & Add Repository</h2>
            </div>
            <div>
                <Button className='cursor-pointer'>Install</Button>
            </div>
        </Card>
    </div>
  )
}

export default WorkspaceBody