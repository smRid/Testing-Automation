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
import { Button } from "../ui/button"
import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Input } from "../ui/input";
import { UserDetailContext } from "@/context/UserDetailContext";

export type Repo = {
  id: number;
  name: string;
  full_name: string;
  private_: boolean;
  html_url: string;
  description: string;
  language: string;
  updated_at: string;
  default_branch: string;
  owner: string;
}

function RepoDialog({setRefreshPage}: {setRefreshPage:(refresh:boolean)=>void}) {


    const [repoList, setRepoList] = useState<Repo[]>([]);
    const [selectedRepo,setSelectedRepo] = useState<Repo | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { userDetail } = useContext(UserDetailContext);
    const [isOpen,setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    
    useEffect(() => {
        GetRepoList();
    }, [])

    const GetRepoList = async () => {
        const result = await axios.get('/api/github/repos');
        console.log(result.data);
        setRepoList(result.data);
    }

    const filteredRepoList=useMemo(()=>{
    const q=searchTerm.trim().toLowerCase();

    if(!q) return repoList;

    return repoList.filter(r=>r.full_name.toLowerCase().includes(q));
    },[searchTerm,repoList])

    const SaveRepoToDB = async () => {
  if (!selectedRepo || !userDetail?.id || isSaving) return;

  setIsSaving(true);
  setSaveError('');

  try {
    const result = await axios.post('/api/user-repo', {
      repoId: selectedRepo.id,
      name: selectedRepo.name,
      full_name: selectedRepo.full_name,
      private_: selectedRepo.private_,
      html_url: selectedRepo.html_url,
      description: selectedRepo.description,
      userId: userDetail.id,
      owner: selectedRepo.owner,
      language: selectedRepo.language,
      default_branch: selectedRepo.default_branch,
    })
    console.log(result.data)
    setIsOpen(false);
    setSelectedRepo(null);
    setRefreshPage(true);
  } catch (error) {
    console.error("Error saving repository: ", error);
    setSaveError('Failed to save repository.');
  } finally {
    setIsSaving(false);
  }
}

    return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <DialogTrigger asChild>
        <Button className="h-11 w-full rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_12px_24px_rgba(37,99,235,0.28)] sm:w-auto">+ Add Repository</Button>
        </DialogTrigger>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-lg rounded-2xl border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
        <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-[-0.02em] text-slate-900">Add Repository</DialogTitle>
            <DialogDescription className="leading-6 text-slate-500">
            Search and select one of your GitHub repositories.
            </DialogDescription>
        </DialogHeader>
        <div>
            <Input placeholder='Search repositories by name' onChange={(event)=>setSearchTerm(event.target.value)} className="h-11 rounded-xl border-slate-200 bg-slate-50/70 px-4 focus-visible:border-blue-400 focus-visible:ring-blue-100" />
            {/* Repo List */}
            <ul className='mt-4 max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1'>
                {filteredRepoList.map((repo) => (
                    <li key={repo.id} className={`cursor-pointer rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200
                    ${selectedRepo?.id == repo.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-blue-50 hover:text-blue-800'}`} onClick={()=>setSelectedRepo(repo)} >
                    {repo.full_name}
                    </li>
                ))}
            </ul>
            {saveError && <p className="mt-3 text-sm text-red-600">{saveError}</p>}
        </div>
        <DialogFooter className="gap-2 sm:gap-3">
            <DialogClose asChild>
                <Button variant="outline" className="h-10 rounded-xl border-slate-200">Cancel</Button>
            </DialogClose>
            <Button className="h-10 rounded-xl bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700" onClick={SaveRepoToDB} disabled={!selectedRepo || !userDetail?.id || isSaving}>
                {isSaving ? 'Adding...' : 'Add'}
            </Button>
        </DialogFooter>
        </DialogContent>
        
    </Dialog>
    )
}

export default RepoDialog
