import { Play, RefreshCw } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { TestCase } from './UserRepoList'
import { useState } from 'react'
import TestCaseSettingDialog from './TestCaseSettingDialog'
import TestExecutionModal from './TestExecutionModal'
import type { UserRepo } from './WorkspaceBody'

type Props = {
    testCases: TestCase[]
    repository: UserRepo
    onReload: (repoId: string | number) => void | Promise<void>
}

function TestCaseList({ testCases, repository, onReload }: Props) {
    
    const [selectedTestCases,setSelectedTestCases]=useState<TestCase[]>([]);
    const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);

    const handleSelectedTestCase = (checked: boolean | string, testCase: TestCase) => {
        if (checked) {
            setSelectedTestCases((previous) => (
                previous.some((item) => item.id === testCase.id)
                    ? previous
                    : [...previous, testCase]
            ));
        } else {
            setSelectedTestCases((previous) => previous.filter((item) => item.id !== testCase.id));
        }
    };

    const closeExecutionModal = () => {
        setIsExecutionModalOpen(false);
        void onReload(repository.repoId);
    };

    return (
        <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
            <div className='flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:px-5'>
                <div>
                    <h2 className='text-sm font-semibold text-slate-900 sm:text-base'>Generated Test Cases</h2>
                    <p className='mt-0.5 text-xs text-slate-500'>{testCases.length} test cases available</p>
                </div>
                <Button size="sm" variant="outline" className='shrink-0 rounded-lg border-slate-200 bg-white text-slate-600 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700' onClick={() => void onReload(repository.repoId)}>
                    <RefreshCw className='mr-1.5 h-3.5 w-3.5' /> Refresh
                </Button>
            </div>
            <div>
                {testCases.map((testCase) => {
                    const isSelected = selectedTestCases.some((item) => item.id === testCase.id);

                    return (
                    <div
                        key={testCase.id}
                        className={`group relative flex flex-col gap-3 border-b px-4 py-4 transition-colors duration-200 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${
                            isSelected
                                ? 'border-blue-100 bg-blue-50/70 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-blue-600'
                                : 'border-slate-100 bg-white hover:bg-slate-50/80'
                        }`}
                    >
                        <div className='flex min-w-0 items-start gap-3 sm:items-center'>
                            <Checkbox 
                            checked={isSelected}
                            aria-label={`Select ${testCase.title}`}
                            onCheckedChange={(checked)=>handleSelectedTestCase(checked,testCase)}
                            className='mt-0.5 h-[18px] w-[18px] rounded-md border-slate-300 bg-white text-white shadow-sm transition-all hover:border-blue-400 focus-visible:ring-blue-500 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white sm:mt-0'
                            />
                            <div className='min-w-0'>
                                <h2 className={`text-sm font-semibold transition-colors ${isSelected ? 'text-blue-950' : 'text-slate-900 group-hover:text-blue-800'}`}>{testCase?.title}</h2>
                                <p className='mt-1 line-clamp-2 text-xs leading-5 text-slate-500 sm:line-clamp-1'>{testCase?.description}</p>
                            </div>
                        </div>
                        <div className='flex shrink-0 items-center gap-2 pl-7 sm:pl-0'>
                            <Badge
                                variant='outline'
                                className={`text-[10px] font-semibold uppercase tracking-wide ${getTestTypeBadgeClassName(testCase.type)}`}
                            >
                                {testCase?.type}
                            </Badge>
                            {testCase?.status=='failed'&& <Badge variant={'destructive'} className='border border-red-200 bg-red-50 text-[10px] capitalize text-red-700 hover:bg-red-50'>{testCase?.status}</Badge>}
                            {testCase?.status=='passed'&& <Badge variant={'default'} className='border border-emerald-200 bg-emerald-50 text-[10px] capitalize text-emerald-700 hover:bg-emerald-50'>{testCase?.status}</Badge>}
                            {testCase?.status=='running'&& <Badge variant={'default'} className='border border-amber-200 bg-amber-50 text-[10px] capitalize text-amber-700 hover:bg-amber-50'>{testCase?.status}</Badge>}
                            <TestCaseSettingDialog testCase={testCase} setReload={onReload} />
                        </div>
                    </div>
                    );
                })}
                <div className='flex flex-col gap-3 bg-slate-50/90 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
                    <div>
                        <h2 className='text-sm font-semibold text-slate-900'>Run Selected Test Cases</h2>
                        <p className='mt-0.5 text-xs text-slate-500'>{selectedTestCases.length} selected</p>
                    </div>
                    <Button
                        disabled={selectedTestCases.length === 0}
                        onClick={() => setIsExecutionModalOpen(true)}
                        className='h-10 w-full rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-[0_7px_16px_rgba(37,99,235,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 sm:w-auto'
                    >
                        <Play className='h-4 w-4 mr-2' />Run Selected
                    </Button>
                </div>
            </div>
            <TestExecutionModal
                isOpen={isExecutionModalOpen}
                onClose={closeExecutionModal}
                testCases={selectedTestCases}
                repository={repository}
            />
        </div>
    )
}

export default TestCaseList

function getTestTypeBadgeClassName(type: string) {
    const normalizedType = type.toLowerCase().trim();

    if (normalizedType === 'ui') {
        return 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50';
    }
    if (normalizedType === 'auth') {
        return 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-50';
    }
    if (normalizedType === 'api') {
        return 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-50';
    }
    if (normalizedType === 'form') {
        return 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50';
    }
    if (normalizedType === 'integration') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50';
    }
    if (normalizedType === 'edge-case') {
        return 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50';
    }

    return 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50';
}
