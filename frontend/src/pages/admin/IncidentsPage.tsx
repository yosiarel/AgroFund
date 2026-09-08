import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { Incident } from "../../types"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Textarea } from "../../components/ui/Textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { CheckCircle, Snowflake, CheckCircle2, AlertTriangle, ShieldCheck, XCircle } from "lucide-react"

export function IncidentsPage() {
  const queryClient = useQueryClient()
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [actionType, setActionType] = useState<"APPROVE_EXTENSION" | "REJECT_EXTENSION" | "FREEZE" | null>(null)
  const [decisionNotes, setDecisionNotes] = useState("")

  const { data: incidents, isLoading } = useQuery<Incident[]>({
    queryKey: ["admin-incidents"],
    queryFn: () => api.get("/admin/incidents"),
  })

  const resolveMutation = useMutation({
    mutationFn: ({ incidentId, decision, approveExtension }: { incidentId: string; decision: string; approveExtension?: boolean }) =>
      api.post(`/admin/incidents/${incidentId}/resolve`, { decision, approveExtension }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-incidents"] })
      closeModal()
    },
  })

  const freezeMutation = useMutation({
    mutationFn: (projectId: string) =>
      api.post(`/admin/projects/${projectId}/freeze-funds`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-incidents"] })
      closeModal()
    },
  })

  const closeModal = () => {
    setSelectedIncident(null)
    setActionType(null)
    setDecisionNotes("")
  }

  const handleConfirmAction = () => {
    if (!selectedIncident || !actionType) return
    if (actionType === "FREEZE") {
      freezeMutation.mutate(selectedIncident.projectId)
    } else if (actionType === "APPROVE_EXTENSION") {
      resolveMutation.mutate({
        incidentId: selectedIncident.id,
        decision: decisionNotes.trim() || "Permohonan perpanjangan jadwal disetujui sesuai ketentuan.",
        approveExtension: true,
      })
    } else if (actionType === "REJECT_EXTENSION") {
      resolveMutation.mutate({
        incidentId: selectedIncident.id,
        decision: decisionNotes.trim() || "Permohonan perpanjangan jadwal ditolak.",
        approveExtension: false,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat insiden proyek..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
          Manajemen Risiko & Insiden Proyek
        </h1>
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">
          Tinjau laporan kendala kritis, persetujuan perpanjangan jadwal (Extension), dan opsi pembekuan dana proyek.
        </p>
      </div>

      <Alert variant="info" className="bg-[var(--color-primary-50)] border-[var(--color-primary-200)]">
        <div className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--color-primary-600)] flex-shrink-0" />
          <div className="text-[var(--text-body-m)] text-[var(--color-primary-900)]">
            <span className="font-[600]">Tata Kelola Risiko:</span> Permohonan perpanjangan waktu proyek maksimal 1x 90 hari. Pembekuan dana proyek hanya dilakukan jika terdapat indikasi fraud atau keadaan kahar berat.
          </div>
        </div>
      </Alert>

      <div className="flex flex-col gap-4">
        {(!incidents || incidents.length === 0) ? (
          <Card>
            <CardContent className="py-12 text-center text-[var(--color-neutral-600)]">
              <CheckCircle className="w-12 h-12 text-[var(--color-success-500)] mx-auto mb-2" />
              <p className="font-[600]">Tidak ada insiden yang memerlukan penanganan</p>
              <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)]">
                Seluruh proyek agrikultur berjalan dalam koridor resiko yang terkendali.
              </p>
            </CardContent>
          </Card>
        ) : (
          incidents.map((inc) => (
            <Card key={inc.id} className="border border-[var(--color-neutral-200)]">
              <CardHeader className="pb-3 border-b border-[var(--color-neutral-100)]">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[var(--text-h5)] flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-[var(--color-warning-600)]" />
                      {inc.project?.title || `Proyek #${inc.projectId.slice(0, 8)}`}
                    </CardTitle>
                    <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                      ID Insiden: {inc.id} • Dilaporkan: {new Date(inc.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <Badge variant={inc.status === "RESOLVED" ? "success" : "error"}>
                    {inc.status === "RESOLVED" ? "Selesai Ditangani" : "Memerlukan Penanganan Admin"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 pt-4">
                <div className="flex gap-2">
                  <Badge variant="default" className="text-[10px]">Kategori: {inc.category}</Badge>
                  <Badge variant={inc.severity === "HIGH" ? "error" : "warning"} className="text-[10px]">
                    Tingkat Keparahan: {inc.severity}
                  </Badge>
                </div>

                <p className="text-[var(--text-body-m)] text-[var(--color-neutral-800)] bg-[var(--color-neutral-50)] p-3 rounded-[var(--radius-s)] border border-[var(--color-neutral-100)]">
                  {inc.description}
                </p>

                {inc.requestedExtensionDays && (
                  <Alert variant="warning">
                    Permohonan Perpanjangan Jadwal: <strong>{inc.requestedExtensionDays} Hari Kalender</strong>
                  </Alert>
                )}

                {inc.decision && (
                  <div className="p-3 bg-[var(--color-success-50)] rounded-[var(--radius-s)] border border-[var(--color-success-200)] text-[var(--text-body-s)] text-[var(--color-success-900)]">
                    <span className="font-[600]">Keputusan Penanganan:</span> {inc.decision}
                  </div>
                )}

                {inc.status !== "RESOLVED" && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--color-neutral-100)]">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedIncident(inc)
                        setActionType("FREEZE")
                      }}
                    >
                      <Snowflake className="w-4 h-4 mr-1.5" /> Bekukan Sisa Dana (Freeze)
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedIncident(inc)
                          setActionType("REJECT_EXTENSION")
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1.5" /> Tolak Perpanjangan
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedIncident(inc)
                          setActionType("APPROVE_EXTENSION")
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Setujui Perpanjangan Waktu
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Structured Resolution Modal */}
      {selectedIncident && actionType && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle>
                {actionType === "FREEZE" && "Konfirmasi Pembekuan Dana Proyek"}
                {actionType === "APPROVE_EXTENSION" && "Persetujuan Perpanjangan Jadwal"}
                {actionType === "REJECT_EXTENSION" && "Penolakan Perpanjangan Jadwal"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-[var(--text-body-s)] text-[var(--color-neutral-700)]">
                Proyek: <strong>{selectedIncident.project?.title || selectedIncident.projectId}</strong>
              </p>

              {actionType === "FREEZE" && (
                <Alert variant="error">
                  Tindakan ini akan mengunci sisa dana pada Escrow proyek agar tidak dapat ditarik untuk pengadaan selama investigasi insiden berlangsung.
                </Alert>
              )}

              {actionType === "APPROVE_EXTENSION" && (
                <Alert variant="info">
                  Perpanjangan waktu sebesar <strong>{selectedIncident.requestedExtensionDays || 0} hari</strong> akan disetujui pada jadwal proyek.
                </Alert>
              )}

              {actionType !== "FREEZE" && (
                <Textarea
                  label="Catatan Keputusan Admin"
                  placeholder="Rincikan pertimbangan dan arahan tindak lanjut..."
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  rows={3}
                  required
                />
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button variant="tertiary" onClick={closeModal}>
                Batal
              </Button>
              <Button
                variant={actionType === "FREEZE" || actionType === "REJECT_EXTENSION" ? "destructive" : "primary"}
                onClick={handleConfirmAction}
                isLoading={resolveMutation.isPending || freezeMutation.isPending}
              >
                Konfirmasi Eksekusi
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}

