import React, { useContext, useState } from 'react'
import { UserRepo } from './WorkspaceBody'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import Image from 'next/image'
import { Button } from '../ui/button'
import { CheckCircle2, Link2Icon, ListChecks, Loader2, Loader2Icon, Sparkles, TrendingUp, XCircle } from 'lucide-react'
import { UserDetailContext } from '@/context/UserDetailContext'
import axios from 'axios'
import TestCaseList from './TestCaseList'
import RepoSettings from './RepoSettings'

type props = {
    repoList:UserRepo[]
    isLoading:boolean;
    setReload:()=>void;
}

export type TestCase={
    id: number;
    title: string;
    description: string;
    type: string;
    priority: string;
    repoId: string | number;
    targetFiles: string[];
    expectedResult: string | null;
    repoName: string;
    repoOwner: string;
    targetRoute: string | null;
    branch: string | null;
    status: string | null;
    browserlessScript: string | null;
    logs: string[] | null;
    sessionId: string | null;
    sessionUrl: string | null;
    artifactMetadata: {
        screenshot?: { mimeType: string; size: number };
        video?: { mimeType: string; size: number };
        trace?: { mimeType: string; size: number };
    } | null;
    durationMs: number | null;
}

type StatusData={
    totalTests: number;
    passedTests: number;
    failedTests: number;
    passRate: number;
}

