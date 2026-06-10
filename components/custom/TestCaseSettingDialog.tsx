import React from 'react'
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

function TestCaseSettingDialog() {
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
                        <Input placeholder='Test Title' className='mt-1' />
                    </div>
                </div>
                <div>
                    <div className='mt-3'>
                        <label className='text-gray-400'>DESCRIPTION/ACTION</label>
                        <Textarea placeholder='Description' className='mt-1' />
                    </div>
                </div>
                <div>
                    <div className='mt-3'>
                        <label className='text-gray-400'>TARGET ROUTE/PATH</label>
                        <Input placeholder='Target Route' className='mt-1' />
                    </div>
                </div>
                <div>
                    <div className='mt-3'>
                        <label className='text-gray-400'>EXPECTED RESULT (JSON)</label>
                        <Textarea placeholder='Expected Result' className='mt-1' />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose>
                        <Button variant={'outline'}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button>Update Case</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
export default TestCaseSettingDialog