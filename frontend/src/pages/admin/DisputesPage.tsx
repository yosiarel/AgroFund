import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { Dispute } from "../../types"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Textarea } from "../../components/ui/Textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Modal } from "../../components/ui/Modal"
import { CheckCircle } from "lucide-react"

export function DisputesPage() {
  const queryClient = useQueryClient()
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [resolutionText, setResolutionText] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)

  const { data: disputes, isLoading } = useQuery<Dispute[]>({
    queryKey: ["admin-disputes"],
    queryFn: () => api.get("/admin/disputes"),
  })

  const resolveMutation = useMutation({
    mutationFn: ({ disputeId, resolutionNotes }: { disputeId: string; resolutionNotes: string }) =>
      api.post(`/admin/disputes/${disputeId}/resolve`, { resolutionNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-disputes"] })
      setSelectedDispute(null)
      setResolutionText("")
      setFeedback("Pengaduan berhasil diselesaikan dan status telah diperbarui.")
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat sengketa & pengaduan..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
          Manajemen Sengketa & Pengaduan (Dispute Resolution)
        </h1>
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">
          Penyelesaian keluhan pendana, masalah pemenuhan natura, dan audit ketidaksesuaian operasional.
        </p>
      </div>

      {feedback && (
        <Alert variant="success" onClose={() => setFeedback(null)}>
          {feedback}
        </Alert>
      )}

      <div className="flex flex-col gap-4">
        {(!disputes || disputes.length === 0) ? (
          <Card>
            <CardContent className="py-12 text-center text-[var(--color-neutral-600)]">
              <CheckCircle className="w-12 h-12 text-[var(--color-success-500)] mx-auto mb-2" />
              <p className="font-[600]">Tidak ada sengketa yang belum diselesaikan</p>
              <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)]">
                Seluruh pengaduan dan keluhan pengguna telah diselesaikan dengan baik.
              </p>
            </CardContent>
          </Card>
        ) : (
          disputes.map((d) => (
            <Card key={d.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[var(--text-h5)]">
                      {d.category} — {d.project?.title || "Proyek Pertanian"}
                    </CardTitle>
                    <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                      Pelapor: {d.submittedBy?.name || "Pengguna"} ({d.submittedBy?.role || "PENDANA"}) • {new Date(d.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <Badge variant={d.status === "RESOLVED" ? "success" : "warning"}>
                    {d.status === "RESOLVED" ? "Terselesaikan" : "Menunggu Resolusi Admin"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-[var(--text-body-m)] text-[var(--color-neutral-800)] bg-[var(--color-neutral-50)] p-3 rounded-[var(--radius-s)]">
                  {d.description}
                </p>

                {d.resolutionNotes ? (
                  <div className="p-3 bg-[var(--color-success-50)] rounded-[var(--radius-s)] border border-[var(--color-success-200)] text-[var(--text-body-s)] text-[var(--color-success-900)]">
                    <span className="font-[600]">Catatan Penyelesaian:</span> {d.resolutionNotes}
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedDispute(d)}
                      disabled={resolveMutation.isPending}
                    >
                      Selesaikan Pengaduan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resolve Modal */}
      {selectedDispute && (
        <Modal
          isOpen={!!selectedDispute}
          onClose={() => {
            setSelectedDispute(null)
            setResolutionText("")
          }}
          title="Tindak Lanjut & Resolusi Sengketa"
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="tertiary"
                onClick={() => {
                  setSelectedDispute(null)
                  setResolutionText("")
                }}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                disabled={!resolutionText.trim()}
                onClick={() =>
                  resolveMutation.mutate({
                    disputeId: selectedDispute.id,
                    resolutionNotes: resolutionText.trim(),
                  })
                }
                isLoading={resolveMutation.isPending}
              >
                Simpan Resolusi
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            <p className="text-[var(--text-body-m)] text-[var(--color-neutral-800)]">
              Kategori: <strong>{selectedDispute.category}</strong>
            </p>
            <p className="text-[var(--text-body-s)] text-[var(--color-neutral-600)]">
              Deskripsi Pengaduan: {selectedDispute.description}
            </p>
            <Textarea
              label="Catatan Solusi / Tindakan Penyelesaian"
              placeholder="Rincikan mediasi atau kesepakatan kompensasi yang telah disepakati..."
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              rows={4}
              required
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
