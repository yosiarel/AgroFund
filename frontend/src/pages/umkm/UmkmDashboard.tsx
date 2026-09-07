import { TopBarLayout } from "../../components/layout/TopBarLayout"
import type { NavItem } from "../../components/layout/TopBarLayout"
import { UserCog } from "lucide-react"
import { Outlet } from "react-router-dom"

/**
 * UMKM Dashboard
 */
export function UmkmDashboard() {
  const navItems: NavItem[] = [
    { title: "My Projects", href: "/umkm/projects" },
  ]

  const profileItems: NavItem[] = [
    { title: "Profil Saya", href: "/umkm/profile", icon: <UserCog className="w-4 h-4" /> },
  ]

  return (
    <TopBarLayout navItems={navItems} profileItems={profileItems}>
      <Outlet />
    </TopBarLayout>
  )
}
