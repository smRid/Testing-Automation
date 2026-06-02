import Workspaceheader from '@/components/custom/WorkspaceHeader';


function WorkspaceLayout({ children }: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Workspaceheader />
      {children}
    </div>
  )
}

export default WorkspaceLayout