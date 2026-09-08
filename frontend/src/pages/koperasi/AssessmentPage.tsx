import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { Project, AssessmentStatus } from "../../types"
import { ProjectStatusBadge } from "../../components/business/ProjectStatusBadge"
import { formatRupiah } from "../../components/business/FinancialSummary"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Textarea } from "../../components/ui/Textarea"
import { ClipboardCheck, CheckCircle2, XCircle, FileWarning, CheckSquare, Square } from "lucide-react"

/**
 * Koperasi Assessment Page (Doc 4, Sec 15, 16)
 *
 * Flow (EXACT per Doc 4 Sec 15):
 * Assigned Projects → Project Detail → Assessment → Assessment Checklist → Evidence → Decision
 *
 * Decision options (Doc 4 Sec 16):
 * - Approve → project moves to PUBLICATION_REVIEW
 * - Request Correction (NEEDS_CORRECTION) → UMKM must correct & resubmit
 * - Reject
 *
 * Authority: Koperasi (NOT AgroFund — Doc 5 Sec 30)
 */

function fetchProject(id: string): Promise<Project> {
  return api.get(`/projects/${id}`)
}

// Assessment checklist items per Doc 4 Sec 15
const ASSESSMENT_CHECKLIST = [
  { id: "umkm_identity", label: "Identitas UMKM/Petani terverifikasi" },
  { id: "location_visited", label: "Lokasi usaha/lahan sudah dikunjungi" },
  { id: "procurement_feasible", label: "Kebutuhan pengadaan realistis dan relevan" },
  { id: "budget_reasonable", label: "Anggaran yang diajukan wajar dan sesuai kondisi pasar lokal" },
  { id: "timeline_achievable", label: "Timeline proyek dapat dicapai" },
  { id: "risk_disclosed", label: "Risiko utama telah diidentifikasi UMKM" },
  { id: "operational_capacity", label: "UMKM memiliki kapasitas operasional yang memadai" },
] as const

type ChecklistItem = typeof ASSESSMENT_CHECKLIST[number]["id"]

