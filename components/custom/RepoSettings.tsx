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
            <Button variant="outline" className="h-10 w-full rounded-xl border-slate-200 bg-white px-4 font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:w-auto"> <Settings2 className='mr-1.5 h-4 w-4' /> Project Config</Button>
        </DialogTrigger>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-lg rounded-2xl border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
            <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-xl font-bold tracking-[-0.02em] text-slate-900'><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50"><Settings2 className='h-4 w-4 text-blue-600' /></span> Project/Repo Settings</DialogTitle>
            <DialogDescription className="leading-6 text-slate-500">
                Config project level default used during script generation and execution.
            </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
                <div>
                    <label className='text-xs font-bold uppercase tracking-wider text-slate-500'>App URL / Default website</label>
                    <Input placeholder='App URL or domain' value={repoSettings.targetDomain} onChange={(e) => setRepoSettings({...repoSettings, targetDomain: e.target.value})} className='mt-2 h-11 rounded-xl border-slate-200 bg-slate-50/70 px-4 text-slate-900 caret-blue-600 placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-blue-100' />
                    <p className='mt-2 text-xs leading-5 text-slate-500'>The target address where automated headless browsers will connect and run test cases.</p>
                </div>
                <div>
                    <label className='text-xs font-bold uppercase tracking-wider text-slate-500'>Global test instruction</label>
                    <Textarea placeholder='Instructions' value={repoSettings.globalInstruction} onChange={(e) => setRepoSettings({...repoSettings, globalInstruction: e.target.value})} className='mt-2 min-h-28 rounded-xl border-slate-200 bg-slate-50/70 px-4 py-3 text-slate-900 caret-blue-600 placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-blue-100' />
                    <p className='mt-2 text-xs leading-5 text-slate-500'>These instructions will be given to the AI agent to generate relevant test cases.</p>
                </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-3">
                <DialogClose asChild>
                    <Button variant={'outline'} className="h-10 rounded-xl border-slate-200">Cancel</Button>
                </DialogClose>
                <Button className="h-10 rounded-xl bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700" onClick={handleSaveSettings}>Save Config</Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
  )
}

export default RepoSettings
