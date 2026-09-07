import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import api from "../../lib/axios"
import type { Project } from "../../types"
import { ProjectStatusBadge } from "../../components/business/ProjectStatusBadge"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { EmptyState } from "../../components/ui/EmptyState"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"
import { FolderKanban, ShieldCheck } from "lucide-react"

/**
 * AgroFund Admin Projects Page (Doc 4, Sec 6)
 *
 * Displays ALL projects across the platform.
 * Emphasizes projects that need Publication Review action.
 */
function fetchAllProjects(): Promise<Project[]> {
  return api.get("/projects")
}

export function AdminProjectsPage() {
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["admin-projects"],
    queryFn: fetchAllProjects,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat seluruh data proyek..." />
      </div>
    )
  }

  if (error || !projects) {
    return (
      <Alert variant="error">
        Gagal memuat data proyek sistem. Silakan coba lagi.
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
          Manajemen Proyek
        </h1>
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)] mt-1">
          Pantau seluruh proyek dalam ekosistem dan lakukan tinjauan akhir (Publication Review).
        </p>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="Sistem Kosong"
          description="Belum ada satupun proyek yang diajukan oleh UMKM ke dalam platform AgroFund."
          icon={<FolderKanban className="w-8 h-8" />}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map((project) => (
            <AdminProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

function AdminProjectCard({ project }: { project: Project }) {
  const needsReview = project.status === "PUBLICATION_REVIEW"

  return (
    <Card className={needsReview ? "border-[var(--color-primary-400)] shadow-[var(--shadow-e2)]" : ""}>
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-[var(--text-h4)] font-[600] text-[var(--color-neutral-900)]">
              {project.title}
            </h2>
            <div className="mt-2 flex items-center gap-3">
              <ProjectStatusBadge status={project.status} />
              <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                Oleh: <span className="font-[600] text-[var(--color-neutral-900)]">{project.user.name}</span>
              </span>
              {project.koperasi && (
                <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)] border-l pl-3">
                  Koperasi: <span className="font-[600] text-[var(--color-neutral-900)]">{project.koperasi.name}</span>
                </span>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            {needsReview ? (
              <Link to={`/admin/projects/${project.id}/review`}>
                <Button variant="primary">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Mulai Tinjauan Publikasi
                </Button>
              </Link>
            ) : (
              <Link to={`/admin/projects/${project.id}`}>
                <Button variant="secondary">Lihat Detail Sistem</Button>
              </Link>
            )}
          </div>
        </div>

        {needsReview && (
          <div className="bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] p-3 rounded-[var(--radius-m)]">
            <p className="text-[var(--text-body-s)] text-[var(--color-primary-800)]">
              <span className="font-[600]">Tindakan Diperlukan:</span> Koperasi telah memberikan persetujuan. Lakukan tinjauan final (Admin) agar proyek dapat lanjut ke tahap pembayaran Jaminan (Guarantee).
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
