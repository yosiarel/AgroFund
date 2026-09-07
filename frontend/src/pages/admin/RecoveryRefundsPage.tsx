import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { Project } from "../../types"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { formatRupiah } from "../../components/business/FinancialSummary"
import { RefreshCw, ShieldCheck, CheckCircle2 } from "lucide-react"

export function RecoveryRefundsPage() {
  const queryClient = useQueryClient()

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["admin-recovery-projects"],
    queryFn: () => api.get("/admin/projects"),
  })

  const failedOrClosingProjects = projects?.filter(
    (p) => p.status === "GAGAL_DITUTUP" || p.status === "SUKSES_DITUTUP" || p.status === "NATURA_FULFILLMENT"
  )

  const processRefundMutation = useMutation({
    mutationFn: (projectId: string) =>
      api.post(`/admin/projects/${projectId}/process-refund`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-recovery-projects"] })
      alert("Proses kalkulasi dan pencairan pro-rata refund pendana berhasil dieksekusi.")
    },
  })

  const releaseGuaranteeMutation = useMutation({
    mutationFn: (projectId: string) =>
      api.post(`/admin/projects/${projectId}/release-guarantee`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-recovery-projects"] })
      alert("Pengembalian Guarantee 100% ke rekening UMKM berhasil diproses.")
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat data recovery & refund..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
          Pemulihan Dana (Recovery), Refund & Penutupan Proyek
        </h1>
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">
          Kelola pencairan pengembalian Guarantee untuk proyek sukses, atau eksekusi Pro-rata Refund dari Recovery Pool untuk proyek yang dibatalkan/gagal.
        </p>
      </div>

      <Alert variant="info" className="bg-[var(--color-primary-50)] border-[var(--color-primary-200)]">
        <div className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--color-primary-600)] flex-shrink-0" />
          <div className="text-[var(--text-body-m)] text-[var(--color-primary-900)]">
            <span className="font-[600]">Integritas Pro-Rata (EP-11):</span>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li><strong>Proyek Sukses Ditutup:</strong> Guarantee 5% BPC dikembalikan utuh ke rekening UMKM yang terverifikasi.</li>
              <li><strong>Proyek Dibatalkan / Gagal:</strong> Sisa dana pengadaan yang belum terpakai + likuidasi Guarantee digabungkan ke Recovery Pool dan dibagikan secara adil (pro-rata) kepada seluruh Pendana.</li>
            </ul>
          </div>
        </div>
      </Alert>

      <div className="flex flex-col gap-4">
        {(!failedOrClosingProjects || failedOrClosingProjects.length === 0) ? (
          <Card>
            <CardContent className="py-12 text-center text-[var(--color-neutral-600)]">
              <RefreshCw className="w-12 h-12 text-[var(--color-neutral-400)] mx-auto mb-2" />
              <p className="font-[600]">Tidak ada proyek dalam antrean closing atau recovery</p>
              <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)]">
                Semua proyek yang selesai telah diproses pengembalian jaminan dan refund-nya.
              </p>
            </CardContent>
          </Card>
        ) : (
          failedOrClosingProjects.map((proj) => (
            <Card key={proj.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[var(--text-h5)]">{proj.title}</CardTitle>
                    <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                      UMKM: {proj.user?.name} • ID Proyek: {proj.id}
                    </p>
                  </div>
                  <Badge variant={proj.status === "SUKSES_DITUTUP" ? "success" : "error"}>
                    {proj.status === "SUKSES_DITUTUP" ? "Sukses Ditutup" : "Gagal / Dibatalkan"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-[var(--color-neutral-50)] rounded-[var(--radius-s)] border border-[var(--color-neutral-200)] text-[var(--text-body-s)]">
                  <div>
                    <p className="text-[var(--color-neutral-500)]">Total Target Terdanai</p>
                    <p className="font-[600] text-[var(--color-neutral-900)]">{formatRupiah(proj.fundedAmount || proj.totalTarget)}</p>
                  </div>
                  <div>
                    <p className="text-[var(--color-neutral-500)]">Nilai Jaminan (Guarantee 5%)</p>
                    <p className="font-[600] text-[var(--color-primary-700)]">{formatRupiah(proj.basicProcurementCapital * 0.05)}</p>
                  </div>
                  <div>
                    <p className="text-[var(--color-neutral-500)]">Status Jaminan</p>
                    <p className="font-[600] text-[var(--color-neutral-900)]">HELD (Tersimpan di Escrow)</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  {proj.status === "SUKSES_DITUTUP" ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => releaseGuaranteeMutation.mutate(proj.id)}
                      disabled={releaseGuaranteeMutation.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Kembalikan Guarantee ke Rekening UMKM
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => processRefundMutation.mutate(proj.id)}
                      disabled={processRefundMutation.isPending}
                    >
                      <RefreshCw className="w-4 h-4 mr-1.5" /> Eksekusi Pro-rata Refund ke Pendana
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
