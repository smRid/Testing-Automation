"use client"

import { UserDetailContext } from '@/context/UserDetailContext'
import React, { useContext, useEffect, useState } from 'react'
import { Card } from '../ui/card';
import Image from 'next/image';
import { Button } from '../ui/button';
import axios from 'axios';
import RepoDialog from './RepoDialog';
import UserRepoList from './UserRepoList';
import { AlertCircle } from 'lucide-react';

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

type GitHubAccount = {
    id: string;
    login: string;
    avatarUrl: string | null;
}

function WorkspaceBody({
    githubConnected = false,
    githubError,
}: {
    githubConnected?: boolean;
    githubError?: string;
}) {

    const { userDetail } = useContext(UserDetailContext);
    const [githubAccount, setGitHubAccount] = useState<GitHubAccount | null>(null);
    const [isGitHubLoading, setIsGitHubLoading] = useState(true);
    const [githubStatusError, setGitHubStatusError] = useState('');
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [userRepoList,setUserRepoList] = useState<UserRepo[]>([]);
    const [isRepoListLoading, setIsRepoListLoading] = useState(true);
    const githubErrorMessage = githubError ? {
        access_denied: 'GitHub authorization was cancelled.',
        account_changed: 'Your signed-in account changed during GitHub authorization. Please try again.',
        bad_verification_code: 'The GitHub authorization code expired or was already used. Please connect again.',
        connection_save_failed: 'GitHub authorized successfully, but the connection could not be saved.',
        identity_verification_failed: 'GitHub connected, but the account identity could not be verified.',
        incorrect_client_credentials: 'The GitHub client ID and client secret do not belong to the same OAuth App.',
        invalid_state: 'The GitHub authorization session expired. Please try connecting again.',
        invalid_user_session: 'Your GitHub connection session could not be verified. Please connect again.',
        missing_code: 'GitHub did not return an authorization code. Please try again.',
        oauth_not_configured: 'GitHub OAuth is not configured on this server.',
        redirect_uri_mismatch: 'The callback URL does not exactly match the URL configured in the GitHub OAuth App.',
        token_exchange_failed: 'GitHub could not complete the connection. Check the OAuth app callback URL and credentials.',
        unverified_user_email: 'Verify your primary email address on GitHub, then connect again.',
    }[githubError] || 'GitHub connection failed. Please try again.' : '';

    useEffect(() => {
        GetGithubUserToken();

    }, [])

    useEffect(()=>{
        userDetail&& GetUserAddedRepoList();
    },[userDetail])

    const GetGithubUserToken = async () => {
        setIsGitHubLoading(true);
        setGitHubStatusError('');

        try {
            const result = await axios.get<{ connected: boolean; account: GitHubAccount | null }>(
                '/api/github/token',
                { headers: { 'Cache-Control': 'no-cache' } }
            );
            setGitHubAccount(result.data.connected ? result.data.account : null);
        } catch {
            setGitHubAccount(null);
            setGitHubStatusError('Unable to check your GitHub connection.');
        } finally {
            setIsGitHubLoading(false);
        }
    }

    const OnAddRepo = () => {
        window.location.assign('/api/github');
    }

    const DisconnectGitHub = async () => {
        if (isDisconnecting) return;

        setIsDisconnecting(true);
        try {
            await axios.delete('/api/github/token');
            setGitHubAccount(null);
        } finally {
            setIsDisconnecting(false);
        }
    }

    const GetUserAddedRepoList=async()=>{
        setIsRepoListLoading(true);
        try {
            const result=await axios.get('/api/user-repo?userId='+userDetail?.id);
            console.log(result.data);
            setUserRepoList(result.data);
        } finally {
            setIsRepoListLoading(false);
        }
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
            <div className='w-full shrink-0 sm:w-auto'>
                {isGitHubLoading ? (
                    <Button
                        type='button'
                        className='h-11 w-full rounded-xl bg-slate-200 px-6 font-semibold text-slate-600 shadow-none sm:w-auto'
                        disabled
                    >
                        Checking GitHub...
                    </Button>
                ) : !githubAccount ? (
                    <Button className='h-11 w-full cursor-pointer rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_12px_24px_rgba(37,99,235,0.28)] sm:w-auto' onClick={OnAddRepo}>Connect GitHub</Button>
                ) : (
                    <div className='flex flex-col items-stretch gap-3 sm:items-end'>
                        <span className='truncate text-xs font-medium text-slate-500'>
                            Connected as <strong className='text-slate-900'>@{githubAccount.login}</strong>
                        </span>
                        <div className='grid grid-cols-1 gap-2 min-[480px]:grid-cols-3 sm:flex sm:flex-wrap sm:justify-end'>
                            <RepoDialog
                                openAfterConnect={githubConnected}
                                setRefreshPage={() =>GetUserAddedRepoList()}
                            />
                            <Button
                                type='button'
                                variant='outline'
                                className='h-11 rounded-xl border-slate-300 bg-white px-5 font-semibold text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950'
                                onClick={OnAddRepo}
                            >
                                Switch account
                            </Button>
                            <Button
                                type='button'
                                variant='ghost'
                                className='h-11 rounded-xl px-5 font-semibold text-red-600 hover:bg-red-50 hover:text-red-700'
                                onClick={DisconnectGitHub}
                                disabled={isDisconnecting}
                            >
                                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Card>

        {githubErrorMessage && (
            <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{githubErrorMessage}</span>
            </div>
        )}

        {githubStatusError && (
            <div role="alert" className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <span className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{githubStatusError}</span>
                </span>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                    onClick={() => void GetGithubUserToken()}
                >
                    Retry
                </Button>
            </div>
        )}

        <Card className='mt-7 min-h-[370px] rounded-2xl border border-slate-200/80 bg-white/95 p-4 text-slate-950 shadow-[0_12px_32px_rgba(15,23,42,0.06)] sm:p-6'>
            <UserRepoList
                repoList={userRepoList}
                isLoading={isRepoListLoading}
                setReload={()=>GetUserAddedRepoList()}
            />
        </Card>
    </div>
  )
}

export default WorkspaceBody
