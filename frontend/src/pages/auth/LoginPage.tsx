import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { Alert } from "../../components/ui/Alert"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    if (!username || !password) {
      setError("Username dan password harus diisi.")
      setIsLoading(false)
      return
    }

    try {
      await login({ username, password })
      navigate("/") // Redirect to home/dashboard (will be routed by ProtectedRoute later)
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal masuk. Periksa kembali username dan password Anda.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-neutral-50)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          {/* Logo Placeholder */}
          <div className="w-12 h-12 bg-[var(--color-primary-600)] rounded-[var(--radius-m)] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">AF</span>
          </div>
          <CardTitle className="text-[var(--text-h3)]">Masuk ke AgroFund</CardTitle>
          <p className="text-[var(--text-body-m)] text-[var(--color-neutral-500)] mt-1">
            Selamat datang kembali.
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Username"
              name="username"
              placeholder="Masukkan username Anda"
              required
              autoComplete="username"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Masukkan password Anda"
              required
              autoComplete="current-password"
            />
            
            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
              Masuk
            </Button>
          </form>

          <div className="mt-6 text-center text-[var(--text-body-s)] text-[var(--color-neutral-600)]">
            Belum punya akun?{" "}
            <Link to="/register" className="font-[600] text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors">
              Daftar sekarang
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
