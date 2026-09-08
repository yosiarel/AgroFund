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
import { ProjectStatusBadge } from "../../components/business/ProjectStatusBadge"
import { formatRupiah } from "../../components/business/FinancialSummary"
import {
  ArrowLeft,
  Clock,
  Upload,
  AlertTriangle,
  Plus,
  Calendar,
  Activity,
  WalletCards,
  FileCheck2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react"

interface ProjectSchedule {
  projectId: string;
  status: string;
  fundingCompletedAt: string | null;
  executionStartedAt: string | null;
  outputAvailableAt: string | null;
  initialReportDueDate: string | null;
  executionReportDueDate: string | null;
  finalReportDueDate: string | null;
  nextMilestonePlannedDate: string | null;
  lastReportAt: string | null;
  isOverdue: boolean;
  reportingCondition: string;
  scheduleRules: {
    initialReport: string;
    executionReport: string;
    finalReport: string;
  };
}

interface ProjectFinancials {
  projectId: string;
  allocatedAmount: string;
  usedAmount: string;
  remainingBalance: string;
}

interface ProjectMonitoring {
  projectId: string;
  title: string;
  status: string;
  executionHealth: "NORMAL" | "DELAYED" | "AT_RISK";
  overallProgressPercentage: number;
  milestoneSummary: {
    total: number;
    completed: number;
  };
  incidentsCount: number;
  procurementRequestsCount: number;
  roleView: string;
}

export function ProjectExecutionPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Queries
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

  const { data: schedule } = useQuery<ProjectSchedule>({
    queryKey: ["schedule", projectId],
    queryFn: () => api.get(`/projects/${projectId}/schedule`),
    enabled: !!projectId,
  })

  const { data: financials } = useQuery<ProjectFinancials>({
    queryKey: ["financials", projectId],
    queryFn: () => api.get(`/projects/${projectId}/financials`),
    enabled: !!projectId,
  })

  const { data: monitoring } = useQuery<ProjectMonitoring>({
    queryKey: ["monitoring", projectId],
    queryFn: () => api.get(`/projects/${projectId}/monitoring`),
    enabled: !!projectId,
  })

  // State: Progress Report (PB-090)
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [progressPercentage, setProgressPercentage] = useState<number>(50)
  const [reportDescription, setReportDescription] = useState("")
  const [evidenceUrl, setEvidenceUrl] = useState("")

  // State: Milestone Creation (PB-089)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [newMilestoneName, setNewMilestoneName] = useState("")
  const [newMilestonePlannedDate, setNewMilestonePlannedDate] = useState("")
  const [newMilestoneDesc, setNewMilestoneDesc] = useState("")

  // State: Incident Reporting (PB-094)
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [incidentCategory, setIncidentCategory] = useState<"DELAY" | "DAMAGE" | "FRAUD" | "FORCE_MAJEURE">("DELAY")
  const [incidentSeverity, setIncidentSeverity] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM")
  const [incidentDescription, setIncidentDescription] = useState("")

  // Mutations
  const createMilestoneMutation = useMutation({
    mutationFn: () =>
      api.post(`/projects/${projectId}/milestones`, {
        name: newMilestoneName,
        description: newMilestoneDesc || undefined,
        plannedDate: newMilestonePlannedDate || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones", projectId] })
      queryClient.invalidateQueries({ queryKey: ["schedule", projectId] })
      queryClient.invalidateQueries({ queryKey: ["monitoring", projectId] })
      setShowMilestoneModal(false)
      setNewMilestoneName("")
      setNewMilestonePlannedDate("")
      setNewMilestoneDesc("")
    },
  })

  const reportProgressMutation = useMutation({
    mutationFn: () =>
      api.post(`/projects/${projectId}/milestones/${selectedMilestone?.id}/reports`, {
        progressPercentage,
        description: reportDescription,
        evidenceUrl: evidenceUrl || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones", projectId] })
      queryClient.invalidateQueries({ queryKey: ["schedule", projectId] })
      queryClient.invalidateQueries({ queryKey: ["monitoring", projectId] })
      setSelectedMilestone(null)
      setReportDescription("")
      setEvidenceUrl("")
      setProgressPercentage(50)
    },
  })

  const [incidentFeedback, setIncidentFeedback] = useState<string | null>(null)

  const reportIncidentMutation = useMutation({
    mutationFn: () =>
      api.post(`/projects/${projectId}/incidents`, {
        category: incidentCategory,
        severity: incidentSeverity,
        description: incidentDescription,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring", projectId] })
      setShowIncidentModal(false)
      setIncidentDescription("")
      setIncidentFeedback("Laporan kendala material berhasil dicatat dan sedang ditinjau Koperasi & Admin.")
    },
  })

  if (isProjectLoading || isMilestonesLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat data eksekusi & kemajuan proyek..." />
      </div>
    )
  }

  if (!project) {
    return <Alert variant="error">Proyek tidak ditemukan.</Alert>
  }

  // Health display helpers
  const healthConfig = {
    NORMAL: { label: "Kondisi Normal / Terkendali", badgeVariant: "success" as const, color: "text-[var(--color-success-700)]" },
    DELAYED: { label: "Terdapat Kendala Ringan", badgeVariant: "warning" as const, color: "text-[var(--color-warning-700)]" },
    AT_RISK: { label: "Perlu Perhatian Khusus", badgeVariant: "risk" as const, color: "text-[var(--color-warning-800)]" },
  }
  const currentHealth = monitoring?.executionHealth ? healthConfig[monitoring.executionHealth] : healthConfig.NORMAL

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {incidentFeedback && (
        <Alert variant="success" onClose={() => setIncidentFeedback(null)}>
          {incidentFeedback}
        </Alert>
      )}

      {/* ── 1. HEADER & ACTIONS ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-[var(--color-neutral-200)]">
        <div className="flex items-center gap-3">
          <Button variant="tertiary" className="px-2" onClick={() => navigate(`/umkm/projects/${projectId}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ProjectStatusBadge status={project.status} size="sm" />
              <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                Koperasi: {project.koperasi?.name || "Koperasi Terverifikasi"}
              </span>
            </div>
            <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
              Eksekusi & Laporan Kemajuan
            </h1>
            <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">
              {project.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowMilestoneModal(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Milestone
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowIncidentModal(true)}
          >
            <AlertTriangle className="w-4 h-4 mr-1.5" />
            Laporkan Kendala
          </Button>
        </div>
      </div>

      {/* ── 2. EXECUTIVE OVERVIEW (3-CARD GRID: PB-093, PB-091, PB-095) ───── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Monitoring & Execution Health (PB-093) */}
        <Card className="p-4 bg-[var(--color-neutral-50)] border-[var(--color-neutral-200)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-caption)] font-[600] text-[var(--color-neutral-600)] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[var(--color-primary-600)]" />
                Status Pelaksanaan
              </span>
              <Badge variant={currentHealth.badgeVariant}>
                {currentHealth.label}
              </Badge>
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[var(--text-body-s)] font-[500] text-[var(--color-neutral-700)]">Total Kemajuan</span>
                <span className="text-[var(--text-h3)] font-[700] text-[var(--color-primary-700)]">
                  {monitoring?.overallProgressPercentage ?? 0}%
                </span>
              </div>
              <div className="w-full bg-[var(--color-neutral-200)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--color-primary-600)] h-full transition-all duration-300"
                  style={{ width: `${monitoring?.overallProgressPercentage ?? 0}%` }}
                />
              </div>
            </div>
          </div>
          <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] mt-3">
            {monitoring?.milestoneSummary.completed ?? 0} dari {monitoring?.milestoneSummary.total ?? (milestones?.length || 0)} Milestone terselesaikan
          </p>
        </Card>

        {/* Card 2: Reporting Schedule & Deadline (PB-091) */}
        <Card className={`p-4 flex flex-col justify-between ${schedule?.isOverdue ? "bg-[var(--color-warning-50)] border-[var(--color-warning-300)]" : "bg-[var(--color-primary-50)] border-[var(--color-primary-200)]"}`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-caption)] font-[600] text-[var(--color-primary-900)] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[var(--color-primary-600)]" />
                Jadwal Laporan Wajib
              </span>
              {schedule?.isOverdue ? (
                <span className="px-2 py-0.5 rounded text-white bg-red-600 text-[10px] font-[700] uppercase">
                  Terlambat
                </span>
              ) : (
                <Badge variant="info">
                  Tepat Waktu
                </Badge>
              )}
            </div>
            <p className="text-[var(--text-caption)] text-[var(--color-neutral-600)]">Batas Laporan Berikutnya:</p>
            <p className="text-[var(--text-body-l)] font-[700] text-[var(--color-neutral-900)] mt-0.5">
              {schedule?.executionReportDueDate
                ? new Date(schedule.executionReportDueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                : "Belum dijadwalkan"}
            </p>
          </div>
          <p className="text-[var(--text-caption)] text-[var(--color-neutral-600)] mt-2">
            {schedule?.nextMilestonePlannedDate
              ? "Tenggat ditentukan oleh target Milestone terdekat."
              : "Tenggat ditentukan oleh siklus berkala 30 hari kalender."}
          </p>
        </Card>

        {/* Card 3: Project Financial Visibility (PB-095) */}
        <Card className="p-4 bg-[var(--color-neutral-50)] border-[var(--color-neutral-200)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-caption)] font-[600] text-[var(--color-neutral-600)] flex items-center gap-1.5">
                <WalletCards className="w-4 h-4 text-[var(--color-primary-600)]" />
                Alokasi Proyek
              </span>
              <span className="text-[10px] font-[600] px-1.5 py-0.5 rounded bg-[var(--color-neutral-200)] text-[var(--color-neutral-700)]">
                Buku Besar
              </span>
            </div>
            <div className="flex flex-col gap-1 text-[var(--text-body-s)]">
              <div className="flex justify-between">
                <span className="text-[var(--color-neutral-500)]">Modal (BPC):</span>
                <span className="font-[600] text-[var(--color-neutral-800)]">
                  {formatRupiah(Number(financials?.allocatedAmount || project.basicProcurementCapital || 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-neutral-500)]">Dana Terpakai:</span>
                <span className="font-[600] text-[var(--color-neutral-800)]">
                  {formatRupiah(Number(financials?.usedAmount || 0))}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[var(--color-neutral-200)]">
                <span className="font-[500] text-[var(--color-primary-900)]">Sisa Alokasi:</span>
                <span className="font-[700] text-[var(--color-primary-700)]">
                  {formatRupiah(Number(financials?.remainingBalance || 0))}
                </span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-[var(--color-neutral-500)] mt-2">
            Non-Wallet: Dana dikelola escrow & dibayarkan langsung ke Supplier.
          </p>
        </Card>
      </div>

      {/* ── 3. MILESTONE & PROGRESS REPORTING LIST (PB-089 & PB-090) ──────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[var(--text-h3)] font-[600] text-[var(--color-neutral-900)]">
              Daftar Tahapan & Milestone
            </h2>
            <p className="text-[var(--text-body-s)] text-[var(--color-neutral-600)]">
              Laporkan kemajuan pekerjaan lapangan beserta bukti dokumentasi faktual secara berkala.
            </p>
          </div>
        </div>

        {(!milestones || milestones.length === 0) ? (
          <Card>
            <CardContent className="py-12 text-center text-[var(--color-neutral-600)]">
              <Clock className="w-12 h-12 text-[var(--color-neutral-400)] mx-auto mb-2" />
              <p className="font-[600] text-[var(--color-neutral-800)]">Belum ada milestone tercatat</p>
              <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)] max-w-md mx-auto mt-1 mb-4">
                Tambahkan milestone pertama untuk menjadwalkan tahapan pekerjaan dan target penyelesaian di lapangan.
              </p>
              <Button variant="primary" size="sm" onClick={() => setShowMilestoneModal(true)}>
                <Plus className="w-4 h-4 mr-1.5" /> Buat Milestone Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          milestones.map((m, idx) => (
            <Card key={m.id} className={m.status === "COMPLETED" ? "border-l-4 border-l-[var(--color-success-500)]" : m.status === "IN_PROGRESS" ? "border-l-4 border-l-[var(--color-primary-500)]" : "border-l-4 border-l-[var(--color-neutral-300)]"}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-[700] text-[var(--text-body-s)] ${m.status === "COMPLETED" ? "bg-[var(--color-success-100)] text-[var(--color-success-700)]" : m.status === "IN_PROGRESS" ? "bg-[var(--color-primary-100)] text-[var(--color-primary-700)]" : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]"}`}>
                      {idx + 1}
                    </span>
                    <div>
                      <CardTitle className="text-[var(--text-h4)]">{m.name}</CardTitle>
                      <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Target Tanggal: {m.plannedDate ? new Date(m.plannedDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Belum ditentukan"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={m.status === "COMPLETED" ? "success" : m.status === "IN_PROGRESS" ? "info" : "default"}>
                    {m.status === "COMPLETED" ? "Selesai 100%" : m.status === "IN_PROGRESS" ? "Sedang Berjalan" : "Direncanakan"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-3 pt-0">
                {m.description && (
                  <p className="text-[var(--text-body-s)] text-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] p-3 rounded-[var(--radius-s)]">
                    {m.description}
                  </p>
                )}

                {/* Report History (PB-090 & PB-092 & PB-148) */}
                {m.reports && m.reports.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2 p-3.5 bg-white rounded-[var(--radius-m)] border border-[var(--color-neutral-200)]">
                    <p className="text-[var(--text-caption)] font-[700] text-[var(--color-neutral-700)] flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-[var(--color-primary-600)]" />
                      Riwayat Laporan Progres & Bukti Lapangan:
                    </p>
                    {m.reports.map((rep) => (
                      <div key={rep.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-[var(--color-neutral-100)] pb-2.5 last:border-0 last:pb-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-[600] text-[var(--text-body-s)] text-[var(--color-neutral-900)]">
                              Kemajuan: {rep.progressPercentage}%
                            </span>
                            <span className="text-[var(--text-caption)] text-[var(--color-neutral-400)]">•</span>
                            <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                              {new Date(rep.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                          <p className="text-[var(--text-body-s)] text-[var(--color-neutral-700)] mt-1">
                            {rep.description}
                          </p>
                          {rep.evidenceUrl && (
                            <a
                              href={rep.evidenceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--text-caption)] text-[var(--color-primary-600)] hover:underline inline-flex items-center gap-1 mt-1 font-[500]"
                            >
                              Lihat Bukti Foto / Dokumen Lapangan <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <Badge
                            variant={rep.status === "VALIDATED" ? "success" : rep.status === "REJECTED" ? "error" : "warning"}
                          >
                            {rep.status === "VALIDATED" ? "Tervalidasi Faktual" : rep.status === "REJECTED" ? "Perlu Revisi" : "Menunggu Verifikasi Koperasi"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action button */}
                {m.status !== "COMPLETED" && (
                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedMilestone(m)
                        setProgressPercentage(m.reports && m.reports.length > 0 ? Math.max(...m.reports.map((r: any) => r.progressPercentage)) : 50)
                      }}
                    >
                      <Upload className="w-4 h-4 mr-1.5" />
                      Lapor Kemajuan Lapangan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── 4. MODAL: REPORT PROGRESS (PB-090 & PB-092) ───────────────────── */}
      {selectedMilestone && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-[var(--text-h4)]">
                Kirim Laporan Progres: {selectedMilestone.name}
              </CardTitle>
              <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                Laporkan persentase realisasi dan unggah tautan bukti foto/video kondisi faktual di lapangan.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[var(--text-label)] font-[600] text-[var(--color-neutral-800)]">
                    Persentase Kemajuan
                  </label>
                  <span className="text-[var(--text-h4)] font-[700] text-[var(--color-primary-700)]">
                    {progressPercentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressPercentage}
                  onChange={(e) => setProgressPercentage(parseInt(e.target.value))}
                  className="w-full h-2 bg-[var(--color-neutral-200)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary-600)]"
                />
                <div className="flex justify-between text-[11px] text-[var(--color-neutral-500)] mt-1">
                  <span>0% (Belum mulai)</span>
                  <span>50% (Sedang Berjalan)</span>
                  <span>100% (Selesai Penuh)</span>
                </div>
              </div>

              <Textarea
                label="Deskripsi Aktivitas Lapangan *"
                placeholder="Jelaskan secara rinci kegiatan yang telah terlaksana pada tahapan ini (misal: penyiapan lahan, penyebaran bibit, pemupukan tahap 1)..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={4}
                required
              />

              <Input
                label="URL Bukti Foto / Dokumen Lapangan"
                placeholder="https://cloudinary.com/... atau tautan penyimpanan foto"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                helperText="Unggah bukti foto/video faktual. Bukti akan diverifikasi oleh Koperasi pendamping sebelum tervalidasi."
              />

              <Alert variant="info" className="bg-[var(--color-neutral-50)] border-[var(--color-neutral-200)] py-2">
                <div className="flex items-center gap-2 text-[var(--text-caption)] text-[var(--color-neutral-700)]">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-primary-600)] flex-shrink-0" />
                  <span><strong>Prinsip Verifikasi:</strong> Pengunggahan bukti tidak otomatis berstatus validasi. Koperasi akan melakukan pengecekan faktual.</span>
                </div>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button variant="tertiary" onClick={() => setSelectedMilestone(null)}>
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={() => reportProgressMutation.mutate()}
                isLoading={reportProgressMutation.isPending}
                disabled={!reportDescription}
              >
                Kirim Laporan Progres
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* ── 5. MODAL: CREATE MILESTONE (PB-089) ────────────────────────────── */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="text-[var(--text-h4)]">
                Tambah Milestone Pelaksanaan
              </CardTitle>
              <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                Rencanakan tahapan kerja operasional proyek secara terstruktur.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                label="Nama Tahapan / Milestone *"
                placeholder="Contoh: Pemupukan Lanjutan & Pengendalian Hama"
                value={newMilestoneName}
                onChange={(e) => setNewMilestoneName(e.target.value)}
                required
              />

              <div>
                <label className="text-[var(--text-label)] font-[500] mb-1 block">
                  Target Tanggal Selesai (Opsional)
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-[var(--color-neutral-300)] rounded-[var(--radius-m)] text-[var(--text-body-m)] bg-white"
                  value={newMilestonePlannedDate}
                  onChange={(e) => setNewMilestonePlannedDate(e.target.value)}
                />
                <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] mt-1">
                  Target tanggal milestone akan menentukan jadwal pelaporan jika lebih awal dari siklus 30 hari.
                </p>
              </div>

              <Textarea
                label="Deskripsi Target Pekerjaan"
                placeholder="Jelaskan luaran yang diharapkan pada milestone ini..."
                value={newMilestoneDesc}
                onChange={(e) => setNewMilestoneDesc(e.target.value)}
                rows={3}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button variant="tertiary" onClick={() => setShowMilestoneModal(false)}>
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={() => createMilestoneMutation.mutate()}
                isLoading={createMilestoneMutation.isPending}
                disabled={!newMilestoneName}
              >
                Simpan Milestone
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* ── 6. MODAL: REPORT INCIDENT / MATERIAL ISSUE (PB-094) ────────────── */}
      {showIncidentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="text-[var(--color-error-700)] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Laporkan Kendala / Insiden Material
              </CardTitle>
              <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                Laporkan hambatan material yang dapat mempengaruhi jadwal, kualitas, atau output proyek.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Alert variant="warning" className="bg-[var(--color-warning-50)] border-[var(--color-warning-300)] py-2">
                <span className="text-[var(--text-caption)] font-[600] text-[var(--color-warning-900)]">
                  Ketentuan Batas Waktu (SLA): UMKM wajib melaporkan kendala material maksimal 3 × 24 jam setelah diketahui.
                </span>
              </Alert>

              <div>
                <label className="text-[var(--text-label)] font-[500] mb-1 block">Kategori Kendala *</label>
                <select
                  className="w-full px-3 py-2 border border-[var(--color-neutral-300)] rounded-[var(--radius-m)] text-[var(--text-body-m)] bg-white"
                  value={incidentCategory}
                  onChange={(e) => setIncidentCategory(e.target.value as any)}
                >
                  <option value="DELAY">Keterlambatan Jadwal (Cuaca Buruk / Logistik)</option>
                  <option value="DAMAGE">Kerusakan Fisik / Serangan Hama Tanaman</option>
                  <option value="FORCE_MAJEURE">Keadaan Kahar (Bencana Alam / Banjir / Kekeringan)</option>
                  <option value="FRAUD">Indikasi Masalah Pihak Ketiga / Supplier</option>
                </select>
              </div>

              <div>
                <label className="text-[var(--text-label)] font-[500] mb-1 block">Tingkat Keparahan *</label>
                <select
                  className="w-full px-3 py-2 border border-[var(--color-neutral-300)] rounded-[var(--radius-m)] text-[var(--text-body-m)] bg-white"
                  value={incidentSeverity}
                  onChange={(e) => setIncidentSeverity(e.target.value as any)}
                >
                  <option value="LOW">Rendah (Dapat tertangani tanpa perpanjangan)</option>
                  <option value="MEDIUM">Sedang (Memerlukan penyesuaian jadwal)</option>
                  <option value="HIGH">Tinggi (Beresiko gagal panen / gangguan fatal)</option>
                </select>
              </div>

              <Textarea
                label="Detail Kronologi Kejadian & Langkah Mitigasi *"
                placeholder="Jelaskan apa yang terjadi di lapangan, perkiraan dampak pada panen/proyek, dan tindakan mitigasi sementara yang telah dilakukan..."
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
                Kirim Laporan Kendala
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}

