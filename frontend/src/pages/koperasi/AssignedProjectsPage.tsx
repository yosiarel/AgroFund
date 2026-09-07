import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import api from "../../lib/axios"
import type { Project } from "../../types"
import { useAuth } from "../../contexts/AuthContext"
import { ProjectStatusBadge } from "../../components/business/ProjectStatusBadge"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { EmptyState } from "../../components/ui/EmptyState"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"
import { Briefcase, ClipboardCheck } from "lucide-react"

/**
 * Koperasi Assigned Projects Page (Doc 4, Sec 6)
 *
 * Displays projects where project.koperasiId === currentUser.id
 * Emphasizes projects that need Assessment action.
 */
function fetchProjects(): Promise<Project[]> {
  return api.get("/projects")
}

export function AssignedProjectsPage() {
  const { user } = useAuth()
  const { data: allProjects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  })

  // Filter projects assigned to this specific Koperasi
  const projects = allProjects?.filter(p => p.koperasi?.name === user?.name || p.koperasiId === user?.id) ?? []

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat daftar proyek..." />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="error">
        Gagal memuat daftar proyek. Silakan coba lagi.
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
          Assigned Projects
        </h1>
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)] mt-1">
          Daftar proyek UMKM yang berafiliasi dan membutuhkan pengawasan atau penilaian dari Koperasi Anda.
        </p>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="Belum Ada Proyek Afiliasi"
          description="Saat ini belum ada UMKM yang memilih Koperasi Anda sebagai pendamping."
          icon={<Briefcase className="w-8 h-8" />}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map((project) => (
            <KoperasiProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

function KoperasiProjectCard({ project }: { project: Project }) {
  const needsAssessment = project.status === "COOPERATIVE_ASSESSMENT"

  return (
    <Card className={needsAssessment ? "border-[var(--color-primary-400)] shadow-[var(--shadow-e2)]" : ""}>
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-[var(--text-h4)] font-[600] text-[var(--color-neutral-900)]">
              {project.title}
            </h2>
            <div className="mt-2 flex items-center gap-3">
              <ProjectStatusBadge status={project.status} />
              <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                Petani/UMKM: <span className="font-[600] text-[var(--color-neutral-900)]">{project.user.name}</span>
              </span>
            </div>
          </div>
          
          {/* Action CTA for Koperasi */}
          <div className="flex-shrink-0">
            {needsAssessment ? (
              <Link to={`/koperasi/assessment/${project.id}`}>
                <Button variant="primary">
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  Mulai Penilaian (Assessment)
                </Button>
              </Link>
            ) : (
              <Link to={`/koperasi/projects/${project.id}`}>
                <Button variant="secondary">Lihat Detail</Button>
              </Link>
            )}
          </div>
        </div>

        {needsAssessment && (
          <div className="bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] p-3 rounded-[var(--radius-m)]">
            <p className="text-[var(--text-body-s)] text-[var(--color-primary-800)]">
              <span className="font-[600]">Tindakan Diperlukan:</span> Proyek ini menunggu Penilaian Lapangan (Assessment) dari Anda sebelum dapat ditinjau oleh AgroFund.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
