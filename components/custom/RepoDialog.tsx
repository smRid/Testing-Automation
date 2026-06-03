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

function RepoDialog() {
    return (
    <Dialog>
        <DialogTrigger>
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
            {/* Repo List */}
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