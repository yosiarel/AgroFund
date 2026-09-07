import * as React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { cn } from "../../lib/utils"
import { LogOut, Menu, X, User as UserIcon, ChevronRight } from "lucide-react"
import { Button } from "../ui/Button"

export interface SidebarItem {
  title: string
  href: string
  icon?: React.ReactNode
}

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebarItems: SidebarItem[]
  title: string
}

/**
 * Dashboard Layout (Doc 4, Sec 6 Global Information Architecture)
 * Provides consistent layout across all roles.
 * Includes responsive sidebar, top navbar, and user profile actions.
 */
export function DashboardLayout({ children, sidebarItems, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] flex flex-col md:flex-row">
      {/* Mobile Navbar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-[var(--color-neutral-200)] px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--color-primary-600)] rounded-[var(--radius-s)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">AF</span>
          </div>
          <span className="font-[600] text-[var(--color-neutral-900)] truncate max-w-[120px]">
            {title}
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)] rounded-md"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-[var(--color-neutral-200)] flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-[var(--color-neutral-200)] hidden md:flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--color-primary-600)] rounded-[var(--radius-s)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">AF</span>
          </div>
          <span className="font-[600] text-[var(--text-h5)] text-[var(--color-neutral-900)]">
            {title}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-[var(--radius-m)] text-[var(--text-body-m)] font-[500] transition-colors",
                  isActive
                    ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                    : "text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-900)]"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-[var(--color-neutral-200)] flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--color-neutral-100)] rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-5 h-5 text-[var(--color-neutral-500)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[var(--text-label)] font-[600] text-[var(--color-neutral-900)] truncate">
                {user?.name}
              </p>
              <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] truncate">
                {user?.role}
              </p>
            </div>
          </div>
          <Button
            variant="tertiary"
            className="w-full justify-start text-[var(--color-error-600)] hover:bg-[var(--color-error-50)] hover:text-[var(--color-error-700)] border-none"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Desktop Header — shows active page title for context (Doc 5 Sec 75) */}
        <header className="hidden md:flex h-16 bg-white border-b border-[var(--color-neutral-200)] items-center px-8 sticky top-0 z-20 gap-2">
          {/* Breadcrumb: Dashboard → Active Page */}
          <span className="text-[var(--text-body-s)] text-[var(--color-neutral-400)]">{title}</span>
          <ChevronRight className="w-4 h-4 text-[var(--color-neutral-300)] flex-shrink-0" aria-hidden="true" />
          <span className="text-[var(--text-body-s)] font-[600] text-[var(--color-neutral-800)] truncate">
            {sidebarItems.find(item =>
              location.pathname === item.href ||
              location.pathname.startsWith(item.href + "/")
            )?.title ?? ""}
          </span>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
