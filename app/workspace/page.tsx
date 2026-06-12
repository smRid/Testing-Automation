import WorkspaceBody from '@/components/custom/WorkspaceBody'
import React from 'react'

const Workspace = async ({
  searchParams,
}: {
  searchParams: Promise<{
    github_connected?: string | string[];
    github_error?: string | string[];
  }>;
}) => {
  const params = await searchParams;
  const githubConnectedValue = Array.isArray(params.github_connected)
    ? params.github_connected[0]
    : params.github_connected;
  const githubError = Array.isArray(params.github_error)
    ? params.github_error[0]
    : params.github_error;

  return (
    <div className='mx-auto w-full max-w-[1180px] px-4 pb-16 pt-8 text-slate-950 sm:px-6 sm:pt-10 lg:px-8 lg:pb-24 lg:pt-12'>
      <WorkspaceBody
        githubConnected={githubConnectedValue === 'true'}
        githubError={githubError}
      />
    </div>
  )
}

export default Workspace
