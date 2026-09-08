import { DashboardLayout } from "../../components/layout/DashboardLayout"
import type { SidebarItem } from "../../components/layout/DashboardLayout"
import { ClipboardCheck, PackageSearch, FileCheck, Activity, AlertOctagon, Briefcase } from "lucide-react"
import { Outlet } from "react-router-dom"

/**
 * Koperasi Dashboard (Doc 4, Sec 6)
 * Information Architecture:
 * ├── Assigned Projects
 * ├── Assessment
 * ├── Procurement
 * ├── Evidence
 * ├── Monitoring
 * └── Incident / Cases
 */
export function KoperasiDashboard() {
  const sidebarItems: SidebarItem[] = [
    { title: "Proyek Ditugaskan", href: "/koperasi/projects", icon: <Briefcase className="w-5 h-5" /> },
    { title: "Penilaian Kelayakan", href: "/koperasi/projects", icon: <ClipboardCheck className="w-5 h-5" /> },
    { title: "Pengadaan Barang", href: "/koperasi/procurement", icon: <PackageSearch className="w-5 h-5" /> },
    { title: "Validasi Bukti", href: "/koperasi/evidence", icon: <FileCheck className="w-5 h-5" /> },
    { title: "Pemantauan Proyek", href: "/koperasi/monitoring", icon: <Activity className="w-5 h-5" /> },
    { title: "Insiden & Kasus", href: "/koperasi/incidents", icon: <AlertOctagon className="w-5 h-5" /> },
  ]

  return (
    <DashboardLayout title="Koperasi Panel" sidebarItems={sidebarItems}>
      <Outlet />
    </DashboardLayout>
  )
}
