"use client"
import { UserDetailContext } from '@/context/UserDetailContext'
import React, { useContext } from 'react'

function WorkspaceBody() {

  const { userDetail } = useContext(UserDetailContext);

  return (
    <div>
        <div className='flex justify-between items-center'>
            <h2 className='text-4xl font-medium'>Workspace</h2>
            <h2 className='bg-purple-100 p-2 rounded-lg font-medium text-purple-700'>{userDetail?.credits } Credits remains:</h2>
        </div>
    </div>
  )
}

export default WorkspaceBody