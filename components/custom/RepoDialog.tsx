import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "../ui/button"
import { DialogClose } from "@radix-ui/react-dialog"
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Input } from "../ui/input";

type Repo = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string;
  language: string;
  updated_at: string;
  default_branch: string;
  owner: string;
}

function RepoDialog() {


    const [repoList, setRepoList] = useState<Repo[]>([]);
    const [selectedRepo,setSelectedRepo] = useState<Repo | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
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

    return (
    <Dialog>
        <DialogTrigger asChild>
        <Button>+Add Repo</Button>
        </DialogTrigger>
        <DialogContent>
        <DialogHeader>
            <DialogTitle>Add Repository</DialogTitle>
            <DialogDescription>
            Search and select one of your github repositories
            </DialogDescription>
        </DialogHeader>
        <div>
            <Input placeholder='Search Repos by Name' onChange={(event)=>setSearchTerm(event.target.value)} />
            {/* Repo List */}
            <ul className='max-h-60 overflow-y-auto border rounded-xl mt-4'>
                {filteredRepoList.map((repo) => (
                    <li key={repo.id} className={`p-4 border-b hover:bg-gray-500 cursor-pointer
                    ${selectedRepo?.id == repo.id ? 'bg-gray-700' : ''}`} onClick={()=>setSelectedRepo(repo)} >
                    {repo.full_name}
                    </li>
                ))}
            </ul>
        </div>
        <DialogFooter className="flex gap-5">
            <DialogClose>Cancel</DialogClose>
            <Button>Add</Button>
        </DialogFooter>
        </DialogContent>
        
    </Dialog>
    )
}

export default RepoDialog
