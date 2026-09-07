import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import type { Role } from "../../contexts/AuthContext"
import { Input } from "../../components/ui/Input"
import { Select } from "../../components/ui/Select"
import { Button } from "../../components/ui/Button"
import { Alert } from "../../components/ui/Alert"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as Role,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
    }

    if (!data.name || !data.username || !data.password || !data.role) {
      setError("Mohon lengkapi semua field yang wajib diisi.")
      setIsLoading(false)
      return
    }

    if (data.password.length < 6) {
      setError("Password harus minimal 6 karakter.")
      setIsLoading(false)
      return
    }

    try {
      await register(data)
      navigate("/") // Redirect to home/dashboard
    } catch (err: any) {
      // Backend ValidationPipe returns array of messages if class-validator fails
      const errMsg = Array.isArray(err.response?.data?.message)
        ? err.response.data.message[0]
        : err.response?.data?.message || "Gagal mendaftar. Silakan coba lagi."
      setError(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-neutral-50)] p-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-[var(--color-primary-600)] rounded-[var(--radius-m)] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">AF</span>
          </div>
          <CardTitle className="text-[var(--text-h3)]">Daftar Akun Baru</CardTitle>
          <p className="text-[var(--text-body-m)] text-[var(--color-neutral-500)] mt-1">
            Bergabunglah dengan ekosistem AgroFund.
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* 
              Doc 4 Sec 9.1: Public Registration only for Pendana and UMKM.
              Koperasi and Supplier not available in public registration.
            */}
            <Select
              label="Tipe Akun"
              name="role"
              required
              options={[
                { label: "Pendana (Mendanai proyek agrikultur)", value: "PENDANA" },
                { label: "UMKM / Petani (Mengajukan pendanaan)", value: "UMKM" },
              ]}
              helperText="Pilih sesuai tujuan utama Anda bergabung."
            />

            <div className="border-t border-[var(--color-neutral-100)] my-1" />

            <Input
              label="Nama Lengkap"
              name="name"
              placeholder="Sesuai kartu identitas"
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Username"
                name="username"
                placeholder="Untuk keperluan login"
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Minimal 6 karakter"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nomor Telepon"
                name="phone"
                placeholder="Contoh: 08123456789"
              />
              <Input
                label="Alamat Lengkap"
                name="address"
                placeholder="Alamat domisili / usaha"
              />
            </div>
            
            <Button type="submit" variant="primary" className="w-full mt-4" isLoading={isLoading}>
              Daftar Sekarang
            </Button>
          </form>

          <div className="mt-6 text-center text-[var(--text-body-s)] text-[var(--color-neutral-600)]">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-[600] text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors">
              Masuk di sini
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
