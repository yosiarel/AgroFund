import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { Incident, Project } from "../../types"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Textarea } from "../../components/ui/Textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { AlertTriangle, Plus, Calendar, ShieldCheck } from "lucide-react"

export function IncidentReportingPage() {
  const queryClient = useQueryClient()

  const { data: incidents, isLoading: isIncidentsLoading } = useQuery<Incident[]>({
    queryKey: ["koperasi-incidents"],
    queryFn: () => api.get("/koperasi/incidents"),
  })

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["koperasi-projects"],
    queryFn: () => api.get("/koperasi/projects"),
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [category, setCategory] = useState<"DELAY" | "DAMAGE" | "FRAUD" | "FORCE_MAJEURE">("DELAY")
  const [severity, setSeverity] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM")
  const [description, setDescription] = useState("")
  const [extensionDays, setExtensionDays] = useState<number>(0)

  const reportMutation = useMutation({
    mutationFn: () =>
      api.post(`/koperasi/incidents`, {
        projectId: selectedProjectId,
        category,
        severity,
        description,
        requestedExtensionDays: extensionDays > 0 ? extensionDays : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["koperasi-incidents"] })
      setIsModalOpen(false)
      setDescription("")
      setExtensionDays(0)
    },
  })

  if (isIncidentsLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat insiden dan permohonan perpanjangan..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
            Insiden & Permohonan Perpanjangan
          </h1>
          <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">
            Laporkan kendala operasional lapangan atau ajukan perpanjangan waktu proyek (maksimal 1x 90 hari).
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Buat Laporan Insiden / Perpanjangan
        </Button>
      </div>

      <Alert variant="info" className="bg-[var(--color-primary-50)] border-[var(--color-primary-200)]">
        <div className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--color-primary-600)] flex-shrink-0" />
          <div className="text-[var(--text-body-m)] text-[var(--color-primary-900)]">
            <span className="font-[600]">Ketentuan Perpanjangan:</span> Permohonan perpanjangan waktu proyek (Extension) hanya diperbolehkan maksimal 1 kali dengan durasi maksimal 90 hari kalender, serta memerlukan persetujuan Koperasi dan Admin AgroFund.
          </div>
        </div>
      </Alert>

      <div className="flex flex-col gap-4">
        {(!incidents || incidents.length === 0) ? (
          <Card>
            <CardContent className="py-12 text-center text-[var(--color-neutral-600)]">
              <AlertTriangle className="w-12 h-12 text-[var(--color-neutral-400)] mx-auto mb-2" />
              <p className="font-[600]">Tidak ada laporan insiden aktif</p>
              <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)]">
                Semua proyek berjalan normal tanpa kendala material yang dilaporkan.
              </p>
            </CardContent>
          </Card>
        ) : (
          incidents.map((inc) => (
            <Card key={inc.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-[var(--color-warning-600)]" />
                    <CardTitle className="text-[var(--text-h5)]">
                      {inc.project?.title || `Proyek #${inc.projectId.slice(0, 8)}`}
                    </CardTitle>
                  </div>
                  <Badge variant={inc.status === "RESOLVED" ? "success" : "warning"}>
                    {inc.status === "RESOLVED" ? "Selesai Ditinjau" : "Dalam Peninjauan Admin"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Badge variant="default" className="text-[10px]">Kategori: {inc.category}</Badge>
                  <Badge variant={inc.severity === "HIGH" ? "error" : "warning"} className="text-[10px]">
                    Tingkat: {inc.severity}
                  </Badge>
                </div>

                <p className="text-[var(--text-body-m)] text-[var(--color-neutral-800)] bg-[var(--color-neutral-50)] p-3 rounded-[var(--radius-s)]">
                  {inc.description}
                </p>

                {inc.requestedExtensionDays && (
                  <div className="flex items-center gap-2 text-[var(--text-body-s)] text-[var(--color-primary-700)] font-[600]">
                    <Calendar className="w-4 h-4" />
                    Permohonan Perpanjangan: {inc.requestedExtensionDays} Hari Kalender
                  </div>
                )}

                {inc.decision && (
                  <div className="p-3 bg-[var(--color-success-50)] rounded-[var(--radius-s)] border border-[var(--color-success-200)] text-[var(--text-body-s)] text-[var(--color-success-900)]">
                    <span className="font-[600]">Keputusan AgroFund:</span> {inc.decision}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle>Laporan Insiden / Perpanjangan Proyek</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <label className="text-[var(--text-label)] font-[500] mb-1 block">Pilih Proyek</label>
                <select
                  className="w-full px-3 py-2 border border-[var(--color-neutral-300)] rounded-[var(--radius-m)] text-[var(--text-body-m)] bg-white"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">-- Pilih Proyek Terkait --</option>
                  {projects?.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[var(--text-label)] font-[500] mb-1 block">Kategori</label>
                  <select
                    className="w-full px-3 py-2 border border-[var(--color-neutral-300)] rounded-[var(--radius-m)] text-[var(--text-body-m)] bg-white"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                  >
                    <option value="DELAY">Keterlambatan</option>
                    <option value="DAMAGE">Kerusakan Fisik/Hama</option>
                    <option value="FORCE_MAJEURE">Keadaan Kahar</option>
                    <option value="FRAUD">Masalah Pihak Ketiga</option>
                  </select>
                </div>
                <div>
                  <label className="text-[var(--text-label)] font-[500] mb-1 block">Tingkat</label>
                  <select
                    className="w-full px-3 py-2 border border-[var(--color-neutral-300)] rounded-[var(--radius-m)] text-[var(--text-body-m)] bg-white"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                  >
                    <option value="LOW">Rendah</option>
                    <option value="MEDIUM">Sedang</option>
                    <option value="HIGH">Tinggi</option>
                  </select>
                </div>
              </div>

              <Input
                label="Permohonan Perpanjangan Waktu (Hari, Maks. 90)"
                type="number"
                min="0"
                max="90"
                value={extensionDays || ""}
                onChange={(e) => setExtensionDays(Math.min(90, parseInt(e.target.value) || 0))}
                helperText="Isi 0 jika tidak memerlukan perpanjangan waktu."
              />

              <Textarea
                label="Detail Deskripsi & Kronologi"
                placeholder="Rincikan fakta kejadian, langkah mitigasi yang disiapkan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button variant="tertiary" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={() => reportMutation.mutate()}
                isLoading={reportMutation.isPending}
                disabled={!selectedProjectId || !description}
              >
                Kirim Laporan
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
