import WorkspaceHeader from '@/components/custom/WorkspaceHeader'

function WorkspaceLayout({ children }: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <WorkspaceHeader />
      {children}
    </div>
  )
}

export default WorkspaceLayout
