import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import api from "../../lib/axios"
import type { Project } from "../../types"
import { ProjectStatusBadge } from "../../components/business/ProjectStatusBadge"
import { FundingProgressBar } from "../../components/business/FundingProgressBar"
import { formatRupiah } from "../../components/business/FinancialSummary"
import { Skeleton } from "../../components/ui/Skeleton"
import { EmptyState } from "../../components/ui/EmptyState"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"
import { FolderGit2, Plus } from "lucide-react"


function fetchMyProjects(): Promise<Project[]> {
  return api.get("/projects/my")
}

export function MyProjectsPage() {
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["my-projects"],
    queryFn: fetchMyProjects,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-80 max-w-full" />
          </div>
          <Skeleton className="h-10 w-40 rounded-[var(--radius-m)]" />
        </div>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <UmkmProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="error">
        Gagal memuat daftar proyek Anda. Silakan coba lagi.
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
            My Projects
          </h1>
          <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)] mt-1">
            Kelola semua proyek yang Anda ajukan ke platform AgroFund.
          </p>
        </div>
        <Link to="/umkm/projects/create">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Buat Proyek Baru
          </Button>
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <EmptyState
          title="Belum Ada Proyek"
          description="Anda belum mengajukan proyek apapun. Mulai dengan membuat proyek baru untuk mendapatkan pendanaan."
          icon={<FolderGit2 className="w-8 h-8" />}
          action={
            <Link to="/umkm/projects/create">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Buat Proyek Baru
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map((project) => (
            <UmkmProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

function UmkmProjectCard({ project }: { project: Project }) {
  const nextAction = getNextAction(project)

  return (
    <Card>
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <Link
              to={`/umkm/projects/${project.id}`}
              className="text-[var(--text-h4)] font-[600] text-[var(--color-neutral-900)] hover:text-[var(--color-primary-700)] transition-colors"
            >
              {project.title}
            </Link>
            <div className="mt-2">
              <ProjectStatusBadge status={project.status} />
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">Total Target</p>
            <p className="text-[var(--text-h4)] font-[700] text-[var(--color-primary-700)]">
              {formatRupiah(project.targetAmount)}
            </p>
          </div>
        </div>

        {/* Show funding progress only if in funding-relevant states */}
        {(project.status === "FUNDRAISING" || project.status === "DANA_TERPENUHI") && (
          <FundingProgressBar
            fundedAmount={project.fundedAmount}
            targetAmount={project.targetAmount}
            deadline={project.fundraisingDeadline}
            showRemainingLabel
          />
        )}

        {/* Next required action (Doc 4 Sec 34) */}
        {nextAction && (
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pt-2 border-t border-[var(--color-neutral-100)]">
            <div>
              <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">Tindakan Berikutnya</p>
              <p className="text-[var(--text-body-s)] font-[500] text-[var(--color-neutral-800)]">
                {nextAction.label}
              </p>
            </div>
            {nextAction.href && (
              <Link to={nextAction.href} className="w-full lg:w-auto">
                <Button variant="primary" size="sm" className="w-full lg:w-auto">
                  {nextAction.ctaLabel}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

/**
 * Next action per project state (Doc 4, Sec 4.3 — Action Must Follow Eligibility)
 * UI must show what UMKM can do at each stage.
 */
function getNextAction(project: Project): {
  label: string
  ctaLabel: string
  href?: string
} | null {
  switch (project.status) {
    case "DRAFT":
      return {
        label: "Draf proyek siap. Ajukan untuk penilaian Koperasi.",
        ctaLabel: "Ajukan Assessment",
        href: `/umkm/projects/${project.id}`,
      }
    case "COOPERATIVE_ASSESSMENT":
      return {
        label: "Sedang dalam penilaian Koperasi. Tidak ada tindakan yang diperlukan.",
        ctaLabel: "Lihat Status",
        href: `/umkm/projects/${project.id}`,
      }
    case "PUBLICATION_REVIEW":
      return {
        label: "Sedang dalam tinjauan publikasi AgroFund.",
        ctaLabel: "Lihat Status",
        href: `/umkm/projects/${project.id}`,
      }
    case "GUARANTEE_PLACEMENT":
      return {
        label: "Wajib membayar Guarantee untuk melanjutkan ke tahap pendanaan.",
        ctaLabel: "Bayar Guarantee",
        href: `/umkm/projects/${project.id}/guarantee`,
      }
    case "FUNDRAISING":
      return {
        label: "Proyek sedang membuka pendanaan. Pantau perkembangan.",
        ctaLabel: "Lihat Detail",
        href: `/umkm/projects/${project.id}`,
      }
    case "DANA_TERPENUHI":
      return {
        label: "Dana terpenuhi. Buat permintaan pengadaan sekarang.",
        ctaLabel: "Buat Procurement",
        href: `/umkm/projects/${project.id}/procurement/create`,
      }
    case "PROCUREMENT":
      return {
        label: "Pengadaan sedang berjalan. Upload bukti penerimaan barang.",
        ctaLabel: "Lihat Pengadaan",
        href: `/umkm/projects/${project.id}/procurement`,
      }
    case "EXECUTION":
      return {
        label: "Proyek dalam tahap eksekusi. Laporkan progres secara berkala.",
        ctaLabel: "Lapor Progres",
        href: `/umkm/projects/${project.id}/execution`,
      }
    case "SUKSES_DITUTUP":
    case "GAGAL_DITUTUP":
      return null
    default:
      return null
  }
}

function UmkmProjectCardSkeleton() {
  return (
    <Card>
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <Skeleton className="h-7 w-64 mb-3" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="text-right flex-shrink-0">
            <Skeleton className="h-4 w-20 mb-1 ml-auto" />
            <Skeleton className="h-7 w-32 ml-auto" />
          </div>
        </div>

        {/* Progress Bar Area */}
        <div className="pt-2">
          <div className="flex justify-between items-end mb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-2.5 w-full rounded-full mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>

        {/* Next Action Area */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pt-2 border-t border-[var(--color-neutral-100)]">
          <div className="w-full">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-full lg:w-32 rounded-[var(--radius-m)]" />
        </div>
      </div>
    </Card>
  )
}

