import React, { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogClose,
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
import { UserRepo } from './WorkspaceBody';
import axios from 'axios'
type props = {
    repo:UserRepo
    setReload:()=>void;
}

const RepoSettings = ({repo, setReload}:props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [repoSettings,setRepoSettings]=useState({
        targetDomain: repo?.targetDomain || '',
        globalInstruction: repo?.globalInstruction || ''
    });

    const handleSaveSettings = async() => {
    // Implement the logic to save the updated settings to the database
        console.log('Saved Settings:', repoSettings);

        const result = await axios.post('/api/user-repo/settings', {
        repoId: repo.repoId,
        targetDomain: repoSettings.targetDomain,
        globalInstruction: repoSettings.globalInstruction,
        });

        console.log(result?.data);
        setReload();
        setIsOpen(false);
    }
  return (
        <Dialog open={isOpen} onOpenChange={(open)=>setIsOpen(open)} >
        <DialogTrigger asChild>
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
                    <Input placeholder='App url/Domain' value={repoSettings.targetDomain} onChange={(e) => setRepoSettings({...repoSettings, targetDomain: e.target.value})} className='mt-1' />
                    <p className='text-xs text-gray-500'> The target address where automated headless browsers will connect and run test cases</p>
                </div>
                <div className='mt-4'>
                    <label className='text-gray-500'>GLOBAL TEST INSTRUCTION</label>
                    <Textarea placeholder='Instructions' value={repoSettings.globalInstruction} onChange={(e) => setRepoSettings({...repoSettings, globalInstruction: e.target.value})} className='mt-1' />
                    <p className='text-xs text-gray-500'> These instructions will be given to the AI agent to generate relevant test cases</p>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant={'outline'}>Cancel</Button>
                </DialogClose>
                <Button onClick={handleSaveSettings}>Save Config</Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
  )
}

export default RepoSettings
