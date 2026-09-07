import { DashboardLayout } from "../../components/layout/DashboardLayout"
import type { SidebarItem } from "../../components/layout/DashboardLayout"
import { Search, Receipt, LineChart, Leaf, AlertTriangle } from "lucide-react"
import { Outlet } from "react-router-dom"

/**
 * Pendana Dashboard (Doc 4, Sec 6)
 * Information Architecture:
 * ├── Discover Projects
 * ├── My Contributions
 * ├── Project Monitoring
 * ├── Natura
 * └── Complaints / Cases
 */
export function PendanaDashboard() {
  const sidebarItems: SidebarItem[] = [
    { title: "Discover Projects", href: "/pendana/discover", icon: <Search className="w-5 h-5" /> },
    { title: "My Contributions", href: "/pendana/contributions", icon: <Receipt className="w-5 h-5" /> },
    { title: "Project Monitoring", href: "/pendana/monitoring", icon: <LineChart className="w-5 h-5" /> },
    { title: "Natura", href: "/pendana/natura", icon: <Leaf className="w-5 h-5" /> },
    { title: "Complaints / Cases", href: "/pendana/complaints", icon: <AlertTriangle className="w-5 h-5" /> },
  ]

  return (
    <DashboardLayout title="Pendana Panel" sidebarItems={sidebarItems}>
      <Outlet />
    </DashboardLayout>
  )
}
