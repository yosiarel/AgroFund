import { DashboardLayout } from "../../components/layout/DashboardLayout"
import type { SidebarItem } from "../../components/layout/DashboardLayout"
import { FolderGit2, UserCog } from "lucide-react"
import { Outlet } from "react-router-dom"

/**
 * UMKM Dashboard (Doc 4, Sec 6)
 * Information Architecture:
 * ├── My Projects
 * └── Profile / Payment Information
 * Note: Project sub-states (Overview, Assessment, etc) are internal to "My Projects" 
 * and not primary sidebar links to prevent clutter.
 */
export function UmkmDashboard() {
  const sidebarItems: SidebarItem[] = [
    { title: "My Projects", href: "/umkm/projects", icon: <FolderGit2 className="w-5 h-5" /> },
    { title: "Profile / Payment Information", href: "/umkm/profile", icon: <UserCog className="w-5 h-5" /> },
  ]

  return (
    <DashboardLayout title="UMKM Panel" sidebarItems={sidebarItems}>
      <Outlet />
    </DashboardLayout>
  )
}
