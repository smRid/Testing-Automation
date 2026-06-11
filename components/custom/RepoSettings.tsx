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
import { Settings2 } from 'lucide-react'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { DialogClose } from '@radix-ui/react-dialog'

const RepoSettings = () => {
  return (
        <Dialog>
        <DialogTrigger>
            <Button> <Settings2 className='h-4 w-4 mr-1' /> Project Config</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle className='flex gap-2 items-center'><Settings2 className='h-4 w-4 text-blue-600' /> Project/Repo Settings</DialogTitle>
            <DialogDescription>
                Config project level default used during script generation and execution.
            </DialogDescription>
            </DialogHeader>
            <div>
                <div>
                    <label className='text-gray-500'>APP URL/DEFAULT WEBSITE</label>
                    <Input placeholder='App url/Domain' className='mt-1' />
                    <p className='text-xs text-gray-500'> The target address where automated headless browsers will connect and run test cases</p>
                </div>
                <div className='mt-4'>
                    <label className='text-gray-500'>GLOBAL TEST INSTRUCTION</label>
                    <Textarea placeholder='Instructions' className='mt-1' />
                    <p className='text-xs text-gray-500'> These instructions will be given to the AI agent to generate relevant test cases</p>
                </div>
            </div>
            <DialogFooter>
                <DialogClose>
                    <Button variant={'outline'}>Cancel</Button>
                </DialogClose>
                <Button>Save Config</Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
  )
}

export default RepoSettings