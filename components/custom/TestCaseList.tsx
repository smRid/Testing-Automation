

import { Play, RefreshCw, SettingsIcon } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { TestCase } from './UserRepoList'
import { useState } from 'react'

type Props = {
    testCases: TestCase[]
    onReload: ()=> any
}


function TestCaseList({ testCases,onReload }: Props) {
    
    const [selectedTestCases,setSelectedTestCases]=useState<TestCase[]>([]);

    const handleSelectedTestCase = (checked: boolean | string, testCase: TestCase) => {
  if (checked) {
    setSelectedTestCases((prev: any[]) => [...prev, testCase]);
  } else {
    setSelectedTestCases((prev: any[]) => prev.filter((item: any) => item.id !== testCase.id));
  }
};
    return (
        <div>
            <div className='flex items-center justify-between'>
                <h2 className='font-medium'>Generated Test Cases</h2>
                <Button size={'sm'} onClick={()=> onReload(testCases[0]?.repoId)} > <RefreshCw className='h-3 w-3 mr-1' /> Refresh </Button>
            </div>
            <div className='border rounded-md'>
                {testCases.map((testCase, index) => (
                    <div key={index} className='py-4 border-b flex item-centter justify-between'>
                        <div className='flex gap-3 items-center px-2'>
                            <Checkbox 
                            checked={selectedTestCases?.some((item:any)=>item.id==testCase?.id)}
                            onCheckedChange={(checked)=>handleSelectedTestCase(checked,testCase)} className='border-green-500 rounded-full' />
                            <div>
                                <h2>{testCase?.title}</h2>
                                <p className='text-xs text-gray-500'>{testCase?.description}</p>
                            </div>
                        </div>
                        <div className='gap-4 flex'>
                            <Badge variant={'secondary'}>{testCase?.type}</Badge>
                            <Badge variant={'secondary'}>Pending</Badge>
                            <Button size={'icon'} variant={'outline'}>
                                <SettingsIcon className='h-4 w-4 text-green-500 bg-white rounded-full' />
                            </Button>
                        </div>
                    </div>
                ))}
                <div className='p-4 flex items-center justify-between bg-gray-100'>
                    <h2>Run Selected Test Case</h2>
                    <Button disabled={selectedTestCases?.length==0}> <Play className='h-4 w-4 mr-2' />Run Selected</Button>
                </div>
            </div>
        </div>
    )
}

export default TestCaseList