import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { Project, Milestone } from "../../types"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Textarea } from "../../components/ui/Textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { ArrowLeft, Clock, Upload, AlertTriangle } from "lucide-react"

export function ProjectExecutionPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: project, isLoading: isProjectLoading } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: () => api.get(`/projects/${projectId}`),
    enabled: !!projectId,
  })

  const { data: milestones, isLoading: isMilestonesLoading } = useQuery<Milestone[]>({
    queryKey: ["milestones", projectId],
    queryFn: () => api.get(`/projects/${projectId}/milestones`),
    enabled: !!projectId,
  })

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("")
  const [progressPercentage, setProgressPercentage] = useState<number>(50)
  const [reportDescription, setReportDescription] = useState("")
  const [evidenceUrl, setEvidenceUrl] = useState("")
  const [isReporting, setIsReporting] = useState(false)

  // Incident reporting state (PB-094)
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [incidentCategory, setIncidentCategory] = useState<"DELAY" | "DAMAGE" | "FRAUD" | "FORCE_MAJEURE">("DELAY")
  const [incidentSeverity, setIncidentSeverity] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM")
  const [incidentDescription, setIncidentDescription] = useState("")

  const reportProgressMutation = useMutation({
    mutationFn: () =>
      api.post(`/projects/${projectId}/milestones/${selectedMilestoneId}/reports`, {
        progressPercentage,
        description: reportDescription,
        evidenceUrl,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones", projectId] })
      setIsReporting(false)
      setReportDescription("")
      setEvidenceUrl("")
    },
  })

  const reportIncidentMutation = useMutation({
    mutationFn: () =>
      api.post(`/projects/${projectId}/incidents`, {
        category: incidentCategory,
        severity: incidentSeverity,
        description: incidentDescription,
      }),
    onSuccess: () => {
      setShowIncidentModal(false)
      setIncidentDescription("")
      alert("Laporan kendala/insiden berhasil dikirim ke Koperasi & Admin.")
    },
  })

  if (isProjectLoading || isMilestonesLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat eksekusi proyek..." />
      </div>
    )
  }

  if (!project) {
    return <Alert variant="error">Proyek tidak ditemukan.</Alert>
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="tertiary" className="px-2" onClick={() => navigate(`/umkm/projects/${projectId}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
              Eksekusi & Laporan Kemajuan
            </h1>
            <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">
              {project.title}
            </p>
          </div>
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowIncidentModal(true)}
        >
          <AlertTriangle className="w-4 h-4 mr-1.5" />
          Laporkan Kendala / Insiden
        </Button>
      </div>

      {/* SLA Notification (PB-091 & PB-094) */}
      <Alert variant="info" className="bg-[var(--color-primary-50)] border-[var(--color-primary-200)]">
        <div className="text-[var(--text-body-m)] text-[var(--color-primary-900)]">
          <span className="font-[600]">Jadwal Pelaporan Wajib (Doc 4 Sec 44):</span> UMKM wajib mengirimkan update progres minimal setiap 30 hari atau per penyelesaian milestone. Jika terjadi kendala material (cuaca, hama, dll), laporkan maksimal 3x24 jam sejak kejadian.
        </div>
      </Alert>

      {/* Progress Report Modal / Form */}
      {isReporting && (
        <Card className="border-2 border-[var(--color-primary-400)]">
          <CardHeader>
            <CardTitle>Kirim Laporan Progres Milestone</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <label className="text-[var(--text-label)] font-[500] text-[var(--color-neutral-800)] mb-1 block">
                Persentase Kemajuan: {progressPercentage}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercentage}
                onChange={(e) => setProgressPercentage(parseInt(e.target.value))}
                className="w-full h-2 bg-[var(--color-neutral-200)] rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <Textarea
              label="Deskripsi Progres Pekerjaan"
              placeholder="Jelaskan aktivitas lapangan yang telah diselesaikan pada tahapan ini..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              rows={4}
              required
            />

            <Input
              label="URL Bukti Foto / Dokumen Lapangan"
              placeholder="https://storage... atau link drive dokumentasi"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              helperText="Bukti foto kondisi lapangan akan diverifikasi oleh Koperasi."
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button variant="tertiary" onClick={() => setIsReporting(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={() => reportProgressMutation.mutate()}
              isLoading={reportProgressMutation.isPending}
              disabled={!reportDescription}
            >
              Kirim Laporan
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Milestone List */}
      <div className="flex flex-col gap-4">
        <h2 className="text-[var(--text-h4)] font-[600] text-[var(--color-neutral-900)]">
          Tahapan & Milestone Proyek
        </h2>

        {(!milestones || milestones.length === 0) ? (
          <Card>
            <CardContent className="py-12 text-center text-[var(--color-neutral-600)]">
              <Clock className="w-12 h-12 text-[var(--color-neutral-400)] mx-auto mb-2" />
              <p className="font-[600]">Belum ada milestone tercatat</p>
              <p className="text-[var(--text-body-s)]">Milestone akan digenerate otomatis berdasarkan timeline pelaksanaan proyek.</p>
            </CardContent>
          </Card>
        ) : (
          milestones.map((m, idx) => (
            <Card key={m.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] flex items-center justify-center font-[700] text-[var(--text-body-s)]">
                      {idx + 1}
                    </span>
                    <div>
                      <CardTitle className="text-[var(--text-h5)]">{m.name}</CardTitle>
                      <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                        Target Tanggal: {m.plannedDate ? new Date(m.plannedDate).toLocaleDateString("id-ID") : "Sesuai Jadwal"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={m.status === "COMPLETED" ? "success" : m.status === "IN_PROGRESS" ? "info" : "default"}>
                    {m.status === "COMPLETED" ? "Selesai" : m.status === "IN_PROGRESS" ? "Sedang Berjalan" : "Direncanakan"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {m.description && (
                  <p className="text-[var(--text-body-s)] text-[var(--color-neutral-700)]">{m.description}</p>
                )}

                {/* Progress Reports History */}
                {m.reports && m.reports.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2 p-3 bg-[var(--color-neutral-50)] rounded-[var(--radius-s)] border border-[var(--color-neutral-200)]">
                    <p className="text-[var(--text-caption)] font-[600] text-[var(--color-neutral-700)]">Riwayat Laporan:</p>
                    {m.reports.map((rep) => (
                      <div key={rep.id} className="text-[var(--text-body-s)] flex items-start justify-between gap-3 border-b border-[var(--color-neutral-200)] pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="font-[500] text-[var(--color-neutral-900)]">
                            Progres {rep.progressPercentage}%: {rep.description}
                          </p>
                          <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                            {new Date(rep.createdAt).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                        <Badge variant={rep.status === "VALIDATED" ? "success" : rep.status === "REJECTED" ? "error" : "warning"} className="text-[10px]">
                          {rep.status === "VALIDATED" ? "Tervalidasi" : rep.status === "REJECTED" ? "Perlu Revisi" : "Menunggu Verifikasi"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {m.status !== "COMPLETED" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-fit mt-2"
                    onClick={() => {
                      setSelectedMilestoneId(m.id)
                      setIsReporting(true)
                    }}
                  >
                    <Upload className="w-4 h-4 mr-1.5" /> Update Progres Lapangan
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Incident Modal (PB-094 & PB-109) */}
      {showIncidentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="text-[var(--color-error-700)] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Laporkan Kendala / Insiden
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <label className="text-[var(--text-label)] font-[500] mb-1 block">Kategori Kendala</label>
                <select
                  className="w-full px-3 py-2 border border-[var(--color-neutral-300)] rounded-[var(--radius-m)] text-[var(--text-body-m)] bg-white"
                  value={incidentCategory}
                  onChange={(e) => setIncidentCategory(e.target.value as any)}
                >
                  <option value="DELAY">Keterlambatan Jadwal (Cuaca/Logistik)</option>
                  <option value="DAMAGE">Kerusakan Fisik / Hama Tanaman</option>
                  <option value="FORCE_MAJEURE">Keadaan Kahar (Bencana Alam)</option>
                  <option value="FRAUD">Indikasi Masalah Pihak Ketiga</option>
                </select>
              </div>

              <div>
                <label className="text-[var(--text-label)] font-[500] mb-1 block">Tingkat Keparahan</label>
                <select
                  className="w-full px-3 py-2 border border-[var(--color-neutral-300)] rounded-[var(--radius-m)] text-[var(--text-body-m)] bg-white"
                  value={incidentSeverity}
                  onChange={(e) => setIncidentSeverity(e.target.value as any)}
                >
                  <option value="LOW">Rendah (Dapat terkejar tanpa perpanjangan)</option>
                  <option value="MEDIUM">Sedang (Memerlukan penyesuaian jadwal)</option>
                  <option value="HIGH">Tinggi (Beresiko gagal panen/gangguan besar)</option>
                </select>
              </div>

              <Textarea
                label="Detail Kronologi Kejadian"
                placeholder="Ceritakan apa yang terjadi, langkah mitigasi sementara yang diambil, dan estimasi dampaknya..."
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                rows={4}
                required
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button variant="tertiary" onClick={() => setShowIncidentModal(false)}>
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={() => reportIncidentMutation.mutate()}
                isLoading={reportIncidentMutation.isPending}
                disabled={!incidentDescription}
              >
                Kirim Laporan Insiden
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
