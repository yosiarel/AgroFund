import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import api from "../../lib/axios"
import { formatRupiah } from "../../components/business/FinancialSummary"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { ProjectStatusBadge } from "../../components/business/ProjectStatusBadge"
import { 
  Users, 
  Store, 
  Sprout, 
  ShieldCheck, 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  ArrowRight,
  FolderOpen
} from "lucide-react"
import type { Project } from "../../types"

interface AnalyticsSummary {
  totalUsers: number
  totalUmkm: number
  totalInvestors: number
  totalKoperasi: number
  activeProjects: number
  successProjects: number
  failedProjects: number
  totalFundingCollected: string
  recentProjects: Project[]
}

function fetchAnalyticsSummary(): Promise<{ data: AnalyticsSummary }> {
  return api.get("/admin/analytics")
}

export function AdminDashboardOverviewPage() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: fetchAnalyticsSummary,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat ringkasan dasbor admin..." />
      </div>
    )
  }

  if (error || !response?.data) {
    return (
      <Alert variant="error">
        Gagal memuat data analitik sistem. Silakan coba lagi.
      </Alert>
    )
  }

  const stats = response.data

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
            Dasbor AgroFund
          </h1>
          <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)] mt-1">
            Pantau dan kelola seluruh metrik platform dalam satu layar.
          </p>
        </div>
        <Link to="/admin/projects">
          <Button variant="primary">
            <FolderOpen className="w-4 h-4 mr-2" />
            Kelola Proyek
          </Button>
        </Link>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-[var(--text-body-s)] font-[600] text-[var(--color-neutral-500)] uppercase tracking-wider">
                Total Dana Terkumpul
              </p>
              <h3 className="text-2xl font-bold text-[var(--color-neutral-900)] mt-1 truncate" title={formatRupiah(Number(stats.totalFundingCollected))}>
                {formatRupiah(Number(stats.totalFundingCollected))}
              </h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center">
              <Sprout className="w-6 h-6 text-[var(--color-primary-600)]" />
            </div>
            <div>
              <p className="text-[var(--text-body-s)] font-[600] text-[var(--color-neutral-500)] uppercase tracking-wider">
                Proyek Berjalan
              </p>
              <div className="flex items-end gap-2 mt-1">
                <h3 className="text-3xl font-bold text-[var(--color-neutral-900)]">
                  {stats.activeProjects}
                </h3>
                <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)] mb-1">aktif</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-[var(--text-body-s)] font-[600] text-[var(--color-neutral-500)] uppercase tracking-wider">
                Proyek Sukses
              </p>
              <div className="flex items-end gap-2 mt-1">
                <h3 className="text-3xl font-bold text-[var(--color-neutral-900)]">
                  {stats.successProjects}
                </h3>
                <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)] mb-1">Selesai</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-[var(--text-body-s)] font-[600] text-[var(--color-neutral-500)] uppercase tracking-wider">
                Proyek Bermasalah
              </p>
              <div className="flex items-end gap-2 mt-1">
                <h3 className="text-3xl font-bold text-[var(--color-neutral-900)]">
                  {stats.failedProjects}
                </h3>
                <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)] mb-1">Gagal / Ditutup</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* Users Demographics */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[var(--text-h4)] text-[var(--color-neutral-900)]">Demografi Pengguna</h3>
              </div>
              
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-center p-4 bg-[var(--color-neutral-50)] rounded-[var(--radius-m)] border border-[var(--color-neutral-100)]">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-[var(--color-primary-600)]" />
                    <span className="font-[600] text-[var(--color-neutral-700)]">Investor (Pendana)</span>
                  </div>
                  <span className="font-bold text-[var(--text-h4)] text-[var(--color-neutral-900)]">{stats.totalInvestors}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-[var(--color-neutral-50)] rounded-[var(--radius-m)] border border-[var(--color-neutral-100)]">
                  <div className="flex items-center gap-3">
                    <Store className="w-5 h-5 text-amber-600" />
                    <span className="font-[600] text-[var(--color-neutral-700)]">Petani & UMKM</span>
                  </div>
                  <span className="font-bold text-[var(--text-h4)] text-[var(--color-neutral-900)]">{stats.totalUmkm}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-[var(--color-neutral-50)] rounded-[var(--radius-m)] border border-[var(--color-neutral-100)]">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <span className="font-[600] text-[var(--color-neutral-700)]">Mitra Koperasi</span>
                  </div>
                  <span className="font-bold text-[var(--text-h4)] text-[var(--color-neutral-900)]">{stats.totalKoperasi}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Projects Table/List */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[var(--text-h4)] text-[var(--color-neutral-900)]">Proyek Terbaru Masuk</h3>
                </div>
                <Link to="/admin/projects" className="text-[var(--color-primary-600)] text-sm font-[600] hover:underline flex items-center gap-1">
                  Lihat Semua <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {stats.recentProjects.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--color-neutral-200)] text-[var(--text-body-s)] font-[600] text-[var(--color-neutral-500)]">
                        <th className="pb-3 pr-4 font-semibold uppercase tracking-wider">Nama Proyek</th>
                        <th className="pb-3 px-4 font-semibold uppercase tracking-wider">Pemilik</th>
                        <th className="pb-3 px-4 font-semibold uppercase tracking-wider">Target Pendanaan</th>
                        <th className="pb-3 pl-4 font-semibold uppercase tracking-wider text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentProjects.map((project, idx) => (
                        <tr key={project.id} className={idx !== stats.recentProjects.length - 1 ? "border-b border-[var(--color-neutral-100)]" : ""}>
                          <td className="py-4 pr-4">
                            <p className="font-bold text-[var(--color-neutral-900)] line-clamp-1">{project.title}</p>
                            <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] mt-1">
                              {new Date(project.createdAt).toLocaleDateString('id-ID')}
                            </p>
                          </td>
                          <td className="py-4 px-4 text-[var(--color-neutral-700)]">
                            {/* @ts-ignore */}
                            {project.user?.name || "UMKM"}
                          </td>
                          <td className="py-4 px-4 font-[600] text-[var(--color-neutral-900)]">
                            {formatRupiah(Number(project.targetAmount))}
                          </td>
                          <td className="py-4 pl-4 text-right flex justify-end items-center h-full pt-6">
                            <ProjectStatusBadge status={project.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--color-neutral-500)] bg-[var(--color-neutral-50)] rounded-[var(--radius-l)] border-2 border-dashed border-[var(--color-neutral-200)]">
                  <Sprout className="w-10 h-10 mb-3 text-[var(--color-neutral-400)]" />
                  <p className="font-[600]">Belum ada proyek terdaftar</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