export function AssessmentPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"checklist" | "decision">("checklist")
  const [checkedItems, setCheckedItems] = useState<Set<ChecklistItem>>(new Set())
  const [status, setStatus] = useState<AssessmentStatus | null>(null)
  const [notes, setNotes] = useState("")

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId,
  })

  const assessMutation = useMutation({
    mutationFn: () =>
      api.post(`/projects/${projectId}/assess`, { status, notes }),
    onSuccess: () => navigate("/koperasi/projects"),
  })

  const toggleCheck = (id: ChecklistItem) => {
    setCheckedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat data proyek..." />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="error" title="Akses Ditolak / Data Tidak Ditemukan">
          Gagal memuat data proyek. Anda mungkin tidak memiliki wewenang untuk menilai proyek ini atau proyek tidak ditemukan.
        </Alert>
        <Button variant="tertiary" className="w-fit" onClick={() => navigate("/koperasi/projects")}>
          Kembali ke Daftar Proyek
        </Button>
      </div>
    )
  }

  if (project.status !== "COOPERATIVE_ASSESSMENT") {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="warning" title="Assessment Tidak Tersedia">
          Proyek ini tidak sedang berada dalam tahap Penilaian Koperasi.
          Status saat ini: {project.status}
        </Alert>
        <Button variant="tertiary" className="w-fit" onClick={() => navigate("/koperasi/projects")}>
          Kembali ke Daftar Proyek
        </Button>
      </div>
    )
  }

  const allChecked = checkedItems.size === ASSESSMENT_CHECKLIST.length
  const isFormValid = status !== null && (status === "APPROVED" ? allChecked : notes.trim().length > 0)

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <button onClick={() => navigate("/koperasi/projects")} className="text-[var(--text-caption)] text-[var(--color-neutral-500)] hover:text-[var(--color-primary-600)] mb-2 transition-colors">
          ← Kembali ke Assigned Projects
        </button>
        <h1 className="text-[var(--text-h2)] font-[700] text-[var(--color-neutral-900)]">
          Operational / Field Assessment
        </h1>
        {/* Authority context (Doc 5 Sec 54): must show who performs this */}
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)] mt-1">
          Dilakukan oleh <span className="font-[600] text-[var(--color-neutral-900)]">Koperasi</span> — validasi lapangan dan kelayakan operasional.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Project Summary */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Ringkasan Proyek</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">Judul Proyek</p>
                <p className="text-[var(--text-body-m)] font-[600] text-[var(--color-neutral-900)]">{project.title}</p>
              </div>
              <div>
                <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">Status</p>
                <div className="mt-1">
                  <ProjectStatusBadge status={project.status} size="sm" showAuthority />
                </div>
              </div>
              <div>
                <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">UMKM / Petani</p>
                <p className="text-[var(--text-body-m)] font-[500] text-[var(--color-neutral-900)]">{project.user.name}</p>
              </div>
              <div>
                <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">Target Pendanaan</p>
                <p className="text-[var(--text-body-m)] font-[600] text-[var(--color-primary-700)]">{formatRupiah(project.targetAmount)}</p>
              </div>
              <div>
                <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] mb-1">Deskripsi</p>
                <p className="text-[var(--text-body-s)] text-[var(--color-neutral-800)] leading-relaxed line-clamp-4">{project.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Assessment Tabs */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Tab Navigation (Doc 4 Sec 15: Checklist → Evidence → Decision) */}
          <div className="flex gap-1 bg-[var(--color-neutral-100)] p-1 rounded-[var(--radius-m)]">
            <button
              onClick={() => setActiveTab("checklist")}
              className={`flex-1 py-2 px-3 rounded-[var(--radius-s)] text-[var(--text-body-s)] font-[500] transition-colors ${
                activeTab === "checklist"
                  ? "bg-white text-[var(--color-primary-700)] shadow-[var(--shadow-e1)]"
                  : "text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)]"
              }`}
            >
              Assessment Checklist
              {checkedItems.size > 0 && (
                <span className="ml-2 text-[10px] font-[700] bg-[var(--color-primary-100)] text-[var(--color-primary-700)] px-1.5 py-0.5 rounded-full">
                  {checkedItems.size}/{ASSESSMENT_CHECKLIST.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("decision")}
              className={`flex-1 py-2 px-3 rounded-[var(--radius-s)] text-[var(--text-body-s)] font-[500] transition-colors ${
                activeTab === "decision"
                  ? "bg-white text-[var(--color-primary-700)] shadow-[var(--shadow-e1)]"
                  : "text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)]"
              }`}
            >
              Keputusan
            </button>
          </div>

          {/* ── Assessment Checklist Tab ────────────────────────────── */}
          {activeTab === "checklist" && (
            <Card>
              <CardHeader>
                <CardTitle>Checklist Penilaian Lapangan</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-[var(--text-body-s)] text-[var(--color-neutral-600)]">
                  Centang setiap item yang telah Anda verifikasi secara langsung di lapangan.
                  Semua item harus dicentang untuk memberikan keputusan Approve.
                </p>

                {ASSESSMENT_CHECKLIST.map((item) => {
                  const checked = checkedItems.has(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`flex items-center gap-3 p-3 rounded-[var(--radius-m)] border text-left transition-all w-full ${
                        checked
                          ? "border-[var(--color-success-500)] bg-[var(--color-success-100)]"
                          : "border-[var(--color-neutral-200)] hover:border-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-50)]"
                      }`}
                    >
                      {checked
                        ? <CheckSquare className="w-5 h-5 text-[var(--color-success-600)] flex-shrink-0" />
                        : <Square className="w-5 h-5 text-[var(--color-neutral-400)] flex-shrink-0" />
                      }
                      <span className={`text-[var(--text-body-s)] font-[500] ${checked ? "text-[var(--color-success-800)]" : "text-[var(--color-neutral-800)]"}`}>
                        {item.label}
                      </span>
                    </button>
                  )
                })}

                {allChecked && (
                  <Alert variant="success">
                    Semua item checklist telah diverifikasi. Anda dapat melanjutkan ke tab Keputusan.
                  </Alert>
                )}

                <div className="flex justify-end pt-2">
                  <Button variant="primary" onClick={() => setActiveTab("decision")}>
                    Lanjut ke Keputusan
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Decision Tab ───────────────────────────────────────── */}
          {activeTab === "decision" && (
            <Card>
              <CardHeader><CardTitle>Keputusan Penilaian</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-6">
                {/* Warn if not all items checked */}
                {!allChecked && (
                  <Alert variant="warning">
                    Belum semua item checklist dicentang ({checkedItems.size}/{ASSESSMENT_CHECKLIST.length}). Pastikan checklist lengkap sebelum memberikan keputusan Approve.
                  </Alert>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setStatus("APPROVED")}
                    disabled={!allChecked}
                    className={`p-4 rounded-[var(--radius-m)] border text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      status === "APPROVED"
                        ? "border-[var(--color-success-500)] bg-[var(--color-success-50)] ring-1 ring-[var(--color-success-500)]"
                        : "border-[var(--color-neutral-200)] hover:border-[var(--color-success-300)]"
                    }`}
                  >
                    <CheckCircle2 className={`w-6 h-6 mb-2 ${status === "APPROVED" ? "text-[var(--color-success-600)]" : "text-[var(--color-neutral-400)]"}`} />
                    <p className="font-[600] text-[var(--color-neutral-900)]">Approved</p>
                    <p className="text-[var(--text-caption)] text-[var(--color-neutral-600)] mt-1">Proyek layak didanai.</p>
                  </button>

                  <button
                    onClick={() => setStatus("NEEDS_CORRECTION")}
                    className={`p-4 rounded-[var(--radius-m)] border text-left transition-all ${
                      status === "NEEDS_CORRECTION"
                        ? "border-[var(--color-warning-500)] bg-[var(--color-warning-50)] ring-1 ring-[var(--color-warning-500)]"
                        : "border-[var(--color-neutral-200)] hover:border-[var(--color-warning-300)]"
                    }`}
                  >
                    <FileWarning className={`w-6 h-6 mb-2 ${status === "NEEDS_CORRECTION" ? "text-[var(--color-warning-600)]" : "text-[var(--color-neutral-400)]"}`} />
                    <p className="font-[600] text-[var(--color-neutral-900)]">Needs Correction</p>
                    <p className="text-[var(--text-caption)] text-[var(--color-neutral-600)] mt-1">Perlu perbaikan data.</p>
                  </button>

                  <button
                    onClick={() => setStatus("REJECTED")}
                    className={`p-4 rounded-[var(--radius-m)] border text-left transition-all ${
                      status === "REJECTED"
                        ? "border-[var(--color-error-500)] bg-[var(--color-error-50)] ring-1 ring-[var(--color-error-500)]"
                        : "border-[var(--color-neutral-200)] hover:border-[var(--color-error-300)]"
                    }`}
                  >
                    <XCircle className={`w-6 h-6 mb-2 ${status === "REJECTED" ? "text-[var(--color-error-600)]" : "text-[var(--color-neutral-400)]"}`} />
                    <p className="font-[600] text-[var(--color-neutral-900)]">Rejected</p>
                    <p className="text-[var(--text-caption)] text-[var(--color-neutral-600)] mt-1">Proyek tidak layak.</p>
                  </button>
                </div>

                {status && (
                  <div className="flex flex-col gap-4">
                    <Textarea
                      label="Catatan Penilaian"
                      required={status !== "APPROVED"}
                      placeholder={
                        status === "APPROVED"
                          ? "Opsional: Tambahkan catatan positif atau rekomendasi..."
                          : "Wajib: Jelaskan alasan dan bagian yang perlu diperbaiki/kenapa ditolak..."
                      }
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />

                    {assessMutation.isError && (
                      <Alert variant="error">Terjadi kesalahan saat menyimpan penilaian. Silakan coba lagi.</Alert>
                    )}

                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => assessMutation.mutate()}
                      isLoading={assessMutation.isPending}
                      disabled={!isFormValid}
                    >
                      <ClipboardCheck className="w-4 h-4 mr-2" />
                      Submit Penilaian
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
