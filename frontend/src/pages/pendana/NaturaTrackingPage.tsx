import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { Contribution } from "../../types"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Textarea } from "../../components/ui/Textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Leaf, Truck, MapPin, ShieldCheck } from "lucide-react"

export function NaturaTrackingPage() {
  const queryClient = useQueryClient()

  const { data: contributions, isLoading } = useQuery<Contribution[]>({
    queryKey: ["pendana-contributions"],
    queryFn: () => api.get("/contributions"),
  })

  // Filter only contributions with NaturaPackage
  const naturaContributions = contributions?.filter((c) => !!c.naturaPackage)

  const [selectedContributionId, setSelectedContributionId] = useState<string | null>(null)
  const [claimNotes, setClaimNotes] = useState("")
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, address }: { id: string; address: string }) =>
      api.post(`/contributions/${id}/natura-address`, { address }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendana-contributions"] })
      alert("Alamat pengiriman berhasil diperbarui.")
    },
  })

  const submitClaimMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      api.post(`/contributions/${id}/natura-claim`, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendana-contributions"] })
      setIsClaimModalOpen(false)
      setClaimNotes("")
      alert("Laporan klaim natura Anda telah dikirim.")
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat paket natura..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
          Paket Natura & Pengiriman Hasil Panen
        </h1>
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">
          Lacak status pemenuhan kompensasi non-finansial berupa produk hasil pertanian dari proyek yang Anda danai.
        </p>
      </div>

      <Alert variant="info" className="bg-[var(--color-primary-50)] border-[var(--color-primary-200)]">
        <div className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--color-primary-600)] flex-shrink-0" />
          <div className="text-[var(--text-body-m)] text-[var(--color-primary-900)]">
            <span className="font-[600]">Ketentuan Natura (Doc 4 Sec 26 & PB-102):</span> Natura adalah kompensasi barang hasil pertanian (bukan dividen/bunga). Anda memiliki masa klaim (Claim Window) 30 hari kalender sejak tanggal panen jika terjadi kendala pengiriman atau kerusakan.
          </div>
        </div>
      </Alert>

      <div className="flex flex-col gap-4">
        {(!naturaContributions || naturaContributions.length === 0) ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <Leaf className="w-12 h-12 text-[var(--color-neutral-400)] mb-3" />
              <p className="text-[var(--text-body-l)] font-[600] text-[var(--color-neutral-800)]">
                Belum ada paket natura
              </p>
              <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)] max-w-md mt-1">
                Saat mendanai proyek, Anda dapat memilih opsi paket natura jika proyek menyediakan pembagian hasil panen.
              </p>
            </CardContent>
          </Card>
        ) : (
          naturaContributions.map((c) => {
            const pkg = c.naturaPackage!
            return (
              <Card key={c.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-[var(--color-success-600)]" />
                      <CardTitle className="text-[var(--text-h5)]">{pkg.name}</CardTitle>
                    </div>
                    <Badge variant="info">
                      Fase Proyek: {c.project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="p-3 bg-[var(--color-success-50)] rounded-[var(--radius-s)] border border-[var(--color-success-200)]">
                    <p className="text-[var(--text-body-s)] text-[var(--color-success-900)]">
                      {pkg.description}
                    </p>
                    <p className="text-[var(--text-caption)] text-[var(--color-success-700)] mt-1">
                      Proyek: <strong>{c.project.title}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Delivery Address */}
                    <div className="p-4 border border-[var(--color-neutral-200)] rounded-[var(--radius-m)] flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 font-[600] text-[var(--text-body-s)] text-[var(--color-neutral-900)] mb-1">
                          <MapPin className="w-4 h-4 text-[var(--color-neutral-500)]" /> Alamat Pengiriman Natura
                        </div>
                        <p className="text-[var(--text-body-s)] text-[var(--color-neutral-600)]">
                          Pastikan alamat lengkap Anda terdaftar sebelum masa panen.
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-fit"
                        onClick={() => {
                          const newAddr = prompt("Masukkan alamat lengkap pengiriman natura:")
                          if (newAddr) updateAddressMutation.mutate({ id: c.id, address: newAddr })
                        }}
                      >
                        Ubah Alamat Pengiriman
                      </Button>
                    </div>

                    {/* Delivery & Claim Status */}
                    <div className="p-4 border border-[var(--color-neutral-200)] rounded-[var(--radius-m)] flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 font-[600] text-[var(--text-body-s)] text-[var(--color-neutral-900)] mb-1">
                          <Truck className="w-4 h-4 text-[var(--color-neutral-500)]" /> Status Pengiriman
                        </div>
                        <p className="text-[var(--text-body-s)] text-[var(--color-neutral-600)]">
                          Pengiriman akan dilakukan setelah proyek memasuki fase <strong>NATURA_FULFILLMENT</strong>.
                        </p>
                      </div>
                      <Button
                        variant="tertiary"
                        size="sm"
                        className="w-fit text-[var(--color-error-600)]"
                        onClick={() => {
                          setSelectedContributionId(c.id)
                          setIsClaimModalOpen(true)
                        }}
                      >
                        Ajukan Klaim / Kendala Pengiriman
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Claim Modal */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle>Ajukan Klaim Natura</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Alert variant="warning">
                Klaim natura diajukan jika paket belum tiba, kemasan rusak, atau produk tidak sesuai standar.
              </Alert>
              <Textarea
                label="Jelaskan Kendala Pengiriman / Produk"
                placeholder="Rincikan masalah yang dialami..."
                value={claimNotes}
                onChange={(e) => setClaimNotes(e.target.value)}
                rows={4}
                required
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button variant="tertiary" onClick={() => setIsClaimModalOpen(false)}>
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (selectedContributionId && claimNotes) {
                    submitClaimMutation.mutate({ id: selectedContributionId, notes: claimNotes })
                  }
                }}
                isLoading={submitClaimMutation.isPending}
                disabled={!claimNotes}
              >
                Kirim Laporan Klaim
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
