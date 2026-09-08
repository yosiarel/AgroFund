import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { Project } from "../../types"
import { ProjectStatusBadge } from "../../components/business/ProjectStatusBadge"
import { formatRupiah } from "../../components/business/FinancialSummary"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Textarea } from "../../components/ui/Textarea"
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  CheckSquare,
  Square,
  ShieldCheck,
} from "lucide-react"

/**
 * AgroFund Publication Review Page (Doc 4, Sec 17, 18)
 *
 * Flow (Doc 4 Sec 17):
 * Projects → Pending Publication Review → Project Detail → Publication Review → Decision
 *
 * AgroFund memeriksa (Doc 4 Sec 17):
 * - completeness
 * - assessment result (Koperasi approved?)
 * - financial structure (Target, Guarantee requirement, Natura)
 * - disclosure (rules, cancellation, failure, recovery/refund info)
 * - publication requirements
 *
 * Decision (Doc 4 Sec 18):
 * - Approve
 * - Needs Correction → UMKM correct → resubmit → AgroFund Review
 * - Reject
 *
 * Authority: AgroFund — NOT Koperasi (Doc 5 Sec 30)
 * AgroFund does NOT redo field assessment (Doc 4 Sec 17)
 */

function fetchProject(id: string): Promise<Project> {
  return api.get(`/projects/${id}`)
}

// Publication review checklist per Doc 4 Sec 17
const REVIEW_CHECKLIST = [
  {
    id: "completeness",
    label: "Kelengkapan Data",
    description: "Seluruh informasi wajib telah diisi (judul, deskripsi, timeline, pengadaan).",
  },
  {
    id: "assessment_approved",
    label: "Hasil Penilaian Koperasi",
    description: "Koperasi telah menyetujui proyek (Cooperative Assessment = Approved).",
  },
  {
    id: "financial_structure",
    label: "Struktur Keuangan",
    description: "Target pendanaan, Guarantee (5% BPC), dan biaya layanan sudah sesuai formula.",
  },
  {
    id: "guarantee_requirement",
    label: "Persyaratan Guarantee",
    description: "UMKM memahami kewajiban Guarantee yang harus dibayar setelah approval.",
  },
  {
    id: "natura_disclosure",
    label: "Disclosure Natura",
    description: "Paket Natura (jika ada) tidak disajikan sebagai guaranteed financial return.",
  },
  {
    id: "risk_disclosure",
    label: "Disclosure Risiko",
    description: "Risiko proyek teridentifikasi dan dikomunikasikan secara transparan.",
  },
  {
    id: "publication_ready",
    label: "Siap Dipublikasikan",
    description: "Proyek memenuhi semua persyaratan publikasi platform AgroFund.",
  },
] as const

type ReviewItem = typeof REVIEW_CHECKLIST[number]["id"]
type ReviewDecision = "APPROVED" | "NEEDS_CORRECTION" | "REJECTED"

