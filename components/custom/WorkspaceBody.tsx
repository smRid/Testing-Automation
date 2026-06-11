"use client"

import { UserDetailContext } from '@/context/UserDetailContext'
import React, { useContext, useEffect, useState } from 'react'
import { Card, CardContent } from '../ui/card';
import Image from 'next/image';
import { Button } from '../ui/button';
import EmptyWorkspace from './EmptyWorkspace';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import RepoDialog from './RepoDialog';
import UserRepoList from './UserRepoList';

export type UserRepo={
    id:number;
    repoId:number;
    name:string;
    fullName:string;
    private:boolean;
    htmlUrl:string;
    description:string;
    userId:number;
    owner:string;
    updatedAt:string;
    language:string;
    defaultBranch:string;
    targetDomain?:string;
    globalInstruction?:string;
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
        setToken(result.data.connected ? 'connected' : '');
    }

    const OnAddRepo = async () => {
        router.push('/api/github');
    }

    const GetUserAddedRepoList=async()=>{
        const result=await axios.get('/api/user-repo?userId='+userDetail?.id);
        console.log(result.data);
        setUserRepoList(result.data);
    }

  return (
    <div className='w-full'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
            <div>
                <p className='mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600'>Automation hub</p>
                <h2 className='text-3xl font-bold leading-none tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-[44px]'>Workspace</h2>
                <p className='mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base'>Connect repositories, generate test cases, and review Browserless runs from one place.</p>
            </div>
            <h2 className='w-fit rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold leading-tight text-blue-800 shadow-sm sm:text-base'>Remaining Credits: <span className='text-blue-950'>{userDetail?.credits ?? '—'}</span></h2>
        </div>

        <Card className={'group mt-7 flex min-h-[116px] flex-col items-stretch justify-between gap-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 px-5 py-5 text-slate-950 shadow-[0_12px_32px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_42px_rgba(37,99,235,0.10)] sm:flex-row sm:items-center sm:px-7'}>
            <div className='flex min-w-0 items-center gap-4 sm:gap-5'>
                <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 transition-all duration-300 group-hover:scale-105 group-hover:border-blue-200 group-hover:bg-blue-50'>
                    <Image src={'/github.svg'} alt='github' width={34} height={34} className='h-[34px] w-[34px]' />
                </div>
                <div className='min-w-0'>
                    <h2 className='text-lg font-semibold leading-tight tracking-[-0.02em] text-slate-900 sm:text-xl'>Connect GitHub & Add Repository</h2>
                    <p className='mt-1.5 text-sm leading-5 text-slate-500'>Import a project to generate and run automated test cases.</p>
                </div>
            </div>
            <div className='shrink-0'>
                {!token ? <Button className='h-11 w-full cursor-pointer rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_12px_24px_rgba(37,99,235,0.28)] sm:w-auto' onClick={OnAddRepo}>Connect GitHub</Button>: <RepoDialog setRefreshPage={() =>GetUserAddedRepoList()} />}
            </div>
        </Card>

        <Card className='mt-7 min-h-[370px] rounded-2xl border border-slate-200/80 bg-white/95 p-4 text-slate-950 shadow-[0_12px_32px_rgba(15,23,42,0.06)] sm:p-6'>
            {!userRepoList ? <Card className='mt-6 border-slate-200 shadow-none'>
                <CardContent>
                    <EmptyWorkspace />
                </CardContent>
            </Card> : 
                <UserRepoList repoList={userRepoList}  setReload={()=>GetUserAddedRepoList()}/>
            }
        </Card>
    </div>
  )
}

export default WorkspaceBody
