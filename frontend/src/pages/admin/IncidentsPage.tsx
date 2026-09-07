import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { Incident } from "../../types"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { CheckCircle, Snowflake, CheckCircle2 } from "lucide-react"

export function IncidentsPage() {
  const queryClient = useQueryClient()

  const { data: incidents, isLoading } = useQuery<Incident[]>({
    queryKey: ["admin-incidents"],
    queryFn: () => api.get("/admin/incidents"),
  })

  const resolveMutation = useMutation({
    mutationFn: ({ incidentId, decision, approveExtension }: { incidentId: string; decision: string; approveExtension?: boolean }) =>
      api.post(`/admin/incidents/${incidentId}/resolve`, { decision, approveExtension }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-incidents"] })
    },
  })

  const freezeMutation = useMutation({
    mutationFn: (projectId: string) =>
      api.post(`/admin/projects/${projectId}/freeze-funds`),
    onSuccess: () => {
      alert("Dana proyek berhasil dibekukan untuk investigasi.")
    },
  })

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
            <Card key={inc.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[var(--text-h5)]">
                      {inc.project?.title || `Proyek #${inc.projectId.slice(0, 8)}`}
                    </CardTitle>
                    <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                      Insiden #{inc.id.slice(0, 8)} • Dilaporkan: {new Date(inc.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <Badge variant={inc.status === "RESOLVED" ? "success" : "error"}>
                    {inc.status === "RESOLVED" ? "Selesai Ditangani" : "Memerlukan Penanganan"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <Badge variant="default" className="text-[10px]">Kategori: {inc.category}</Badge>
                  <Badge variant={inc.severity === "HIGH" ? "error" : "warning"} className="text-[10px]">
                    Tingkat Keparahan: {inc.severity}
                  </Badge>
                </div>

                <p className="text-[var(--text-body-m)] text-[var(--color-neutral-800)] bg-[var(--color-neutral-50)] p-3 rounded-[var(--radius-s)]">
                  {inc.description}
                </p>

                {inc.requestedExtensionDays && (
                  <Alert variant="warning">
                    Permohonan Perpanjangan Jadwal: <strong>{inc.requestedExtensionDays} Hari Kalender</strong>
                  </Alert>
                )}

                {inc.status !== "RESOLVED" && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--color-neutral-200)]">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("Bekukan sisa dana proyek ini untuk investigasi mendalam?")) {
                          freezeMutation.mutate(inc.projectId)
                        }
                      }}
                    >
                      <Snowflake className="w-4 h-4 mr-1.5" /> Bekukan Sisa Dana (Freeze)
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const dec = prompt("Catatan keputusan penolakan perpanjangan / rekomendasi:")
                          if (dec) resolveMutation.mutate({ incidentId: inc.id, decision: dec, approveExtension: false })
                        }}
                      >
                        Tolak Perpanjangan
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          const dec = prompt("Catatan persetujuan perpanjangan jadwal:")
                          if (dec) resolveMutation.mutate({ incidentId: inc.id, decision: dec, approveExtension: true })
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
    </div>
  )
}
