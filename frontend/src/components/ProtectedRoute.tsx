import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import type { Role } from "../contexts/AuthContext"
import { LoadingSpinner } from "./ui/LoadingSpinner"

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}


export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
