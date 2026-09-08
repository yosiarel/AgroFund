import { useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../lib/axios"
import type { Project } from "../../types"
import { ProjectStatusBadge } from "../../components/business/ProjectStatusBadge"
import { FundingProgressBar } from "../../components/business/FundingProgressBar"
import { NaturaPackageCard } from "./components/project-detail/NaturaPackageCard"
import { ContributeModal } from "./components/project-detail/ContributeModal"
import { formatRupiah, toFiniteNumber } from "../../components/business/FinancialSummary"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Building2, Users, CalendarDays, ShieldCheck } from "lucide-react"

function fetchProject(id: string): Promise<Project> {
  return api.get(`/projects/${id}`)
}

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false)

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat detail proyek..." />
      </div>
    )
  }

  if (error || !project) {
    return (
      <Alert variant="error" className="mt-4">
        Gagal memuat detail proyek. Proyek tidak ditemukan atau terjadi kesalahan.
      </Alert>
    )
  }

  const numFunded = toFiniteNumber(project.fundedAmount, 0)
  const numTarget = toFiniteNumber(project.targetAmount, 0)
  const percentage = numTarget > 0 ? Math.round((numFunded / numTarget) * 100) : 0
  const isFullyFunded = percentage >= 100
  const isExpired = project.fundraisingDeadline ? new Date() > new Date(project.fundraisingDeadline) : false

  // CTA eligibility (Doc 4, Sec 27)
  const canContribute =
    project.status === "FUNDRAISING" && !isFullyFunded && !isExpired

  const handleContributeClick = () => {
    if (!user) {
      navigate("/login", { state: { from: location } })
      return
    }
    if (user.role === "PENDANA") {
      setIsContributeModalOpen(true)
    }
  }

  const handleBackNavigation = () => {
    if (location.pathname.startsWith("/projects")) {
      navigate("/projects")
    } else if (location.pathname.startsWith("/umkm")) {
      navigate("/umkm/discover")
    } else {
      navigate("/pendana/discover")
    }
  }

  const allProcurementItems = (project.procurementRequests || project.procurements)?.flatMap(p => p.items || []) || []

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
        <button onClick={handleBackNavigation} className="hover:text-[var(--color-primary-600)] transition-colors">
          Discover Projects
        </button>
        <span className="mx-2">›</span>
        <span className="text-[var(--color-neutral-900)]">{project.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Main Info */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
              <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
                {project.title}
              </h1>
              <ProjectStatusBadge
                status={project.status}
                fundedAmount={project.fundedAmount}
                targetAmount={project.targetAmount}
                deadline={project.fundraisingDeadline}
                showAuthority
              />
            </div>

            {/* Fully Funded banner replaces CTA per Sec 30 */}
            {isFullyFunded && (
              <Alert variant="success" title="Dana Terpenuhi">
                Proyek ini telah mencapai target pendanaan. Pendanaan telah ditutup.
              </Alert>
            )}
            {isExpired && !isFullyFunded && (
              <Alert variant="warning" title="Funding Deadline Reached">
                Batas waktu pendanaan telah berakhir. Proyek ini tidak lagi menerima kontribusi.
              </Alert>
            )}
          </div>

          {/* Project Purpose & Scope */}
          <Card>
            <CardHeader><CardTitle>Tentang Proyek</CardTitle></CardHeader>
            <CardContent>
              {project.imageUrl && (
                <div className="mb-4 aspect-video w-full max-w-2xl rounded-[var(--radius-m)] overflow-hidden border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]">
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-contain" />
                </div>
              )}
              <p className="text-[var(--text-body-m)] text-[var(--color-neutral-700)] leading-[var(--text-body-m--line-height)] whitespace-pre-line">
                {project.description}
              </p>
            </CardContent>
          </Card>

          {/* UMKM & Koperasi — Doc 4 Sec 26 */}
          <Card>
            <CardHeader><CardTitle>Pelaku Proyek</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <InfoRow icon={<Users className="w-5 h-5" />} label="UMKM / Petani" value={project.user.name} />
              {project.koperasi && (
                <InfoRow
                  icon={<Building2 className="w-5 h-5" />}
                  label="Koperasi Pendamping"
                  value={project.koperasi.name}
                />
              )}
            </CardContent>
          </Card>

          {allProcurementItems.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Kebutuhan Pengadaan</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Alert variant="info">
                  Dana akan dialokasikan untuk kebutuhan pengadaan berikut.
                </Alert>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--color-neutral-200)]">
                        <th className="py-2 px-1 text-[var(--text-caption)] font-[600] text-[var(--color-neutral-600)]">Item</th>
                        <th className="py-2 px-1 text-[var(--text-caption)] font-[600] text-[var(--color-neutral-600)] text-right">Jumlah</th>
                        <th className="py-2 px-1 text-[var(--text-caption)] font-[600] text-[var(--color-neutral-600)] text-right">Estimasi Harga</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allProcurementItems.map((item, idx) => (
                        <tr key={item.id || idx} className="border-b border-[var(--color-neutral-100)] last:border-0">
                          <td className="py-3 px-1 text-[var(--text-body-s)] text-[var(--color-neutral-900)] font-[500]">{item.name}</td>
                          <td className="py-3 px-1 text-[var(--text-body-s)] text-[var(--color-neutral-700)] text-right whitespace-nowrap">{item.quantity} {item.unit || "satuan"}</td>
                          <td className="py-3 px-1 text-[var(--text-body-s)] text-[var(--color-neutral-900)] text-right whitespace-nowrap">{formatRupiah(item.estimatedUnitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Natura Packages — Doc 4 Sec 26 (if any) */}
          {project.naturaPackages && project.naturaPackages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Paket Natura</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Alert variant="info">
                  Natura adalah kompensasi non-finansial berupa produk hasil pertanian. Bukan bunga, bukan dividen.
                </Alert>
                {project.naturaPackages.map((pkg) => (
                  <NaturaPackageCard key={pkg.id} pkg={pkg} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Rules — Guarantee, cancellation, refund (Doc 4 Sec 26) */}
          <Card>
            <CardHeader><CardTitle>Ketentuan & Perlindungan</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <InfoRow
                icon={<ShieldCheck className="w-5 h-5 text-[var(--color-primary-500)]" />}
                label="Jaminan (Guarantee)"
                value={`${formatRupiah(toFiniteNumber(project.basicProcurementCapital) * 0.05)} (5% dari Modal Pengadaan)`}
              />
              <Alert variant="warning" title="Risiko Pendanaan">
                Pendanaan ini bukan deposito. Dana tidak dijamin kembali 100% jika proyek mengalami kegagalan.
                Recovery & Refund dilakukan sesuai ketentuan platform.
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Funding Widget */}
        <div className="flex flex-col gap-4">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Status Pendanaan</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <FundingProgressBar
                fundedAmount={project.fundedAmount}
                targetAmount={project.targetAmount}
                deadline={project.fundraisingDeadline}
                showRemainingLabel
              />

              <div className="flex flex-col gap-2 text-[var(--text-body-s)]">
                <div className="flex justify-between">
                  <span className="text-[var(--color-neutral-600)]">Modal Pengadaan</span>
                  <span className="font-[600]">{formatRupiah(project.basicProcurementCapital)}</span>
                </div>
                {toFiniteNumber(project.naturaCost) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-neutral-600)]">Biaya Natura</span>
                    <span className="font-[600]">{formatRupiah(project.naturaCost)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 mt-1">
                  <span className="font-[600] text-[var(--color-neutral-900)]">Total Target</span>
                  <span className="font-[700] text-[var(--color-primary-700)]">{formatRupiah(project.targetAmount)}</span>
                </div>
              </div>

              {/* CTA — only visible when canContribute (Doc 4 Sec 27) */}
              {canContribute && (
                <>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleContributeClick}
                  >
                    Danai Proyek Ini
                  </Button>
                  {user && user.role !== "PENDANA" && (
                    <p className="text-[var(--text-caption)] text-[var(--color-warning-700)] text-center">
                      Akun Anda ({user.role}) tidak memiliki izin mendanai. Gunakan akun Pendana.
                    </p>
                  )}
                </>
              )}

              <div className="flex items-center gap-2 text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  Batas pendanaan: {project.fundraisingDeadline ? new Date(project.fundraisingDeadline).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric"
                  }) : "-"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contribution Modal */}
      {canContribute && (
        <ContributeModal
          isOpen={isContributeModalOpen}
          onClose={() => setIsContributeModalOpen(false)}
          project={project}
        />
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      {icon && <div className="text-[var(--color-primary-500)] flex-shrink-0">{icon}</div>}
      <div>
        <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">{label}</p>
        <p className="text-[var(--text-body-m)] font-[500] text-[var(--color-neutral-900)]">{value}</p>
      </div>
    </div>
  )
}
