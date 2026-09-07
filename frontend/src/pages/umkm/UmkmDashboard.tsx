import { TopBarLayout } from "../../components/layout/TopBarLayout"
import type { NavItem } from "../../components/layout/TopBarLayout"
import { UserCog, HelpCircle } from "lucide-react"
import { Outlet } from "react-router-dom"

/**
 * UMKM Dashboard
 */
export function UmkmDashboard() {
  const navItems: NavItem[] = [
    { title: "Dasbor", href: "/umkm", end: true },
    { title: "Etalase", href: "/umkm/discover" },
    { title: "Proyek Saya", href: "/umkm/projects" },
  ]

  const profileItems: NavItem[] = [
    { title: "Profil & Rekening", href: "/umkm/profile", icon: <UserCog className="w-4 h-4" /> },
    { title: "Bantuan", href: "/umkm/complaints", icon: <HelpCircle className="w-4 h-4" /> },
  ]

  return (
    <TopBarLayout navItems={navItems} profileItems={profileItems}>
      <Outlet />
    </TopBarLayout>
  )
}
