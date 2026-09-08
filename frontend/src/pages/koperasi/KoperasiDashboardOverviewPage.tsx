import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import api from "../../lib/axios"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { ProjectStatusBadge } from "../../components/business/ProjectStatusBadge"
import { 
  ClipboardCheck, 
  ShoppingCart, 
  FileCheck2, 
  FolderKanban, 
  ArrowRight,
  AlertTriangle
} from "lucide-react"
import type { Project } from "../../types"

interface KoperasiAnalytics {
  totalProjects: number
  pendingAssessment: number
  pendingProcurement: number
  pendingEvidences: number
  recentProjects: Project[]
}

function fetchAnalyticsSummary(): Promise<{ data: KoperasiAnalytics }> {
  return api.get("/koperasi/analytics")
}

export function KoperasiDashboardOverviewPage() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["koperasi-analytics"],
    queryFn: fetchAnalyticsSummary,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat ringkasan tugas..." />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="error">
        Gagal memuat ringkasan dasbor. Silakan coba lagi.
      </Alert>
    )
  }

  const stats = response?.data

  if (!stats) return null;

  const {
    totalProjects,
    pendingAssessment,
    pendingProcurement,
    pendingEvidences,
    recentProjects
  } = stats;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
            Dasbor Pengawas Lapangan
          </h1>
          <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)] mt-1">
            Pantau dan tindak lanjuti antrean tugas validasi proyek binaan Anda.
          </p>
        </div>
      </div>

      {/* Main Stats Grid (Action-Oriented) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-[var(--color-neutral-200)]">
          <div className="p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-[var(--color-primary-600)]" />
            </div>
            <div>
              <p className="text-[var(--text-body-s)] font-[600] text-[var(--color-neutral-500)] uppercase tracking-wider">
                Total Proyek Binaan
              </p>
              <h3 className="text-3xl font-bold text-[var(--color-neutral-900)] mt-1">
                {totalProjects}
              </h3>
            </div>
          </div>
        </Card>

        <Card className={pendingAssessment > 0 ? "border-amber-200 shadow-sm shadow-amber-100" : ""}>
          <div className="p-6 flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${pendingAssessment > 0 ? "bg-amber-100" : "bg-gray-100"}`}>
              <ClipboardCheck className={`w-6 h-6 ${pendingAssessment > 0 ? "text-amber-600" : "text-gray-500"}`} />
            </div>
            <div>
              <p className="text-[var(--text-body-s)] font-[600] text-[var(--color-neutral-500)] uppercase tracking-wider">
                Menunggu Assessment
              </p>
              <div className="flex items-center justify-between mt-1">
                <h3 className={`text-3xl font-bold ${pendingAssessment > 0 ? "text-amber-600" : "text-[var(--color-neutral-900)]"}`}>
                  {pendingAssessment}
                </h3>
                {pendingAssessment > 0 && (
                  <span className="flex items-center gap-1 text-[var(--text-caption)] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    <AlertTriangle className="w-3 h-3" /> Perlu Tindakan
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className={pendingProcurement > 0 ? "border-blue-200 shadow-sm shadow-blue-100" : ""}>
          <div className="p-6 flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${pendingProcurement > 0 ? "bg-blue-100" : "bg-gray-100"}`}>
              <ShoppingCart className={`w-6 h-6 ${pendingProcurement > 0 ? "text-blue-600" : "text-gray-500"}`} />
            </div>
            <div>
              <p className="text-[var(--text-body-s)] font-[600] text-[var(--color-neutral-500)] uppercase tracking-wider">
                Validasi Pengadaan
              </p>
              <div className="flex items-center justify-between mt-1">
                <h3 className={`text-3xl font-bold ${pendingProcurement > 0 ? "text-blue-600" : "text-[var(--color-neutral-900)]"}`}>
                  {pendingProcurement}
                </h3>
                {pendingProcurement > 0 && (
                  <span className="flex items-center gap-1 text-[var(--text-caption)] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    <AlertTriangle className="w-3 h-3" /> Perlu Tindakan
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className={pendingEvidences > 0 ? "border-purple-200 shadow-sm shadow-purple-100" : ""}>
          <div className="p-6 flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${pendingEvidences > 0 ? "bg-purple-100" : "bg-gray-100"}`}>
              <FileCheck2 className={`w-6 h-6 ${pendingEvidences > 0 ? "text-purple-600" : "text-gray-500"}`} />
            </div>
            <div>
              <p className="text-[var(--text-body-s)] font-[600] text-[var(--color-neutral-500)] uppercase tracking-wider">
                Verifikasi Bukti
              </p>
              <div className="flex items-center justify-between mt-1">
                <h3 className={`text-3xl font-bold ${pendingEvidences > 0 ? "text-purple-600" : "text-[var(--color-neutral-900)]"}`}>
                  {pendingEvidences}
                </h3>
                {pendingEvidences > 0 && (
                  <span className="flex items-center gap-1 text-[var(--text-caption)] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    <AlertTriangle className="w-3 h-3" /> Perlu Tindakan
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* Quick Actions */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card className="h-full bg-gradient-to-br from-[var(--color-primary-50)] to-white border-[var(--color-primary-100)]">
            <div className="p-6">
              <h3 className="font-bold text-[var(--text-h4)] text-[var(--color-neutral-900)] mb-4">Akses Cepat Tugas</h3>
              <div className="flex flex-col gap-3">
                <Link to="/koperasi/projects">
                  <Button variant="secondary" className="w-full justify-between group">
                    <span className="flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4 text-[var(--color-neutral-500)]" />
                      Lakukan Assessment
                    </span>
                    <ArrowRight className="w-4 h-4 text-[var(--color-neutral-400)] group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/koperasi/procurement">
                  <Button variant="secondary" className="w-full justify-between group">
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-[var(--color-neutral-500)]" />
                      Validasi Pengadaan
                    </span>
                    <ArrowRight className="w-4 h-4 text-[var(--color-neutral-400)] group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/koperasi/evidence">
                  <Button variant="secondary" className="w-full justify-between group">
                    <span className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-[var(--color-neutral-500)]" />
                      Verifikasi Bukti Progres
                    </span>
                    <ArrowRight className="w-4 h-4 text-[var(--color-neutral-400)] group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Projects Overview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--color-neutral-100)] rounded-lg text-[var(--color-neutral-700)]">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[var(--text-h4)] text-[var(--color-neutral-900)]">Proyek Binaan Terbaru</h3>
                </div>
                <Link to="/koperasi/projects" className="text-[var(--color-primary-600)] text-sm font-[600] hover:underline flex items-center gap-1">
                  Lihat Semua <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {recentProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="p-4 rounded-[var(--radius-l)] border border-[var(--color-neutral-200)] hover:border-[var(--color-primary-300)] transition-colors bg-white">
                      <h4 className="font-bold text-[var(--text-body-m)] text-[var(--color-neutral-900)] line-clamp-1 mb-2" title={project.title}>
                        {project.title}
                      </h4>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--color-neutral-100)]">
                        <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">Status</span>
                        <ProjectStatusBadge status={project.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--color-neutral-500)] bg-[var(--color-neutral-50)] rounded-[var(--radius-l)] border-2 border-dashed border-[var(--color-neutral-200)]">
                  <FolderKanban className="w-10 h-10 mb-3 text-[var(--color-neutral-400)]" />
                  <p className="font-[600]">Belum ada proyek ditugaskan</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
