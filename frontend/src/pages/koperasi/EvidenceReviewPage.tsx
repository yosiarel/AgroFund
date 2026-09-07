import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { ProgressReport } from "../../types"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { CheckCircle2, XCircle, FileImage, ShieldCheck, ExternalLink } from "lucide-react"

export function EvidenceReviewPage() {
  const queryClient = useQueryClient()

  const { data: reports, isLoading } = useQuery<ProgressReport[]>({
    queryKey: ["koperasi-evidence-reports"],
    queryFn: () => api.get("/koperasi/evidence-reports"),
  })

  const validateMutation = useMutation({
    mutationFn: ({ reportId, status }: { reportId: string; status: "VALIDATED" | "REJECTED" }) =>
      api.post(`/koperasi/evidence-reports/${reportId}/review`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["koperasi-evidence-reports"] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat bukti lapangan..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
          Verifikasi Evidence & Laporan Lapangan
        </h1>
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">
          Tinjau dokumentasi foto, nota pembelian, dan laporan progres milestone dari UMKM.
        </p>
      </div>

      <Alert variant="info" className="bg-[var(--color-primary-50)] border-[var(--color-primary-200)]">
        <div className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--color-primary-600)] flex-shrink-0" />
          <div className="text-[var(--text-body-m)] text-[var(--color-primary-900)]">
            <span className="font-[600]">Prinsip Verifikasi (BL-006):</span> Unggah bukti (Upload Evidence) tidak otomatis berarti tervalidasi. Koperasi wajib melakukan pengecekan faktual sebelum menandai laporan sebagai tervalidasi.
          </div>
        </div>
      </Alert>

      <div className="flex flex-col gap-4">
        {(!reports || reports.length === 0) ? (
          <Card>
            <CardContent className="py-12 text-center text-[var(--color-neutral-600)]">
              <FileImage className="w-12 h-12 text-[var(--color-neutral-400)] mx-auto mb-2" />
              <p className="font-[600]">Tidak ada bukti laporan yang menunggu verifikasi</p>
              <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)]">
                Semua dokumentasi milestone yang diunggah UMKM telah ditinjau.
              </p>
            </CardContent>
          </Card>
        ) : (
          reports.map((rep) => (
            <Card key={rep.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[var(--text-h5)]">
                      Laporan Kemajuan: {rep.progressPercentage}%
                    </CardTitle>
                    <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                      Dikirim: {new Date(rep.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <Badge
                    variant={
                      rep.status === "VALIDATED"
                        ? "success"
                        : rep.status === "REJECTED"
                        ? "error"
                        : "warning"
                    }
                  >
                    {rep.status === "VALIDATED"
                      ? "Tervalidasi"
                      : rep.status === "REJECTED"
                      ? "Ditolak / Revisi"
                      : "Menunggu Verifikasi"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-[var(--text-body-m)] text-[var(--color-neutral-800)] bg-[var(--color-neutral-50)] p-3 rounded-[var(--radius-s)]">
                  {rep.description}
                </p>

                {rep.evidenceUrl && (
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-caption)] font-[600] text-[var(--color-neutral-600)]">Dokumentasi:</span>
                    <a
                      href={rep.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--text-body-s)] text-[var(--color-primary-600)] font-[500] hover:underline flex items-center gap-1"
                    >
                      Buka Tautan Bukti Foto / Video Lapangan <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {rep.status === "SUBMITTED" && (
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => validateMutation.mutate({ reportId: rep.id, status: "REJECTED" })}
                      disabled={validateMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Minta Revisi Bukti
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => validateMutation.mutate({ reportId: rep.id, status: "VALIDATED" })}
                      disabled={validateMutation.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Validasi Bukti Faktual
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
