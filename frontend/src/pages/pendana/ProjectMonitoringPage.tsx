import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import api from "../../lib/axios"
import type { Contribution } from "../../types"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { ProjectStatusBadge } from "../../components/business/ProjectStatusBadge"
import { formatRupiah } from "../../components/business/FinancialSummary"
import { Activity, Eye, ShieldCheck, Clock } from "lucide-react"

export function ProjectMonitoringPage() {
  const { data: contributions, isLoading } = useQuery<Contribution[]>({
    queryKey: ["pendana-contributions"],
    queryFn: () => api.get("/finance/my-contributions"),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat proyek yang Anda danai..." />
      </div>
    )
  }

  // Filter only paid contributions
  const activeFundedProjects = contributions?.filter(
    (c) => c.status === "PAID"
  )

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
          Monitoring Perkembangan Proyek
        </h1>
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">
          Pantau realisasi pengadaan barang, kemajuan milestone lapangan, dan hasil panen dari proyek yang Anda danai secara transparan.
        </p>
      </div>

      <Alert variant="info" className="bg-[var(--color-primary-50)] border-[var(--color-primary-200)]">
        <div className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--color-primary-600)] flex-shrink-0" />
          <div className="text-[var(--text-body-m)] text-[var(--color-primary-900)]">
            <span className="font-[600]">Transparansi P2P Syariah:</span> Semua dokumentasi kemajuan diverifikasi secara faktual oleh Koperasi pendamping di lapangan untuk memastikan dana terserap sesuai rencana kebutuhan pengadaan (BPC).
          </div>
        </div>
      </Alert>

      <div className="flex flex-col gap-4">
        {(!activeFundedProjects || activeFundedProjects.length === 0) ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <Activity className="w-12 h-12 text-[var(--color-neutral-400)] mb-3" />
              <p className="text-[var(--text-body-l)] font-[600] text-[var(--color-neutral-800)]">
                Belum ada proyek aktif yang didanai
              </p>
              <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)] max-w-md mt-1 mb-4">
                Mulai mendanai proyek pertanian terverifikasi untuk melihat perkembangan eksekusi lapangannya di sini.
              </p>
              <Link to="/pendana/discover">
                <Button variant="primary">Eksplor Proyek</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          activeFundedProjects.map((c) => {
            const proj = c.project
            return (
              <Card key={c.id}>
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <ProjectStatusBadge status={proj.status} size="sm" />
                        <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                          Didanai: {new Date(c.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <h3 className="text-[var(--text-h4)] font-[600] text-[var(--color-neutral-900)]">
                        {proj.title}
                      </h3>
                      <p className="text-[var(--text-body-s)] text-[var(--color-neutral-600)] mt-1">
                        Koperasi Pendamping: {proj.koperasi?.name || "Koperasi Terverifikasi"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">Kontribusi Anda</p>
                      <p className="text-[var(--text-h4)] font-[700] text-[var(--color-primary-700)]">
                        {formatRupiah(c.amount)}
                      </p>
                    </div>
                  </div>

                  {/* Financial allocation overview (PB-095) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-[var(--color-neutral-50)] rounded-[var(--radius-m)] border border-[var(--color-neutral-200)] text-[var(--text-body-s)]">
                    <div>
                      <p className="text-[var(--color-neutral-500)]">Modal Pengadaan (BPC)</p>
                      <p className="font-[600] text-[var(--color-neutral-900)]">{formatRupiah(proj.basicProcurementCapital)}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-neutral-500)]">Dana Cadangan Harga</p>
                      <p className="font-[600] text-[var(--color-neutral-900)]">{formatRupiah(proj.priceReserve)}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-neutral-500)]">Total Target Proyek</p>
                      <p className="font-[600] text-[var(--color-neutral-900)]">{formatRupiah(proj.targetAmount)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 text-[var(--text-body-s)] text-[var(--color-neutral-600)]">
                      <Clock className="w-4 h-4 text-[var(--color-primary-600)] flex-shrink-0" />
                      <span>
                        Tahap Saat Ini:{" "}
                        <strong className="text-[var(--color-neutral-900)]">
                          {proj.status === "PROCUREMENT"
                            ? "Pengadaan Sarana Produksi (BPC)"
                            : proj.status === "EXECUTION"
                            ? "Pelaksanaan Lapangan & Monitoring"
                            : proj.status === "NATURA_FULFILLMENT"
                            ? "Penyaluran Paket Natura"
                            : proj.status === "SUKSES_DITUTUP"
                            ? "Proyek Sukses Diselesaikan"
                            : proj.status === "FUNDRAISING"
                            ? "Penggalangan Dana Aktif"
                            : proj.status === "DANA_TERPENUHI"
                            ? "Dana Terpenuhi — Persiapan Pengadaan"
                            : proj.status}
                        </strong>
                      </span>
                    </div>

                    <Link to={`/pendana/discover/${proj.id}`} className="w-full sm:w-auto">
                      <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                        <Eye className="w-4 h-4 mr-1.5" /> Lihat Detail Transparansi
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
