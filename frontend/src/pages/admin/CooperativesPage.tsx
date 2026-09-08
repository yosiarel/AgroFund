import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { CooperativePartner } from "../../types"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Building2, Plus, ShieldCheck, UserPlus } from "lucide-react"

export function CooperativesPage() {
  const queryClient = useQueryClient()

  const { data: cooperatives = [], isLoading } = useQuery<CooperativePartner[]>({
    queryKey: ["admin-cooperatives"],
    queryFn: async () => {
      const res: any = await api.get("/admin/cooperatives")
      if (Array.isArray(res)) return res
      if (Array.isArray(res?.data)) return res.data
      return []
    },
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    contactPerson: "",
    adminUsername: "",
    adminPassword: "",
  })

  const [feedback, setFeedback] = useState<string | null>(null)

  const provisionMutation = useMutation({
    mutationFn: () => api.post("/admin/cooperatives", formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cooperatives"] })
      setIsModalOpen(false)
      setFormData({
        name: "",
        address: "",
        phone: "",
        contactPerson: "",
        adminUsername: "",
        adminPassword: "",
      })
      setFeedback("Akun Koperasi mitra berhasil dibuat dan diaktivasi.")
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat data koperasi mitra..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
            Manajemen Koperasi Mitra
          </h1>
          <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">
            Pendaftaran, penugasan wilayah, dan aktivasi akun Koperasi terverifikasi (PB-013).
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Daftarkan Koperasi Baru
        </Button>
      </div>

      {feedback && (
        <Alert variant="success" onClose={() => setFeedback(null)}>
          {feedback}
        </Alert>
      )}

      <Alert variant="info" className="bg-[var(--color-primary-50)] border-[var(--color-primary-200)]">
        <div className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--color-primary-600)] flex-shrink-0" />
          <div className="text-[var(--text-body-m)] text-[var(--color-primary-900)]">
            <span className="font-[600]">Integritas Akun Koperasi (Doc 4 Sec 6 & PB-007):</span> Pendaftaran publik tidak dibuka untuk entitas Koperasi. Seluruh akun resmi Koperasi wajib dibuat dan diverifikasi langsung oleh Admin AgroFund.
          </div>
        </div>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(!cooperatives || cooperatives.length === 0) ? (
          <div className="col-span-2">
            <Card>
              <CardContent className="py-12 text-center text-[var(--color-neutral-600)]">
                <Building2 className="w-12 h-12 text-[var(--color-neutral-400)] mx-auto mb-2" />
                <p className="font-[600]">Belum ada Koperasi mitra terdaftar</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          cooperatives.map((coop) => (
            <Card key={coop.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[var(--color-primary-600)]" />
                    <CardTitle className="text-[var(--text-h5)]">{coop.name}</CardTitle>
                  </div>
                  <Badge variant={coop.status === "ACTIVE" ? "success" : "warning"}>
                    {coop.status === "ACTIVE" ? "Aktif & Terverifikasi" : "Perlu Verifikasi"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-[var(--text-body-s)]">
                <p className="text-[var(--color-neutral-700)]">
                  <span className="font-[600]">Alamat:</span> {coop.address}
                </p>
                <p className="text-[var(--color-neutral-700)]">
                  <span className="font-[600]">Kontak:</span> {coop.contactPerson} ({coop.phone})
                </p>
                <div className="pt-2 mt-2 border-t border-[var(--color-neutral-100)] flex justify-between items-center text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                  <span>Proyek Dibina Aktif: <strong>{coop.activeProjectsCount || 0}</strong></span>
                  <span className="text-[var(--color-success-700)] font-[600]">Mitra Resmi AgroFund</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Provisioning Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[var(--color-primary-600)]" /> Daftarkan Koperasi Baru
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Input
                label="Nama Koperasi"
                placeholder="Koperasi Produsen Tani Makmur"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Alamat Kantor Operasional"
                placeholder="Jl. Raya Agrikultur No. 12, Malang"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nama Penanggung Jawab"
                  placeholder="Bpk. Suryanto"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  required
                />
                <Input
                  label="Nomor Telepon / WA"
                  placeholder="0812345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="p-3 bg-[var(--color-neutral-50)] rounded-[var(--radius-s)] border border-[var(--color-neutral-200)] flex flex-col gap-3">
                <p className="text-[var(--text-caption)] font-[600] text-[var(--color-neutral-700)]">Kredensial Login Akun Koperasi:</p>
                <Input
                  label="Username"
                  placeholder="koperasi.malang"
                  value={formData.adminUsername}
                  onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                  required
                />
                <Input
                  label="Password Awal"
                  type="password"
                  placeholder="••••••••"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button variant="tertiary" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={() => provisionMutation.mutate()}
                isLoading={provisionMutation.isPending}
                disabled={!formData.name || !formData.adminUsername || !formData.adminPassword}
              >
                Simpan & Buat Akun
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
