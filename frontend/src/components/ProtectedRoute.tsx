import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import type { Role } from "../contexts/AuthContext"
import { Skeleton } from "./ui/Skeleton"

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

function TopBarSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] flex flex-col">
      <header className="h-16 bg-white border-b border-[var(--color-neutral-200)] flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0">
        <div className="flex items-center gap-6">
          <Skeleton className="h-8 w-8 rounded-[var(--radius-m)]" />
          <Skeleton className="h-6 w-32 hidden md:block" />
          <div className="hidden md:flex gap-4 ml-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton className="h-64 w-full rounded-[var(--radius-l)]" />
          <Skeleton className="h-64 w-full rounded-[var(--radius-l)] hidden md:block" />
          <Skeleton className="h-64 w-full rounded-[var(--radius-l)] hidden lg:block" />
        </div>
      </main>
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[var(--color-neutral-200)] h-screen sticky top-0">
        <div className="p-4 border-b border-[var(--color-neutral-200)] flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-[var(--radius-s)]" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 py-6 px-4 flex flex-col gap-4">
          <Skeleton className="h-10 w-full rounded-[var(--radius-m)]" />
          <Skeleton className="h-10 w-full rounded-[var(--radius-m)]" />
          <Skeleton className="h-10 w-full rounded-[var(--radius-m)]" />
          <Skeleton className="h-10 w-3/4 rounded-[var(--radius-m)]" />
        </div>
        <div className="p-4 border-t border-[var(--color-neutral-200)] flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-[var(--color-neutral-200)] flex items-center px-4 md:px-8 sticky top-0">
          <Skeleton className="h-6 w-8 md:hidden mr-4" />
          <Skeleton className="h-4 w-48" />
        </header>

        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex flex-col gap-6">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96 max-w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Skeleton className="h-64 w-full rounded-[var(--radius-l)]" />
            <Skeleton className="h-64 w-full rounded-[var(--radius-l)] hidden md:block" />
            <Skeleton className="h-64 w-full rounded-[var(--radius-l)] hidden lg:block" />
          </div>
        </div>
      </main>
    </div>
  )
}

export function DashboardSkeleton() {
  const location = useLocation()
  const isSidebarLayout = location.pathname.startsWith("/admin") || location.pathname.startsWith("/koperasi")

  if (isSidebarLayout) {
    return <SidebarSkeleton />
  }

  return <TopBarSkeleton />
}


export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <DashboardSkeleton />
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
