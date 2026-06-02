import WorkspaceHeader from '@/components/custom/WorkspaceHeader';   


function WorkspaceLayout({ children }: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <WorkspaceHeader />
      {children}
    </div>
  )
}

export default WorkspaceLayout