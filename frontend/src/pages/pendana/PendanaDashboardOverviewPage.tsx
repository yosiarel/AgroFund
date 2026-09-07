import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import api from "../../lib/axios"
import type { Contribution } from "../../types"
import { formatRupiah } from "../../components/business/FinancialSummary"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { ProjectStatusBadge } from "../../components/business/ProjectStatusBadge"
import { Sprout, ShieldCheck, ArrowRight, Wallet, Calendar } from "lucide-react"

function fetchMyContributions(): Promise<Contribution[]> {
  return api.get("/finance/my-contributions")
}

export function PendanaDashboardOverviewPage() {
  const { data: contributions, isLoading, error } = useQuery<Contribution[]>({
    queryKey: ["my-contributions"],
    queryFn: fetchMyContributions,
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

  // Calculate statistics from SUCCESS contributions
  const paidContributions = contributions?.filter(c => c.status === "SUCCESS") || []
  const totalInvested = paidContributions.reduce((sum, c) => sum + (c.amount || 0), 0)

  // Unique active projects being funded
  const uniqueProjects = new Set(paidContributions.map(c => c.project?.id).filter(Boolean))
  const activeProjectsCount = uniqueProjects.size

  // Top 3 recent contributions
  const recentContributions = [...paidContributions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
            Dasbor Pendana
          </h1>
          <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)] mt-1">
            Pantau portofolio pendanaan agrikultur Anda.
          </p>
        </div>
        <Link to="/pendana/discover">
          <Button variant="primary">
            <Sprout className="w-4 h-4 mr-2" />
            Temukan Proyek
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-[var(--text-body-s)] font-[600] text-[var(--color-neutral-500)] uppercase tracking-wider">
                Total Pendanaan Aktif
              </p>
              <h3 className="text-3xl font-bold text-[var(--color-neutral-900)] mt-1">
                {formatRupiah(totalInvested)}
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
                Proyek Didanai
              </p>
              <h3 className="text-3xl font-bold text-[var(--color-neutral-900)] mt-1">
                {activeProjectsCount}
              </h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[var(--text-body-s)] font-[600] text-[var(--color-neutral-500)] uppercase tracking-wider">
                Status Keamanan
              </p>
              <h3 className="text-xl font-bold text-[var(--color-neutral-900)] mt-2 text-blue-700">
                Terproteksi
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Contributions Section */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[var(--text-h3)] font-bold text-[var(--color-neutral-900)]">
            Portofolio Terbaru
          </h3>
        </div>

        {recentContributions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentContributions.map(contrib => (
              <Card key={contrib.id} className="hover:shadow-[var(--shadow-e2)] transition-shadow">
                <div className="p-6 flex flex-col h-full gap-5">
                  <div>
                    <h4 className="font-bold text-[var(--text-h4)] text-[var(--color-neutral-900)] line-clamp-2" title={contrib.project.title}>
                      {contrib.project.title}
                    </h4>
                    <div className="flex items-center text-[var(--text-caption)] text-[var(--color-neutral-500)] mt-2 gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(contrib.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-[var(--color-neutral-100)] flex justify-between items-end">
                    <div>
                      <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] mb-1">Nominal</p>
                      <p className="font-bold text-[var(--text-body-l)] text-[var(--color-primary-700)]">{formatRupiah(contrib.amount)}</p>
                    </div>
                    <ProjectStatusBadge status={contrib.project.status} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-[var(--color-neutral-50)] border-dashed border-2 border-[var(--color-neutral-200)] flex flex-col items-center justify-center py-12 text-center">
            <Wallet className="w-12 h-12 text-[var(--color-neutral-400)] mb-4" />
            <p className="text-[var(--text-body-m)] font-[600] text-[var(--color-neutral-700)] mb-1">Belum ada portofolio Anda</p>
            <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)] mb-4">Anda belum pernah melakukan pendanaan pada proyek apapun.</p>
            <Link to="/pendana/discover">
              <Button variant="secondary" size="sm">Mulai Mendanai</Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Quick Actions / Getting Started */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <Card className="bg-gradient-to-br from-[var(--color-primary-50)] to-white border-[var(--color-primary-100)]">
          <div className="p-8">
            <h3 className="text-[var(--text-h3)] font-bold text-[var(--color-neutral-900)] mb-3">
              Mari Bantu Petani Lainnya
            </h3>
            <p className="text-[var(--color-neutral-600)] mb-6 max-w-md">
              Masih banyak UMKM agrikultur yang membutuhkan dukungan Anda. Mulai dari Rp100.000 untuk wujudkan kemandirian pangan.
            </p>
            <Link to="/pendana/discover">
              <Button variant="primary" className="shadow-lg shadow-[var(--color-primary-600)]/20">
                Jelajahi Proyek
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="p-8 flex flex-col h-full justify-between">
            <div>
              <h3 className="text-[var(--text-h4)] font-bold text-[var(--color-neutral-900)] mb-2">
                Pantau Portofolio Anda
              </h3>
              <p className="text-[var(--color-neutral-600)] mb-6">
                Lihat perkembangan proyek yang Anda danai, klaim Natura (bagi hasil panen), dan cek riwayat transaksi Anda.
              </p>
            </div>
            <div>
              <Link to="/pendana/contributions">
                <Button variant="secondary" className="w-full">
                  Lihat Portofolio Saya
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
