

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
        <div>
            <div className='flex items-center justify-between'>
                <h2 className='font-medium'>Generated Test Cases</h2>
                <Button size="sm" onClick={() => void onReload(repository.repoId)}>
                    <RefreshCw className='h-3 w-3 mr-1' /> Refresh
                </Button>
            </div>
            <div className='border rounded-md'>
                {testCases.map((testCase) => (
                    <div key={testCase.id} className='py-4 border-b flex items-center justify-between'>
                        <div className='flex gap-3 items-center px-2'>
                            <Checkbox 
                            checked={selectedTestCases.some((item) => item.id === testCase.id)}
                            onCheckedChange={(checked)=>handleSelectedTestCase(checked,testCase)} className='border-green-500 rounded-full' />
                            <div>
                                <h2>{testCase?.title}</h2>
                                <p className='text-xs text-gray-500'>{testCase?.description}</p>
                            </div>
                        </div>
                        <div className='gap-4 flex item-center'>
                            <Badge variant={'secondary'} >{testCase?.type}</Badge>
                            {testCase?.status=='failed'&& <Badge variant={'destructive'} className='text-red-200'>{testCase?.status}</Badge>}
                            {testCase?.status=='passed'&& <Badge variant={'default'} className='text-green-200'>{testCase?.status}</Badge>}
                            {testCase?.status=='running'&& <Badge variant={'default'} className='text-yellow-200'>{testCase?.status}</Badge>}
                            <TestCaseSettingDialog testCase={testCase} setReload={onReload} />

                        </div>
                    </div>
                ))}
                <div className='p-4 flex items-center justify-between bg-gray-100'>
                    <h2>Run Selected Test Case</h2>
                    <Button
                        disabled={selectedTestCases.length === 0}
                        onClick={() => setIsExecutionModalOpen(true)}
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
