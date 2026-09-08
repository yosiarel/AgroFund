import { useQuery } from "@tanstack/react-query"
import { Link, useLocation } from "react-router-dom"
import api from "../../lib/axios"
import type { Project } from "../../types"
import { ProjectStatusBadge } from "../../components/business/ProjectStatusBadge"
import { FundingProgressBar } from "../../components/business/FundingProgressBar"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { EmptyState } from "../../components/ui/EmptyState"
import { Alert } from "../../components/ui/Alert"
import { Search } from "lucide-react"
import { toFiniteNumber } from "../../components/business/FinancialSummary"

/**
 * Discover Projects Page (Doc 4, Sec 25 — Pendana Project Discovery)
 *
 * Shows FUNDRAISING projects only — only these can be contributed to.
 * Filter & Search available per spec.
 *
 * Rule: CTA "Contribute" only visible if:
 *   status = FUNDRAISING AND funding < 100% AND deadline not reached (Doc 4 Sec 27)
 */
function fetchFundraisingProjects(): Promise<Project[]> {
  return api.get("/projects?status=FUNDRAISING")
}

export function DiscoverProjectsPage() {
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["projects", "FUNDRAISING"],
    queryFn: fetchFundraisingProjects,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat proyek..." />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="error" className="mt-4">
        Gagal memuat daftar proyek. Periksa koneksi internet Anda.
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
          Discover Projects
        </h1>
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)] mt-1">
          Jelajahi proyek agrikultur yang sedang membuka pendanaan.
        </p>
      </div>

      {/* Project Grid */}
      {!projects || projects.length === 0 ? (
        <EmptyState
          title="Belum Ada Proyek Tersedia"
          description="Saat ini belum ada proyek yang sedang membuka pendanaan. Coba lagi nanti."
          icon={<Search className="w-8 h-8" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const location = useLocation()
  const numFunded = toFiniteNumber(project.fundedAmount, 0)
  const numTarget = toFiniteNumber(project.targetAmount, 0)
  const percentage = numTarget > 0 ? Math.round((numFunded / numTarget) * 100) : 0
  const isFullyFunded = percentage >= 100

  const detailPath = location.pathname.startsWith("/projects")
    ? `/projects/${project.id}`
    : location.pathname.startsWith("/umkm")
    ? `/umkm/discover/${project.id}`
    : `/pendana/discover/${project.id}`

  return (
    <Link
      to={detailPath}
      className="group block bg-white rounded-[var(--radius-l)] border border-[var(--color-neutral-200)] shadow-[var(--shadow-e1)] hover:shadow-[var(--shadow-e2)] hover:border-[var(--color-primary-200)] transition-all duration-200 overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-5 border-b border-[var(--color-neutral-100)]">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-[var(--text-h5)] font-[600] text-[var(--color-neutral-900)] line-clamp-2 group-hover:text-[var(--color-primary-700)] transition-colors">
            {project.title}
          </h2>
          <ProjectStatusBadge
            status={project.status}
            fundedAmount={project.fundedAmount}
            targetAmount={project.targetAmount}
            deadline={project.fundraisingDeadline}
            size="sm"
          />
        </div>
        <p className="text-[var(--text-body-s)] text-[var(--color-neutral-600)] line-clamp-2">
          {project.description}
        </p>
      </div>

      {/* Card Body — Funding */}
      <div className="p-5">
        <FundingProgressBar
          fundedAmount={project.fundedAmount}
          targetAmount={project.targetAmount}
          deadline={project.fundraisingDeadline}
          showRemainingLabel={false}
        />
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-[var(--color-neutral-50)] border-t border-[var(--color-neutral-100)] flex items-center justify-between">
        <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
          oleh {project.user.name}
        </span>
        {/* CTA "Contribute" only shown when FUNDRAISING < 100% (Doc 4 Sec 27) */}
        {!isFullyFunded && project.status === "FUNDRAISING" && (
          <span className="text-[var(--text-caption)] font-[600] text-[var(--color-primary-600)]">
            Lihat & Danai →
          </span>
        )}
      </div>
    </Link>
  )
}
