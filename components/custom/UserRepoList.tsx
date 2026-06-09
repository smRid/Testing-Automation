import React from 'react'
import { UserRepo } from './WorkspaceBody'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import Image from 'next/image'

type props = {
    repoList:UserRepo[]
}

function UserRepoList({repoList}:props) {
  return (
    <div>
        <h2 className='text-[25px] font-medium leading-tight tracking-normal mt-3 mb-4'>Repositories</h2>
    {repoList.map((repo, index) => (
            <Accordion type="single" collapsible defaultValue="item-1" key={index}>
                <AccordionItem value="item-1" className='border px-5 rounded-xl'>
                    <AccordionTrigger>
                        <div className='flex items-center gap-5'>
                            <Image src={'/github.svg'} alt='github' width={20} height={20} />
                            <div className='flex flex-col items-start gap-1'>
                                <h2> {repo.fullName}</h2>
                                <p className='text-xs text-gray-500'>
                                    {repo.defaultBranch}  •  {repo.language}
                                </p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        Yes. It adheres to the WAI-ARIA design pattern.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        ))}
    </div>
  )
}

export default UserRepoList