export function PublicationReviewPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"review" | "decision">("review")
  const [checkedItems, setCheckedItems] = useState<Set<ReviewItem>>(new Set())
  const [decision, setDecision] = useState<ReviewDecision | null>(null)
  const [notes, setNotes] = useState("")

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId,
  })

  const reviewMutation = useMutation({
    mutationFn: () =>
      api.post(`/projects/${projectId}/review`, { decision, notes }),
    onSuccess: () => navigate("/admin/projects"),
  })

  const toggleCheck = (id: ReviewItem) => {
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
    return <Alert variant="error">Gagal memuat data proyek.</Alert>
  }

  if (project.status !== "PUBLICATION_REVIEW") {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="warning" title="Review Tidak Tersedia">
          Proyek ini tidak sedang berada dalam tahap Publication Review.
          Status saat ini: {project.status}
        </Alert>
        <Button variant="tertiary" className="w-fit" onClick={() => navigate("/admin/projects")}>
          Kembali ke Daftar Proyek
        </Button>
      </div>
    )
  }

  const allChecked = checkedItems.size === REVIEW_CHECKLIST.length
  const isFormValid = decision !== null && (decision === "APPROVED" ? allChecked : notes.trim().length > 0)

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <button onClick={() => navigate("/admin/projects")} className="text-[var(--text-caption)] text-[var(--color-neutral-500)] hover:text-[var(--color-primary-600)] mb-2 transition-colors">
          ← Kembali ke Daftar Proyek
        </button>
        <h1 className="text-[var(--text-h2)] font-[700] text-[var(--color-neutral-900)]">
          Platform / Publication Review
        </h1>
        {/* Authority context (Doc 5 Sec 30, 54): AgroFund authority, NOT Koperasi */}
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)] mt-1">
          Dilakukan oleh <span className="font-[600] text-[var(--color-neutral-900)]">AgroFund</span> — tinjauan akhir platform sebelum proyek dapat dipublikasikan.
          AgroFund tidak melakukan ulang Field Assessment (sudah dilakukan Koperasi).
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

              {/* Financial structure transparency (Doc 4 Sec 17) */}
              <div className="p-3 bg-[var(--color-neutral-50)] rounded-[var(--radius-m)] border border-[var(--color-neutral-200)] flex flex-col gap-2">
                <p className="text-[var(--text-caption)] font-[600] text-[var(--color-neutral-700)]">Struktur Keuangan</p>
                <div className="flex justify-between text-[var(--text-caption)]">
                  <span className="text-[var(--color-neutral-600)]">Target Pendanaan</span>
                  <span className="font-[600] text-[var(--color-primary-700)]">{formatRupiah(project.totalTarget)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-caption)]">
                  <span className="text-[var(--color-neutral-600)]">Guarantee (5% BPC)</span>
                  <span className="font-[500] text-[var(--color-neutral-900)]">{formatRupiah(project.guaranteeAmount)}</span>
                </div>
                <p className="text-[10px] text-[var(--color-neutral-500)] mt-1">
                  Guarantee bukan bagian dari Target Pendanaan.
                </p>
              </div>

              {/* Cooperative Assessment Result */}
              <div>
                <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] mb-1">Penilaian Koperasi</p>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-success-600)]" />
                  <span className="text-[var(--text-body-s)] font-[500] text-[var(--color-success-800)]">Approved oleh Koperasi</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Review Tabs */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Tab Navigation */}
          <div className="flex gap-1 bg-[var(--color-neutral-100)] p-1 rounded-[var(--radius-m)]">
            <button
              onClick={() => setActiveTab("review")}
              className={`flex-1 py-2 px-3 rounded-[var(--radius-s)] text-[var(--text-body-s)] font-[500] transition-colors ${
                activeTab === "review"
                  ? "bg-white text-[var(--color-primary-700)] shadow-[var(--shadow-e1)]"
                  : "text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)]"
              }`}
            >
              Review Checklist
              {checkedItems.size > 0 && (
                <span className="ml-2 text-[10px] font-[700] bg-[var(--color-primary-100)] text-[var(--color-primary-700)] px-1.5 py-0.5 rounded-full">
                  {checkedItems.size}/{REVIEW_CHECKLIST.length}
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

          {/* ── Review Checklist Tab ────────────────────────────── */}
          {activeTab === "review" && (
            <Card>
              <CardHeader><CardTitle>Checklist Tinjauan Publikasi</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-[var(--text-body-s)] text-[var(--color-neutral-600)]">
                  Centang setiap item yang telah diverifikasi. Semua item harus dicentang untuk memberikan keputusan Approve.
                </p>

                {REVIEW_CHECKLIST.map((item) => {
                  const checked = checkedItems.has(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`flex items-start gap-3 p-3 rounded-[var(--radius-m)] border text-left transition-all w-full ${
                        checked
                          ? "border-[var(--color-success-500)] bg-[var(--color-success-100)]"
                          : "border-[var(--color-neutral-200)] hover:border-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-50)]"
                      }`}
                    >
                      <span className="mt-0.5 flex-shrink-0">
                        {checked
                          ? <CheckSquare className="w-5 h-5 text-[var(--color-success-600)]" />
                          : <Square className="w-5 h-5 text-[var(--color-neutral-400)]" />
                        }
                      </span>
                      <div>
                        <p className={`text-[var(--text-body-s)] font-[600] ${checked ? "text-[var(--color-success-800)]" : "text-[var(--color-neutral-900)]"}`}>
                          {item.label}
                        </p>
                        <p className={`text-[var(--text-caption)] mt-0.5 ${checked ? "text-[var(--color-success-700)]" : "text-[var(--color-neutral-600)]"}`}>
                          {item.description}
                        </p>
                      </div>
                    </button>
                  )
                })}

                {allChecked && (
                  <Alert variant="success">
                    Semua item tinjauan telah diverifikasi. Anda dapat melanjutkan ke tab Keputusan.
                  </Alert>
                )}

                <div className="flex justify-end pt-2">
                  <Button variant="primary" onClick={() => setActiveTab("decision")}>
                    Lanjut ke Keputusan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Decision Tab ─────────────────────────────────────── */}
          {activeTab === "decision" && (
            <Card>
              <CardHeader><CardTitle>Keputusan Tinjauan</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-6">
                {!allChecked && (
                  <Alert variant="warning">
                    Belum semua item checklist diverifikasi ({checkedItems.size}/{REVIEW_CHECKLIST.length}). Keputusan Approve membutuhkan checklist lengkap.
                  </Alert>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setDecision("APPROVED")}
                    disabled={!allChecked}
                    className={`p-4 rounded-[var(--radius-m)] border text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      decision === "APPROVED"
                        ? "border-[var(--color-success-500)] bg-[var(--color-success-50)] ring-1 ring-[var(--color-success-500)]"
                        : "border-[var(--color-neutral-200)] hover:border-[var(--color-success-300)]"
                    }`}
                  >
                    <CheckCircle2 className={`w-6 h-6 mb-2 ${decision === "APPROVED" ? "text-[var(--color-success-600)]" : "text-[var(--color-neutral-400)]"}`} />
                    <p className="font-[600] text-[var(--color-neutral-900)]">Approve</p>
                    <p className="text-[var(--text-caption)] text-[var(--color-neutral-600)] mt-1">
                      Proyek masuk ke Guarantee Placement.
                    </p>
                  </button>

                  <button
                    onClick={() => setDecision("NEEDS_CORRECTION")}
                    className={`p-4 rounded-[var(--radius-m)] border text-left transition-all ${
                      decision === "NEEDS_CORRECTION"
                        ? "border-[var(--color-warning-500)] bg-[var(--color-warning-50)] ring-1 ring-[var(--color-warning-500)]"
                        : "border-[var(--color-neutral-200)] hover:border-[var(--color-warning-300)]"
                    }`}
                  >
                    <RotateCcw className={`w-6 h-6 mb-2 ${decision === "NEEDS_CORRECTION" ? "text-[var(--color-warning-600)]" : "text-[var(--color-neutral-400)]"}`} />
                    <p className="font-[600] text-[var(--color-neutral-900)]">Needs Correction</p>
                    <p className="text-[var(--text-caption)] text-[var(--color-neutral-600)] mt-1">
                      UMKM perlu memperbaiki data.
                    </p>
                  </button>

                  <button
                    onClick={() => setDecision("REJECTED")}
                    className={`p-4 rounded-[var(--radius-m)] border text-left transition-all ${
                      decision === "REJECTED"
                        ? "border-[var(--color-error-500)] bg-[var(--color-error-50)] ring-1 ring-[var(--color-error-500)]"
                        : "border-[var(--color-neutral-200)] hover:border-[var(--color-error-300)]"
                    }`}
                  >
                    <XCircle className={`w-6 h-6 mb-2 ${decision === "REJECTED" ? "text-[var(--color-error-600)]" : "text-[var(--color-neutral-400)]"}`} />
                    <p className="font-[600] text-[var(--color-neutral-900)]">Reject</p>
                    <p className="text-[var(--text-caption)] text-[var(--color-neutral-600)] mt-1">
                      Proyek tidak memenuhi syarat publikasi.
                    </p>
                  </button>
                </div>

                {decision && (
                  <div className="flex flex-col gap-4">
                    {decision === "NEEDS_CORRECTION" && (
                      <Alert variant="info">
                        Pilih "Needs Correction" — UMKM akan diberitahu untuk memperbaiki data, lalu meresubmit untuk ditinjau ulang oleh AgroFund.
                      </Alert>
                    )}

                    <Textarea
                      label="Catatan Tinjauan"
                      required={decision !== "APPROVED"}
                      placeholder={
                        decision === "APPROVED"
                          ? "Opsional: Tambahkan catatan atau rekomendasi ke UMKM..."
                          : "Wajib: Jelaskan alasan keputusan dan apa yang harus diperbaiki/kenapa ditolak..."
                      }
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />

                    {reviewMutation.isError && (
                      <Alert variant="error">Terjadi kesalahan saat menyimpan keputusan. Silakan coba lagi.</Alert>
                    )}

                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => reviewMutation.mutate()}
                      isLoading={reviewMutation.isPending}
                      disabled={!isFormValid}
                    >
                      Submit Keputusan
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
