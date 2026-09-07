import { TopBarLayout } from "../../components/layout/TopBarLayout"
import type { NavItem } from "../../components/layout/TopBarLayout"
import { User, Leaf, AlertTriangle } from "lucide-react"
import { Outlet } from "react-router-dom"

/**
 * Pendana Dashboard (Doc 4, Sec 6)
 */
export function PendanaDashboard() {
  const navItems: NavItem[] = [
    { title: "Discover Projects", href: "/pendana/discover" },
    { title: "My Contributions", href: "/pendana/contributions" },
  ]

  const profileItems: NavItem[] = [
    { title: "Profil Saya", href: "/pendana/profile", icon: <User className="w-4 h-4" /> },
    { title: "Klaim Natura", href: "/pendana/natura", icon: <Leaf className="w-4 h-4" /> },
    { title: "Bantuan & Komplain", href: "/pendana/complaints", icon: <AlertTriangle className="w-4 h-4" /> },
  ]

  return (
    <TopBarLayout navItems={navItems} profileItems={profileItems}>
      <Outlet />
    </TopBarLayout>
  )
}
