import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import api from "../../lib/axios"
import type { Project } from "../../types"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { ProjectStatusBadge } from "../../components/business/ProjectStatusBadge"
import { formatRupiah } from "../../components/business/FinancialSummary"
import { Activity, ArrowRight } from "lucide-react"

export function ProjectMonitoringPage() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["koperasi-monitored-projects"],
    queryFn: () => api.get("/koperasi/projects"),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat data monitoring proyek..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
          Monitoring Pelaksanaan Proyek
        </h1>
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">
          Pantau status eksekusi lapangan, kepatuhan jadwal, dan kemajuan seluruh proyek binaan Koperasi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-[var(--color-primary-50)] border-[var(--color-primary-200)]">
          <p className="text-[var(--text-caption)] font-[600] text-[var(--color-primary-800)]">Total Proyek Binaan</p>
          <p className="text-[var(--text-h2)] font-[700] text-[var(--color-primary-700)] mt-1">{projects?.length || 0}</p>
        </Card>
        <Card className="p-4 bg-[var(--color-success-50)] border-[var(--color-success-200)]">
          <p className="text-[var(--text-caption)] font-[600] text-[var(--color-success-800)]">Dalam Eksekusi / Pengadaan</p>
          <p className="text-[var(--text-h2)] font-[700] text-[var(--color-success-700)] mt-1">
            {projects?.filter((p) => p.status === "PROCUREMENT" || p.status === "EXECUTION").length || 0}
          </p>
        </Card>
        <Card className="p-4 bg-[var(--color-warning-50)] border-[var(--color-warning-200)]">
          <p className="text-[var(--text-caption)] font-[600] text-[var(--color-warning-800)]">Perlu Perhatian / Berisiko</p>
          <p className="text-[var(--text-h2)] font-[700] text-[var(--color-warning-700)] mt-1">
            {projects?.filter((p) => p.status === "COOPERATIVE_ASSESSMENT").length || 0}
          </p>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-[var(--text-h4)] font-[600] text-[var(--color-neutral-900)]">
          Daftar Proyek Aktif
        </h2>

        {(!projects || projects.length === 0) ? (
          <Card>
            <CardContent className="py-12 text-center text-[var(--color-neutral-600)]">
              <Activity className="w-12 h-12 text-[var(--color-neutral-400)] mx-auto mb-2" />
              <p className="font-[600]">Belum ada proyek yang ditugaskan</p>
            </CardContent>
          </Card>
        ) : (
          projects.map((proj) => (
            <Card key={proj.id}>
              <div className="p-5 flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <ProjectStatusBadge status={proj.status} size="sm" />
                    <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                      UMKM: {proj.user?.name}
                    </span>
                  </div>
                  <h3 className="text-[var(--text-h4)] font-[600] text-[var(--color-neutral-900)] mt-1">
                    {proj.title}
                  </h3>
                  <p className="text-[var(--text-body-s)] text-[var(--color-neutral-600)] line-clamp-2">
                    {proj.description}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between gap-3 self-stretch">
                  <div className="text-right">
                    <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">Target Pendanaan</p>
                    <p className="text-[var(--text-body-l)] font-[700] text-[var(--color-neutral-900)]">
                      {formatRupiah(proj.totalTarget)}
                    </p>
                  </div>
                  <Link to={`/koperasi/assessment/${proj.id}`}>
                    <Button variant="secondary" size="sm">
                      Kelola Penilaian / Monitoring <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
