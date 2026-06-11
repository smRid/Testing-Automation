import React, { useState } from 'react'
import {
    Dialog,
    DialogClose,
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
            <DialogTrigger asChild>
                <Button size={'icon'} variant={'outline'} className='h-8 w-8 rounded-lg border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'>
                    <SettingsIcon className='h-4 w-4' />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100vw-1rem)] max-w-lg rounded-2xl border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-[-0.02em] text-slate-900">Edit Testing Requirements</DialogTitle>
                    <DialogDescription className="leading-6 text-slate-500">
                        Update the test details used for script generation and execution.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-5">
                    <div>
                        <label className='text-xs font-bold uppercase tracking-wider text-slate-500'>Test title</label>
                        <Input 
                        value={formTestCase?.title} 
                        onChange={(event)=>handleInputChange('title',event?.target?.value)}
                        placeholder='Test Title' className='mt-2 h-11 rounded-xl border-slate-200 bg-slate-50/70 px-4 focus-visible:border-blue-400 focus-visible:ring-blue-100' />
                    </div>
                    <div>
                        <label className='text-xs font-bold uppercase tracking-wider text-slate-500'>Description / Action</label>
                        <Textarea 
                        value={formTestCase?.description} 
                        onChange={(event)=>handleInputChange('description',event?.target?.value)}
                        placeholder='Description' className='mt-2 min-h-24 rounded-xl border-slate-200 bg-slate-50/70 px-4 py-3 focus-visible:border-blue-400 focus-visible:ring-blue-100' />
                    </div>
                    <div>
                        <label className='text-xs font-bold uppercase tracking-wider text-slate-500'>Target route / Path</label>
                        <Input 
                        value={formTestCase?.targetRoute} 
                        onChange={(event)=>handleInputChange('targetRoute',event?.target?.value)}
                        placeholder='Target Route' className='mt-2 h-11 rounded-xl border-slate-200 bg-slate-50/70 px-4 focus-visible:border-blue-400 focus-visible:ring-blue-100' />
                    </div>
                    <div>
                        <label className='text-xs font-bold uppercase tracking-wider text-slate-500'>Expected result</label>
                        <Textarea 
                        value={formTestCase?.expectedResult} 
                        onChange={(event)=>handleInputChange('expectedResult',event?.target?.value)}
                        placeholder='Expected Result' className='mt-2 min-h-24 rounded-xl border-slate-200 bg-slate-50/70 px-4 py-3 focus-visible:border-blue-400 focus-visible:ring-blue-100' />
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-3">
                    <DialogClose asChild>
                        <Button variant={'outline'} className="h-10 rounded-xl border-slate-200">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button className="h-10 rounded-xl bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700" onClick={updateCase}>Update Case</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
export default TestCaseSettingDialog
