import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '../ui/button'
import { SettingsIcon } from 'lucide-react'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { DialogClose } from '@radix-ui/react-dialog'
import { TestCase } from './UserRepoList'
import axios from 'axios'

type props = {
    testCase?: TestCase
    setReload: any
}

function TestCaseSettingDialog({ testCase, setReload }: props) {

    const [formTestCase,setFormTestCase]=useState({
        title: testCase?.title || '',
        description: testCase?.description || '',
        targetRoute: testCase?.targetRoute || '',
        expectedResult: testCase?.expectedResult || ''
    });



    const handleInputChange = (fieldName: string, value: string) => {

        setFormTestCase((prev) => ({
            ...prev,
            [fieldName]: value
        }))
    }

    const updateCase = async () => {
        const result = await axios.post('/api/test-cases/settings', {
            ...formTestCase,
            testCaseId: testCase?.id
        });
        console.log(result?.data);
        setReload();
    }

    return (
        <Dialog>
            <DialogTrigger>
                <Button size={'icon'} variant={'outline'} className='bg-green-100 rounded-full text-green-600 border-none hover:bg-green-200 hover:text-green-700'>
                    <SettingsIcon className='h-4 w-4' />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Testing Requirements</DialogTitle>
                    <DialogDescription>
                        Modifying these parameters automatically clears pre-gener
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <div>
                        <label className='text-gray-400'>TEST TITLE</label>
                        <Input 
                        value={formTestCase?.title} 
                        onChange={(event)=>handleInputChange('title',event?.target?.value)}
                        placeholder='Test Title' className='mt-1' />
                    </div>
                </div>
                <div>
                    <div className='mt-3'>
                        <label className='text-gray-400'>DESCRIPTION/ACTION</label>
                        <Textarea 
                        value={formTestCase?.description} 
                        onChange={(event)=>handleInputChange('description',event?.target?.value)}
                        placeholder='Description' className='mt-1' />
                    </div>
                </div>
                <div>
                    <div className='mt-3'>
                        <label className='text-gray-400'>TARGET ROUTE/PATH</label>
                        <Input 
                        value={formTestCase?.targetRoute} 
                        onChange={(event)=>handleInputChange('targetRoute',event?.target?.value)}
                        placeholder='Target Route' className='mt-1' />
                    </div>
                </div>
                <div>
                    <div className='mt-3'>
                        <label className='text-gray-400'>EXPECTED RESULT (JSON)</label>
                        <Textarea 
                        value={formTestCase?.expectedResult} 
                        onChange={(event)=>handleInputChange('expectedResult',event?.target?.value)}
                        placeholder='Expected Result' className='mt-1' />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose>
                        <Button variant={'outline'}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button onClick={updateCase}>Update Case</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
export default TestCaseSettingDialog