"use client"

import { UserDetailContext } from '@/context/UserDetailContext'
import React, { useContext, useEffect, useState } from 'react'
import { Card, CardContent } from '../ui/card';
import Image from 'next/image';
import { Button } from '../ui/button';
import EmptyWorkspace from './EmptyWorkspace';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import RepoDialog, { Repo } from './RepoDialog';

type UserRepo={
    id:number;
    repoId:number;
    name:string;
    full_name:string;
    private_:boolean;
    html_url:string;
    description:string;
    userId:number;
    owner:string;
    updatedAt:string;
    language:string;
    default_branch:string;
}

function WorkspaceBody() {

    const { userDetail } = useContext(UserDetailContext);
    const router = useRouter()
    const [token, setToken] = useState('');
    const [userRepoList,setUserRepoList] = useState<UserRepo[]>([]);

    useEffect(() => {
        GetGithubUserToken();

    }, [])

    useEffect(()=>{
        userDetail&& GetUserAddedRepoList();
    },[userDetail])

    const GetGithubUserToken = async () => {
        const result = await axios.get('/api/github/token');
        console.log(result.data.token)
        setToken(result.data.token);
    }

    const OnAddRepo = async () => {
        router.push('/api/github');
    }

    const GetUserAddedRepoList=async()=>{
        const result=await axios.get('/api/user-repo?userId='+userDetail?.id);
        console.log(result.data);
    }

  return (
    <div className='w-full'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <h2 className='text-[44px] font-semibold leading-none tracking-normal text-black'>Workspace</h2>
            <h2 className='w-fit rounded-[8px] bg-[#dce9ff] px-3 py-1 text-[20px] font-medium leading-tight text-[#1c3f89]'>Remaining Credits: {userDetail?.credits}</h2>
        </div>

        <Card className={'mt-[27px] flex min-h-[98px] items-center justify-between rounded-[10px] border-[#dedede] bg-white px-[21px] py-5 text-black shadow-[0_2px_5px_rgba(0,0,0,0.13)]'}>
            <div className='flex min-w-0 items-center gap-[28px]'>
                <Image src={'/github.svg'} alt='github' width={54} height={54} className='h-[54px] w-[54px] shrink-0' />
                <h2 className='text-[25px] font-medium leading-tight tracking-normal'>Connect Github & Add Repository</h2>
            </div>
            <div>
                {!token ? <Button className='h-[48px] rounded-[8px] px-[21px] text-[16px] font-semibold shadow-[0_2px_4px_rgba(0,0,0,0.25)] cursor-pointer' onClick={OnAddRepo}>Connect</Button>: <RepoDialog setRefreshPage={(refresh: boolean) => console.log(refresh)} />}
            </div>
        </Card>

        <Card className='mt-[51px] min-h-[370px] rounded-[12px] border-[#dedede] bg-white text-black shadow-[0_2px_5px_rgba(0,0,0,0.13)]'>
            <CardContent>
            {!userRepoList ? <EmptyWorkspace />
                : null}
            </CardContent>
        </Card>
    </div>
  )
}

export default WorkspaceBody
