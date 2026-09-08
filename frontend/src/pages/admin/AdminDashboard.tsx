import { DashboardLayout } from "../../components/layout/DashboardLayout"
import type { SidebarItem } from "../../components/layout/DashboardLayout"
import { Building2, FolderKanban, AlertTriangle, ShieldAlert, Undo2, Scale, Activity, LayoutDashboard } from "lucide-react"
import { Outlet } from "react-router-dom"


export function AdminDashboard() {
  const sidebarItems: SidebarItem[] = [
    { title: "Ringkasan Dasbor", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
    { title: "Manajemen Proyek", href: "/admin/projects", icon: <FolderKanban className="w-5 h-5" /> },
    { title: "Daftar Koperasi", href: "/admin/cooperatives", icon: <Building2 className="w-5 h-5" /> },
    { title: "Laporan Insiden", href: "/admin/incidents", icon: <AlertTriangle className="w-5 h-5" /> },
    { title: "Pemulihan Dana", href: "/admin/recovery", icon: <ShieldAlert className="w-5 h-5" /> },
    { title: "Pengembalian Dana", href: "/admin/refunds", icon: <Undo2 className="w-5 h-5" /> },
    { title: "Sengketa", href: "/admin/disputes", icon: <Scale className="w-5 h-5" /> },
    { title: "Audit & Aktivitas", href: "/admin/audit", icon: <Activity className="w-5 h-5" /> },
  ]

  return (
    <DashboardLayout title="AgroFund Admin" sidebarItems={sidebarItems}>
      <Outlet />
    </DashboardLayout>
  )
}
