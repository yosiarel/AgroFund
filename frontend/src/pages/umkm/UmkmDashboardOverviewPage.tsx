import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import api from "../../lib/axios"
import type { Project } from "../../types"
import { formatRupiah, toFiniteNumber } from "../../components/business/FinancialSummary"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { TrendingUp, Sprout, FolderGit2, Plus, ArrowRight } from "lucide-react"

/**
 * UMKM Dashboard Overview Page
 *
 * Provides a high-level summary of UMKM's activities:
 * - Total projects, active projects, total funding raised
 * - Quick links to create projects or view all projects
 */
function fetchMyProjects(): Promise<Project[]> {
  return api.get("/projects/my")
}

export function UmkmDashboardOverviewPage() {
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["my-projects"],
    queryFn: fetchMyProjects,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat ringkasan dasbor..." />
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

  // Calculate statistics
  const totalProjects = projects?.length || 0
  const activeProjects = projects?.filter(p => 
    ["FUNDRAISING", "DANA_TERPENUHI", "PROCUREMENT", "EXECUTION"].includes(p.status)
  ).length || 0

  const totalFundedAmount = projects?.reduce((sum, p) => {
    if (["FUNDRAISING", "DANA_TERPENUHI", "PROCUREMENT", "EXECUTION", "SUKSES_DITUTUP"].includes(p.status)) {
      return sum + toFiniteNumber(p.fundedAmount, 0)
    }
    return sum
  }, 0) || 0

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
            Dasbor Ringkasan
          </h1>
          <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)] mt-1">
            Pantau performa dan ringkasan aktivitas seluruh proyek Anda.
          </p>
        </div>
        <Link to="/umkm/projects/create">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Buat Proyek Baru
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center">
              <FolderGit2 className="w-6 h-6 text-[var(--color-primary-600)]" />
            </div>
            <div>
              <p className="text-[var(--text-body-s)] font-[600] text-[var(--color-neutral-500)] uppercase tracking-wider">
                Total Proyek
              </p>
              <h3 className="text-3xl font-bold text-[var(--color-neutral-900)] mt-1">
                {totalProjects}
              </h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
              <Sprout className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-[var(--text-body-s)] font-[600] text-[var(--color-neutral-500)] uppercase tracking-wider">
                Proyek Aktif (Berjalan)
              </p>
              <h3 className="text-3xl font-bold text-[var(--color-neutral-900)] mt-1">
                {activeProjects}
              </h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-[var(--text-body-s)] font-[600] text-[var(--color-neutral-500)] uppercase tracking-wider">
                Total Pendanaan Terkumpul
              </p>
              <h3 className="text-3xl font-bold text-[var(--color-neutral-900)] mt-1">
                {formatRupiah(totalFundedAmount)}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions / Getting Started */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <Card className="bg-gradient-to-br from-[var(--color-primary-50)] to-white border-[var(--color-primary-100)]">
          <div className="p-8">
            <h3 className="text-[var(--text-h3)] font-bold text-[var(--color-neutral-900)] mb-3">
              Butuh Modal Baru?
            </h3>
            <p className="text-[var(--color-neutral-600)] mb-6 max-w-md">
              Ajukan proyek agrikultur Anda berikutnya dan dapatkan pendanaan dari para investor yang siap mendukung.
            </p>
            <Link to="/umkm/projects/create">
              <Button variant="primary" className="shadow-lg shadow-[var(--color-primary-600)]/20">
                Mulai Penggalangan Dana
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="p-8 flex flex-col h-full justify-between">
            <div>
              <h3 className="text-[var(--text-h4)] font-bold text-[var(--color-neutral-900)] mb-2">
                Pantau Proyek Anda
              </h3>
              <p className="text-[var(--color-neutral-600)] mb-6">
                Lihat detail pendanaan, laporkan progres kepada investor, dan kelola pengadaan barang Anda di menu Proyek Saya.
              </p>
            </div>
            <div>
              <Link to="/umkm/projects">
                <Button variant="secondary" className="w-full">
                  Lihat Semua Proyek
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