function UserRepoList({repoList,isLoading,setReload}:props) {
    const [statusData, setStatusData] = useState<StatusData>({
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    passRate: 0
});

const { userDetail } = useContext(UserDetailContext);
const [loading, setLoading] = useState(false);
const [testCaseLoading, setTestCaseLoading] = useState(false);
const [testCases, setTestCases] = useState<TestCase[]>([]);
const handleGenerateTestCases = async (repo: UserRepo) => {
    // Implement the logic to call the API route to generate test cases 
    setLoading(true) 
    const result = await axios.post('/api/generate-test-cases', {
        userId: userDetail?.id,
        repoId: repo?.repoId,
        owner: repo.owner,
        repo: repo.name,
        branch: repo.defaultBranch,
    })
        console.log(result.data)
        setLoading(false) 
}

const GetTestCases = async (repoId: number) => {
    // Implement the logic to fetch test cases for the selected repository
    setTestCaseLoading(true);
    setTestCases([]);
    const result = await axios.get(`/api/test-cases?repoId=${repoId}`);
    console.log(result.data);
    const userTestCases= result.data as TestCase[];
    const passedTests=userTestCases?.filter(testCase=>testCase.status=='passed').length || 0;
    const failedTests=userTestCases?.filter(testCase=>testCase.status=='failed').length || 0;
    const passRate= userTestCases?.length ? Math.round((passedTests / userTestCases.length) * 100) : 0;
    
    setStatusData({
    totalTests: result.data.length,
    passedTests:passedTests,
    failedTests:failedTests,
    passRate:passRate
})
    setTestCases(result.data);
    setTestCaseLoading(false);
}

  return (
    <div>
        <div className='mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
            <div>
                <h2 className='text-xl font-bold leading-tight tracking-[-0.025em] text-slate-900 sm:text-2xl'>Repositories</h2>
                <p className='mt-1 text-sm text-slate-500'>Select a repository to view its test coverage and execution history.</p>
            </div>
            {isLoading ? (
                <span className='mt-2 h-6 w-20 rounded-full bg-slate-200 motion-safe:animate-pulse sm:mt-0' aria-hidden='true' />
            ) : (
                <span className='mt-2 w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:mt-0'>{repoList.length} connected</span>
            )}
        </div>
        {isLoading ? (
            <RepositoryListSkeleton />
        ) : (
            <Accordion type="single" collapsible defaultValue="item-1" onValueChange={(value)=> GetTestCases(Number(value))} className='space-y-3'>
                {repoList.map((repo, index) => (
                    <AccordionItem key={`${repo.repoId}-${index}`} value={(repo.repoId).toString()} className='overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 shadow-[0_4px_14px_rgba(15,23,42,0.04)] transition-all duration-300 hover:border-blue-200 hover:shadow-[0_10px_24px_rgba(37,99,235,0.08)] sm:px-5 data-[state=open]:border-blue-200 data-[state=open]:shadow-[0_12px_28px_rgba(37,99,235,0.09)]'>
                        <AccordionTrigger className='gap-3 py-4 text-left hover:no-underline sm:py-5'>
                            <div className='flex min-w-0 items-center gap-3 sm:gap-4'>
                                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 transition-colors duration-200'>
                                    <Image src={'/github.svg'} alt='github' width={22} height={22} />
                                </div>
                                <div className='flex min-w-0 flex-col items-start gap-1'>
                                    <h2 className='max-w-full truncate text-sm font-semibold text-slate-900 sm:text-base'>{repo.fullName}</h2>
                                    <p className='flex max-w-full flex-wrap items-center gap-1.5 text-xs text-slate-500'>
                                        <span>{repo.defaultBranch}</span>
                                        <span className='h-1 w-1 rounded-full bg-blue-400' />
                                        <span>{repo.language || 'Not specified'}</span>
                                    </p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className='pb-5'>
                            <div className='flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between'>
                                <div className='flex min-w-0 items-start gap-3 sm:items-center'>
                                    <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700'>
                                        <Link2Icon className='h-4 w-4'/>
                                    </div>
                                    <div className='min-w-0'>
                                        <p className='text-[11px] font-bold uppercase tracking-wider text-slate-400'>Target domain</p>
                                        <p className='mt-1 break-all text-sm font-semibold text-emerald-700'>{repo?.targetDomain || 'Not configured'}</p>
                                    </div>
                                </div>
                                <RepoSettings repo={repo} setReload={setReload}/>
                            </div>
                            <div className='space-y-5 pt-5'>
                                <div className='grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4'>
                                    <StatusCard
                                        title="Total Tests"
                                        value={statusData.totalTests}
                                        icon={<ListChecks className='h-5 w-5 text-blue-600' />}
                                        bgColor="bg-blue-50 ring-blue-100"
                                    />

                                    <StatusCard
                                        title="Passed"
                                        value={statusData.passedTests}
                                        icon={<CheckCircle2 className='h-5 w-5 text-green-600' />}
                                        bgColor="bg-green-50 ring-green-100"
                                    />

                                    <StatusCard
                                        title="Failed"
                                        value={statusData.failedTests}
                                        icon={<XCircle className='h-5 w-5 text-red-600' />}
                                        bgColor="bg-red-50 ring-red-100"
                                     />

                                    <StatusCard
                                        title="Pass Rate"
                                        value={`${statusData.passRate}%`}
                                        icon={<TrendingUp className='h-5 w-5 text-purple-600' />}
                                        bgColor="bg-purple-50 ring-purple-100"
                                    />
                                </div>

                                {!testCaseLoading && testCases.length > 0 && (
                                    <TestCaseList
                                        testCases={testCases}
                                        repository={repo}
                                        onReload={(repoId) => GetTestCases(Number(repoId))}
                                    />
                                )}

                                {testCaseLoading?
                                    <div className='flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 text-sm font-medium text-blue-700'>
                                        <Loader2Icon className='h-6 w-6 animate-spin'/>
                                        Loading test cases...
                                    </div>
                                    : testCases?.length==0 &&
                                    <div className='flex flex-col justify-between gap-5 rounded-xl border border-dashed border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/70 p-5 sm:flex-row sm:items-center'>
                                    <div>
                                        <h3 className='font-semibold text-slate-900'>
                                            {loading ? 'Generating Test Cases...' :
                                                'Generate AI Test Cases'}</h3>
                                        <p className='mt-1 text-sm leading-6 text-slate-500'>
                                            Analyze this repository and generate automated test cases using AI.
                                        </p>
                                    </div>

                                    <Button className='h-11 w-full gap-2 rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 sm:w-auto' onClick={()=> handleGenerateTestCases(repo)} disabled={loading}>
                                        <Sparkles className='h-4 w-4' />
                                        {loading ? <Loader2 className='animate-spin' />: 'Generate Test Cases'}
                                    </Button>
                                </div>}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        )}
    </div>
  )
}

export default UserRepoList

function RepositoryListSkeleton() {
  return (
    <div className='space-y-3' role='status' aria-label='Loading repositories'>
      <span className='sr-only'>Loading repositories...</span>
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className='flex min-h-[74px] items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_4px_14px_rgba(15,23,42,0.04)] motion-safe:animate-pulse sm:min-h-[82px] sm:px-5'
          aria-hidden='true'
        >
          <div className='flex min-w-0 flex-1 items-center gap-3 sm:gap-4'>
            <div className='h-10 w-10 shrink-0 rounded-xl bg-slate-200' />
            <div className='min-w-0 flex-1 space-y-2'>
              <div className='h-4 w-36 max-w-[65%] rounded-md bg-slate-200 sm:w-52' />
              <div className='flex items-center gap-2'>
                <div className='h-3 w-12 rounded bg-slate-100' />
                <div className='h-1 w-1 rounded-full bg-blue-200' />
                <div className='h-3 w-20 rounded bg-slate-100' />
              </div>
            </div>
          </div>
          <div className='h-5 w-5 shrink-0 rounded-md bg-slate-100' />
        </div>
      ))}
    </div>
  )
}

function StatusCard({
  title,
  value,
  icon,
  bgColor
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  bgColor: string
}) {
  return (
    <div className='group flex min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-4'>
        <div>
            <p className='text-xs font-medium text-slate-500 sm:text-sm'>{title}</p>
            <h3 className='mt-1 text-xl font-bold tracking-[-0.03em] text-slate-900 sm:text-2xl'>{value}</h3>
        </div>

        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-105 sm:h-10 sm:w-10 ${bgColor}`}>
            {icon}
        </div>
    </div>
  )
}
