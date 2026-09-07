import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import api from "../lib/axios"

export type Role = "PENDANA" | "UMKM" | "KOPERASI" | "AGROFUND"

export interface User {
  id: string
  username: string
  name: string
  role: Role
  email?: string
  phone?: string
  address?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (data: any) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/user/profile")
      setUser(data) // Will be null if not logged in
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const login = async (credentials: any) => {
    // JWT is handled by backend HTTP-Only cookies, we just need to hit the endpoint
    await api.post("/auth/login", credentials)
    await fetchProfile()
  }

  const register = async (userData: any) => {
    await api.post("/auth/register", userData)
    // Auto login after register is standard, but if backend doesn't set cookie on register,
    // we need to call login immediately after. Let's call login:
    await login({ username: userData.username, password: userData.password })
  }

  const logout = async () => {
    await api.post("/auth/logout")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
