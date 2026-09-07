import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../lib/axios"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Modal } from "../../components/ui/Modal"
import { CheckCircle2, XCircle, FileImage, ShieldCheck, ExternalLink, Filter, User, Flag } from "lucide-react"

export function EvidenceReviewPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SUBMITTED" | "VALIDATED" | "REJECTED">("ALL")
  const [confirmAction, setConfirmAction] = useState<{
    reportId: string;
    status: "VALIDATED" | "REJECTED";
    projectTitle: string;
    milestoneName: string;
    progressPercentage: number;
  } | null>(null)

  const { data: reports, isLoading } = useQuery<any[]>({
    queryKey: ["koperasi-evidence-reports"],
    queryFn: () => api.get("/koperasi/evidence-reports"),
  })

  const validateMutation = useMutation({
    mutationFn: ({ reportId, status }: { reportId: string; status: "VALIDATED" | "REJECTED" }) =>
      api.post(`/koperasi/evidence-reports/${reportId}/review`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["koperasi-evidence-reports"] })
      setConfirmAction(null)
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat bukti lapangan..." />
      </div>
    )
  }

  const filteredReports = (reports || []).filter((rep) => {
    if (statusFilter === "ALL") return true
    return rep.status === statusFilter
  })

  const pendingCount = (reports || []).filter((r) => r.status === "SUBMITTED").length
  const validatedCount = (reports || []).filter((r) => r.status === "VALIDATED").length
  const rejectedCount = (reports || []).filter((r) => r.status === "REJECTED").length

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
          Verifikasi Evidence & Laporan Lapangan
        </h1>
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">
          Tinjau dokumentasi foto, nota pembelian, dan laporan progres milestone dari proyek binaan UMKM.
        </p>
      </div>

      <Alert variant="info" className="bg-[var(--color-primary-50)] border-[var(--color-primary-200)]">
        <div className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--color-primary-600)] flex-shrink-0" />
          <div className="text-[var(--text-body-m)] text-[var(--color-primary-900)]">
            <span className="font-[600]">Prinsip Verifikasi Faktual (BL-006 & PB-148):</span> Unggah bukti (Upload Evidence) tidak otomatis berarti tervalidasi. Koperasi wajib melakukan pengecekan faktual kondisi fisik sebelum menandai laporan sebagai tervalidasi.
          </div>
        </div>
      </Alert>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-neutral-200)] pb-2 flex-wrap">
        <div className="flex items-center gap-1.5 mr-2 text-[var(--text-caption)] font-[600] text-[var(--color-neutral-500)]">
          <Filter className="w-3.5 h-3.5" /> Filter Status:
        </div>
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`px-3 py-1.5 text-[var(--text-body-s)] font-[500] rounded-[var(--radius-s)] transition-colors ${
            statusFilter === "ALL"
              ? "bg-[var(--color-primary-600)] text-white"
              : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-200)]"
          }`}
        >
          Semua ({reports?.length || 0})
        </button>
        <button
          onClick={() => setStatusFilter("SUBMITTED")}
          className={`px-3 py-1.5 text-[var(--text-body-s)] font-[500] rounded-[var(--radius-s)] transition-colors ${
            statusFilter === "SUBMITTED"
              ? "bg-[var(--color-warning-500)] text-white"
              : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-200)]"
          }`}
        >
          Menunggu Verifikasi ({pendingCount})
        </button>
        <button
          onClick={() => setStatusFilter("VALIDATED")}
          className={`px-3 py-1.5 text-[var(--text-body-s)] font-[500] rounded-[var(--radius-s)] transition-colors ${
            statusFilter === "VALIDATED"
              ? "bg-[var(--color-success-600)] text-white"
              : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-200)]"
          }`}
        >
          Tervalidasi ({validatedCount})
        </button>
        <button
          onClick={() => setStatusFilter("REJECTED")}
          className={`px-3 py-1.5 text-[var(--text-body-s)] font-[500] rounded-[var(--radius-s)] transition-colors ${
            statusFilter === "REJECTED"
              ? "bg-[var(--color-error-600)] text-white"
              : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-200)]"
          }`}
        >
          Perlu Revisi ({rejectedCount})
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-[var(--color-neutral-600)]">
              <FileImage className="w-12 h-12 text-[var(--color-neutral-400)] mx-auto mb-2" />
              <p className="font-[600]">Tidak ada bukti laporan pada kategori ini</p>
              <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)] mt-1">
                {statusFilter === "SUBMITTED"
                  ? "Semua laporan progres telah ditinjau dan diverifikasi."
                  : "Belum ada riwayat laporan dengan status yang dipilih."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((rep) => {
            const projectTitle = rep.milestone?.project?.title || "Proyek Agrikultur"
            const umkmName = rep.milestone?.project?.user?.name || "Petani Binaan"
            const milestoneName = rep.milestone?.name || "Milestone Terkait"

            return (
              <Card key={rep.id} className="border border-[var(--color-neutral-200)] hover:shadow-[var(--shadow-e1)] transition-shadow">
                <CardHeader className="pb-3 border-b border-[var(--color-neutral-100)]">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--text-caption)] font-[700] text-[var(--color-primary-700)] bg-[var(--color-primary-50)] px-2 py-0.5 rounded">
                          {projectTitle}
                        </span>
                        <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)] flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> {umkmName}
                        </span>
                      </div>
                      <CardTitle className="text-[var(--text-h5)] flex items-center gap-2 mt-1">
                        <Flag className="w-4 h-4 text-[var(--color-primary-600)]" />
                        {milestoneName} — Kemajuan: {rep.progressPercentage}%
                      </CardTitle>
                      <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                        Laporan dikirim: {new Date(rep.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
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
                        ? "Tervalidasi Faktual"
                        : rep.status === "REJECTED"
                        ? "Perlu Revisi Bukti"
                        : "Menunggu Verifikasi Koperasi"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pt-4">
                  <div>
                    <p className="text-[var(--text-caption)] font-[600] text-[var(--color-neutral-600)] mb-1">
                      Deskripsi Realisasi Lapangan:
                    </p>
                    <p className="text-[var(--text-body-m)] text-[var(--color-neutral-800)] bg-[var(--color-neutral-50)] p-3 rounded-[var(--radius-s)] border border-[var(--color-neutral-100)]">
                      {rep.description}
                    </p>
                  </div>

                  {rep.evidenceUrl && (
                    <div className="flex items-center justify-between p-3 bg-[var(--color-primary-50)]/50 rounded-[var(--radius-s)] border border-[var(--color-primary-100)] flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <FileImage className="w-4 h-4 text-[var(--color-primary-700)]" />
                        <span className="text-[var(--text-body-s)] font-[600] text-[var(--color-primary-900)]">
                          Dokumentasi Foto / Nota Lapangan
                        </span>
                      </div>
                      <a
                        href={rep.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--text-body-s)] text-[var(--color-primary-700)] font-[600] hover:underline flex items-center gap-1.5"
                      >
                        Buka & Periksa Bukti <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {rep.status === "SUBMITTED" && (
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--color-neutral-100)] flex-wrap gap-2">
                      <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] italic">
                        Pastikan bukti fisik sesuai dengan kemajuan {rep.progressPercentage}% yang dilaporkan.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setConfirmAction({
                              reportId: rep.id,
                              status: "REJECTED",
                              projectTitle,
                              milestoneName,
                              progressPercentage: rep.progressPercentage,
                            })
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Minta Revisi Bukti
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setConfirmAction({
                              reportId: rep.id,
                              status: "VALIDATED",
                              projectTitle,
                              milestoneName,
                              progressPercentage: rep.progressPercentage,
                            })
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Validasi Faktual
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <Modal
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          title={
            confirmAction.status === "VALIDATED"
              ? "Konfirmasi Validasi Faktual Evidence"
              : "Konfirmasi Permintaan Revisi Bukti"
          }
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button variant="tertiary" onClick={() => setConfirmAction(null)}>
                Batal
              </Button>
              <Button
                variant={confirmAction.status === "VALIDATED" ? "primary" : "destructive"}
                onClick={() =>
                  validateMutation.mutate({
                    reportId: confirmAction.reportId,
                    status: confirmAction.status,
                  })
                }
                isLoading={validateMutation.isPending}
              >
                {confirmAction.status === "VALIDATED" ? "Ya, Validasi Bukti Faktual" : "Ya, Minta Revisi"}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            <p className="text-[var(--text-body-m)] text-[var(--color-neutral-800)]">
              Proyek: <strong>{confirmAction.projectTitle}</strong>
            </p>
            <p className="text-[var(--text-body-s)] text-[var(--color-neutral-600)]">
              Milestone: <strong>{confirmAction.milestoneName}</strong> ({confirmAction.progressPercentage}% progress)
            </p>

            {confirmAction.status === "VALIDATED" ? (
              <Alert variant="success">
                Anda menyatakan telah memeriksa bukti foto/nota fisik di lapangan dan mengonfirmasi kebenaran kemajuan pelaksanaan proyek.
              </Alert>
            ) : (
              <Alert variant="warning">
                Laporan ini akan ditolak dan dikembalikan ke UMKM untuk dilakukan perbaikan dan pengunggahan ulang dokumentasi bukti lapangan.
              </Alert>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

