import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { Project } from "../../types"
import { ProjectStatusBadge } from "../../components/business/ProjectStatusBadge"
import { FundingProgressBar } from "../../components/business/FundingProgressBar"
import { formatRupiah } from "../../components/business/FinancialSummary"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Building2, CheckCircle2, Clock, ShieldAlert } from "lucide-react"

function fetchProject(id: string): Promise<Project> {
  return api.get(`/projects/${id}`)
}

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()

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
      <Alert variant="error">
        Gagal memuat detail proyek. Proyek mungkin tidak ditemukan.
      </Alert>
    )
  }

  const action = getNextAction(project)

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-[var(--text-h2)] font-[700] text-[var(--color-neutral-900)] leading-tight">
            {project.title}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <ProjectStatusBadge status={project.status} />
            <span className="text-[var(--text-body-s)] text-[var(--color-neutral-500)]">
              Dibuat pada {new Date(project.createdAt).toLocaleDateString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - CONTENT */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Action Panel (Dynamic based on status) */}
          {action && (
            <Card className="border-[var(--color-primary-200)] bg-[var(--color-primary-50)] shadow-none">
              <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="text-[var(--text-h4)] font-[600] text-[var(--color-neutral-900)]">
                      {action.title}
                    </h3>
                    <p className="text-[var(--text-body-m)] text-[var(--color-neutral-700)] mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
                {action.href && (
                  <Link to={action.href} className="w-full sm:w-auto">
                    <Button variant={action.primary ? "primary" : "secondary"} className="w-full sm:w-auto">
                      {action.ctaLabel}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Tentang Proyek</CardTitle></CardHeader>
            <CardContent>
              <p className="text-[var(--text-body-m)] text-[var(--color-neutral-700)] leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </CardContent>
          </Card>

          {project.procurementNeeds && project.procurementNeeds.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Kebutuhan Pengadaan</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-3">
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
                      {project.procurementNeeds.map((need, idx) => (
                        <tr key={need.id || idx} className="border-b border-[var(--color-neutral-100)] last:border-0">
                          <td className="py-3 px-1 text-[var(--text-body-s)] text-[var(--color-neutral-900)] font-[500]">{need.item}</td>
                          <td className="py-3 px-1 text-[var(--text-body-s)] text-[var(--color-neutral-700)] text-right whitespace-nowrap">{need.quantity} {need.unit}</td>
                          <td className="py-3 px-1 text-[var(--text-body-s)] text-[var(--color-neutral-900)] text-right whitespace-nowrap">{formatRupiah(Number(need.estimatedPrice))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN - FINANCIALS */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle>Target Pendanaan</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div>
                <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] mb-1">Total Target</p>
                <p className="text-[var(--text-h3)] font-[700] text-[var(--color-primary-700)]">
                  {formatRupiah(project.totalTarget)}
                </p>
              </div>

              {(project.status === "FUNDRAISING" || project.status === "DANA_TERPENUHI") && (
                <FundingProgressBar 
                  fundedAmount={project.fundedAmount}
                  targetAmount={project.totalTarget}
                  deadline={project.fundraisingDeadline || ""}
                  showRemainingLabel
                />
              )}

              <div className="pt-4 border-t border-[var(--color-neutral-200)] flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-body-s)] text-[var(--color-neutral-600)]">Modal Pengadaan</span>
                  <span className="text-[var(--text-body-s)] font-[500] text-[var(--color-neutral-900)]">{formatRupiah(project.basicProcurementCapital)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-body-s)] text-[var(--color-neutral-600)]">Cadangan Fluktuasi Harga</span>
                  <span className="text-[var(--text-body-s)] font-[500] text-[var(--color-neutral-900)]">{formatRupiah(project.priceReserve)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-body-s)] text-[var(--color-neutral-600)]">Biaya Natura</span>
                  <span className="text-[var(--text-body-s)] font-[500] text-[var(--color-neutral-900)]">{formatRupiah(project.naturaCost)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {project.koperasi && (
            <Card>
              <CardHeader><CardTitle>Koperasi Pendamping</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-neutral-100)] flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-[var(--color-neutral-500)]" />
                  </div>
                  <div>
                    <p className="text-[var(--text-body-m)] font-[600] text-[var(--color-neutral-900)]">
                      {project.koperasi.name}
                    </p>
                    <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                      Pendamping Terverifikasi
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function getNextAction(project: Project) {
  switch (project.status) {
    case "DRAFT":
      return {
        title: "Draf Proyek Siap",
        description: "Proyek Anda masih berupa draf. Ajukan ke Koperasi untuk dilakukan penilaian lapangan.",
        ctaLabel: "Ajukan Penilaian",
        href: `/umkm/projects/${project.id}#submit`,
        primary: true,
        icon: <Clock className="w-6 h-6 text-[var(--color-primary-600)]" />
      }
    case "COOPERATIVE_ASSESSMENT":
      return {
        title: "Penilaian Koperasi",
        description: "Koperasi pendamping sedang melakukan verifikasi lapangan terhadap proyek Anda. Anda akan diberitahu setelah selesai.",
        icon: <Clock className="w-6 h-6 text-[var(--color-primary-600)]" />
      }
    case "PUBLICATION_REVIEW":
      return {
        title: "Review Publikasi AgroFund",
        description: "Tim AgroFund sedang meninjau kelayakan proyek Anda untuk dipublikasikan di platform.",
        icon: <Clock className="w-6 h-6 text-[var(--color-primary-600)]" />
      }
    case "GUARANTEE_PLACEMENT":
      return {
        title: "Pembayaran Guarantee Dibutuhkan",
        description: "Proyek Anda telah disetujui! Lakukan penempatan Guarantee (Jaminan) sebesar 5% dari Modal Pengadaan untuk memulai penggalangan dana.",
        ctaLabel: "Bayar Guarantee",
        href: `/umkm/projects/${project.id}/guarantee`,
        primary: true,
        icon: <ShieldAlert className="w-6 h-6 text-[var(--color-primary-600)]" />
      }
    case "FUNDRAISING":
      return {
        title: "Penggalangan Dana Aktif",
        description: "Proyek Anda sedang ditawarkan kepada Pendana. Bagikan link proyek untuk mempercepat pendanaan.",
        icon: <CheckCircle2 className="w-6 h-6 text-[var(--color-success-600)]" />
      }
    case "DANA_TERPENUHI":
      return {
        title: "Dana Telah Terpenuhi",
        description: "Selamat! Dana telah terkumpul penuh. Buat pengajuan daftar pengadaan barang untuk diverifikasi Koperasi pendamping.",
        ctaLabel: "Buat Pengadaan",
        href: `/umkm/projects/${project.id}/procurement/create`,
        primary: true,
        icon: <CheckCircle2 className="w-6 h-6 text-[var(--color-success-600)]" />
      }
    case "PROCUREMENT":
      return {
        title: "Pengadaan Barang Sedang Berjalan",
        description: "Koperasi sedang memproses Purchase Order dan pembayaran ke Supplier. Pantau status pengadaan dan konfirmasi penerimaan barang.",
        ctaLabel: "Kelola Pengadaan",
        href: `/umkm/projects/${project.id}/procurement`,
        primary: true,
        icon: <Clock className="w-6 h-6 text-[var(--color-primary-600)]" />
      }
    case "EXECUTION":
      return {
        title: "Tahap Eksekusi & Pelaksanaan",
        description: "Proyek aktif berjalan di lapangan. Laporkan progres milestone dan unggah bukti faktual sesuai jadwal berkala.",
        ctaLabel: "Lapor Kemajuan Lapangan",
        href: `/umkm/projects/${project.id}/execution`,
        primary: true,
        icon: <CheckCircle2 className="w-6 h-6 text-[var(--color-primary-600)]" />
      }
    case "NATURA_FULFILLMENT":
      return {
        title: "Penyaluran Natura & Laporan Akhir",
        description: "Hasil panen/output proyek tersedia. Lakukan penyaluran paket natura kepada Pendana dan kirimkan laporan akhir.",
        ctaLabel: "Kelola Penyaluran Natura",
        href: `/umkm/projects/${project.id}/execution`,
        primary: true,
        icon: <CheckCircle2 className="w-6 h-6 text-[var(--color-success-600)]" />
      }
    case "SUKSES_DITUTUP":
      return {
        title: "Proyek Selesai & Sukses Ditutup",
        description: "Seluruh tahapan pengadaan, eksekusi lapangan, dan penyaluran natura telah selesai dan terverifikasi secara penuh.",
        ctaLabel: "Lihat Ringkasan",
        href: `/umkm/projects/${project.id}/execution`,
        primary: false,
        icon: <CheckCircle2 className="w-6 h-6 text-[var(--color-success-600)]" />
      }
    default:
      return null
  }
}
