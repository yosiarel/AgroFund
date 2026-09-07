import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useMutation } from "@tanstack/react-query"
import api from "../../lib/axios"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/Card"
import { Landmark, CheckCircle2 } from "lucide-react"

export function ProfilePage() {
  const { user } = useAuth()
  const [bankName, setBankName] = useState("Bank Rakyat Indonesia (BRI)")
  const [bankAccountNumber, setBankAccountNumber] = useState("1234-01-000123-53-1")
  const [accountHolderName, setAccountHolderName] = useState(user?.name || "")
  const [feedback, setFeedback] = useState<string | null>(null)

  const updateBankMutation = useMutation({
    mutationFn: () =>
      api.post("/umkm/profile/bank-account", {
        bankName,
        bankAccountNumber,
        accountHolderName,
      }),
    onSuccess: () => {
      setFeedback("Rekening pengembalian jaminan berhasil diperbarui dan diverifikasi.")
    },
  })

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
          Profil & Rekening Pengembalian Jaminan
        </h1>
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">
          Kelola data profil UMKM dan rekening bank resmi untuk pengembalian Guarantee saat proyek sukses ditutup (PB-045).
        </p>
      </div>

      {feedback && (
        <Alert variant="success" onClose={() => setFeedback(null)}>
          {feedback}
        </Alert>
      )}

      <Alert variant="info" className="bg-[var(--color-primary-50)] border-[var(--color-primary-200)]">
        <div className="flex gap-3">
          <div className="text-[var(--text-body-m)] text-[var(--color-primary-900)]">
            Jaminan (Guarantee 5%) yang Anda setorkan di awal akan dikembalikan 100% secara otomatis ke rekening bank terdaftar ini saat proyek selesai dan dinyatakan Sukses Ditutup.
          </div>
        </div>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-[var(--text-h5)]">Data Akun</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-[var(--text-body-s)]">
            <div className="w-16 h-16 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] flex items-center justify-center font-[700] text-xl mx-auto mb-2">
              {user?.name?.slice(0, 2).toUpperCase() || "UM"}
            </div>
            <div>
              <p className="text-[var(--color-neutral-500)]">Nama Lengkap</p>
              <p className="font-[600] text-[var(--color-neutral-900)]">{user?.name}</p>
            </div>
            <div>
              <p className="text-[var(--color-neutral-500)]">Username</p>
              <p className="font-[600] text-[var(--color-neutral-900)]">{user?.username}</p>
            </div>
            <div>
              <p className="text-[var(--color-neutral-500)]">Peran Sistem</p>
              <p className="font-[600] text-[var(--color-primary-700)]">{user?.role}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-[var(--text-h5)] flex items-center gap-2">
              <Landmark className="w-5 h-5 text-[var(--color-primary-600)]" /> Rekening Bank Terverifikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              label="Nama Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Contoh: Bank Mandiri / BRI / BCA"
              required
            />
            <Input
              label="Nomor Rekening"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              placeholder="Nomor rekening tanpa spasi"
              required
            />
            <Input
              label="Nama Pemilik Rekening"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              placeholder="Nama sesuai buku tabungan"
              helperText="Nama pemilik rekening harus sesuai dengan identitas pemilik UMKM."
              required
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => updateBankMutation.mutate()}
              isLoading={updateBankMutation.isPending}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Simpan Rekening Bank
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
