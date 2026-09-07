import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import type { Role } from "../contexts/AuthContext"
import { LoadingSpinner } from "./ui/LoadingSpinner"

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

/**
 * Role-Aware Router Gate (Doc 7, Security Specifications)
 * Prevents unauthorized access based on role.
 * Redirects to /login if unauthenticated.
 * Redirects to /unauthorized if authenticated but role is not allowed.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner size="lg" label="Memverifikasi akses..." />
      </div>
    )
  }

  if (!user) {
    // If not logged in, redirect to login
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If logged in but role is incorrect
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
