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
import { AlertCircle, Github, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export type Repo = {
  id: number;
  name: string;
  full_name: string;
  private_: boolean;
  html_url: string;
  description: string | null;
  language: string | null;
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
    const [isLoadingRepos, setIsLoadingRepos] = useState(false);
    const [repoError, setRepoError] = useState('');
    const [needsReconnect, setNeedsReconnect] = useState(false);
    const router = useRouter();
    
    useEffect(() => {
        if (isOpen) {
            void GetRepoList();
        }
    }, [isOpen])

    const GetRepoList = async () => {
        setIsLoadingRepos(true);
        setRepoError('');
        setNeedsReconnect(false);

        try {
            const result = await axios.get<Repo[]>('/api/github/repos');
            setRepoList(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            setRepoList([]);

            if (axios.isAxiosError<{ error?: string }>(error)) {
                setNeedsReconnect(error.response?.status === 401);
                setRepoError(
                    error.response?.data?.error || 'Unable to load GitHub repositories.'
                );
            } else {
                setRepoError('Unable to load GitHub repositories.');
            }
        } finally {
            setIsLoadingRepos(false);
        }
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
        <DialogContent className="box-border w-[calc(100vw-1rem)] max-w-lg grid-cols-[minmax(0,1fr)] overflow-hidden rounded-2xl border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
        <DialogHeader className="min-w-0">
            <DialogTitle className="text-xl font-bold tracking-[-0.02em] text-slate-900">Add Repository</DialogTitle>
            <DialogDescription className="leading-6 text-slate-500">
            Search and select one of your GitHub repositories.
            </DialogDescription>
        </DialogHeader>
        <div className="min-w-0 max-w-full">
            <div className="relative min-w-0 max-w-full">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input placeholder='Search repositories by name' value={searchTerm} onChange={(event)=>setSearchTerm(event.target.value)} disabled={isLoadingRepos || needsReconnect} className="h-11 min-w-0 max-w-full rounded-xl border-slate-200 bg-slate-50/70 pl-10 pr-4 text-slate-900 caret-blue-600 placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-blue-100" />
            </div>
            {/* Repo List */}
            <div className='mt-4 min-h-28 w-full min-w-0 max-w-full overflow-x-hidden overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 [max-height:min(16rem,40vh)]'>
                {isLoadingRepos ? (
                    <div className="flex min-h-28 flex-col items-center justify-center gap-2 text-sm font-medium text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        Loading repositories...
                    </div>
                ) : repoError ? (
                    <div className="flex min-h-28 flex-col items-center justify-center gap-3 px-4 py-5 text-center">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                            <AlertCircle className="h-5 w-5" />
                        </span>
                        <p className="text-sm text-slate-600">{repoError}</p>
                        {needsReconnect ? (
                            <Button
                                type="button"
                                size="sm"
                                className="gap-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                                onClick={() => router.push('/api/github')}
                            >
                                <Github className="h-4 w-4" />
                                Reconnect GitHub
                            </Button>
                        ) : (
                            <Button type="button" size="sm" variant="outline" onClick={() => void GetRepoList()}>
                                Try again
                            </Button>
                        )}
                    </div>
                ) : filteredRepoList.length === 0 ? (
                    <div className="flex min-h-28 items-center justify-center px-4 text-center text-sm text-slate-500">
                        {repoList.length === 0
                            ? 'No repositories are available for this GitHub account.'
                            : 'No repositories match your search.'}
                    </div>
                ) : (
                    <ul className='min-w-0 max-w-full divide-y divide-slate-100'>
                        {filteredRepoList.map((repo) => (
                            <li key={repo.id} className={`min-w-0 max-w-full cursor-pointer overflow-hidden rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200
                            ${selectedRepo?.id == repo.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-blue-50 hover:text-blue-800'}`} onClick={()=>setSelectedRepo(repo)} >
                                <span className="block truncate">{repo.full_name}</span>
                                <span className={`mt-1 block text-xs ${selectedRepo?.id == repo.id ? 'text-blue-100' : 'text-slate-400'}`}>
                                    {repo.language || 'Language not specified'}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {saveError && <p className="mt-3 text-sm text-red-600">{saveError}</p>}
        </div>
        <DialogFooter className="min-w-0 gap-2 sm:gap-3">
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
