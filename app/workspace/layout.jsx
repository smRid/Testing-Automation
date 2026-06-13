import WorkspaceHeader from '@/components/custom/WorkspaceHeader'

export const metadata = {
  title: "Workspace",
  robots: {
    index: false,
    follow: false,
  },
};

function WorkspaceLayout({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_52%,#f8fafc_100%)]">
      <WorkspaceHeader />
      {children}
    </div>
  )
}

export default WorkspaceLayout
