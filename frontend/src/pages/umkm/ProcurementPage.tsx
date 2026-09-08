import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { Project, ProcurementRequest } from "../../types"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { formatRupiah } from "../../components/business/FinancialSummary"
import { ArrowLeft, Plus, ShoppingBag, ShieldCheck } from "lucide-react"

export function ProcurementPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const { data: project, isLoading: isProjectLoading } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: () => api.get(`/projects/${projectId}`),
    enabled: !!projectId,
  })

  const { data: requests, isLoading: isRequestsLoading } = useQuery<ProcurementRequest[]>({
    queryKey: ["procurement-requests", projectId],
    queryFn: () => api.get(`/procurement/projects/${projectId}/requests`),
    enabled: !!projectId,
  })

  if (isProjectLoading || isRequestsLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat pengadaan proyek..." />
      </div>
    )
  }

  if (!project) {
    return (
      <Alert variant="error">Proyek tidak ditemukan.</Alert>
    )
  }

  // Can create procurement only if project is DANA_TERPENUHI or PROCUREMENT
  const canCreateProcurement = project.status === "DANA_TERPENUHI" || project.status === "PROCUREMENT"

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="tertiary" className="px-2" onClick={() => navigate(`/umkm/projects/${projectId}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
              Pengadaan Barang (Procurement)
            </h1>
            <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">
              {project.title}
            </p>
          </div>
        </div>

        {canCreateProcurement && (
          <Link to={`/umkm/projects/${projectId}/procurement/create`}>
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-1.5" />
              Buat Pengajuan Pengadaan
            </Button>
          </Link>
        )}
      </div>

      {/* Financial Protection Notice (Doc 4 Sec 36) */}
      <Alert variant="info" className="bg-[var(--color-primary-50)] border-[var(--color-primary-200)]">
        <div className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--color-primary-600)] flex-shrink-0" />
          <div className="text-[var(--text-body-m)] text-[var(--color-primary-900)]">
            <span className="font-[600]">Integritas Pengadaan:</span> Dana proyek tidak pernah dicairkan tunai ke rekening UMKM. Pembayaran akan dilakukan langsung dari sistem AgroFund ke rekening Supplier terverifikasi setelah divalidasi oleh Koperasi pendamping.
          </div>
        </div>
      </Alert>

      {/* Procurement Request List */}
      <div className="flex flex-col gap-4">
        <h2 className="text-[var(--text-h4)] font-[600] text-[var(--color-neutral-900)]">
          Daftar Pengajuan Pengadaan ({requests?.length || 0})
        </h2>

        {(!requests || requests.length === 0) ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <ShoppingBag className="w-12 h-12 text-[var(--color-neutral-400)] mb-3" />
              <p className="text-[var(--text-body-l)] font-[600] text-[var(--color-neutral-800)]">
                Belum ada pengajuan pengadaan
              </p>
              <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)] max-w-md mt-1 mb-4">
                Buat pengajuan item pengadaan berdasarkan kebutuhan modal pengadaan yang telah disetujui.
              </p>
              {canCreateProcurement && (
                <Link to={`/umkm/projects/${projectId}/procurement/create`}>
                  <Button variant="primary">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Ajukan Sekarang
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          requests.map((req) => (
            <Card key={req.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[var(--text-h5)]">
                    Pengajuan #{req.id.slice(0, 8)}
                  </CardTitle>
                  <Badge
                    variant={
                      req.status === "PO_ISSUED"
                        ? "success"
                        : req.status === "APPROVED"
                        ? "info"
                        : req.status === "REJECTED"
                        ? "error"
                        : "warning"
                    }
                  >
                    {req.status === "PO_ISSUED"
                      ? "PO Diterbitkan & Dibayar"
                      : req.status === "APPROVED"
                      ? "Disetujui Koperasi"
                      : req.status === "REJECTED"
                      ? "Ditolak"
                      : "Menunggu Validasi"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[var(--text-body-s)]">
                    <thead>
                      <tr className="border-b border-[var(--color-neutral-200)] text-[var(--color-neutral-600)]">
                        <th className="py-2">Item Barang</th>
                        <th className="py-2 text-right">Jumlah</th>
                        <th className="py-2 text-right">Estimasi Satuan</th>
                        <th className="py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {req.items?.map((item) => (
                        <tr key={item.id} className="border-b border-[var(--color-neutral-100)] last:border-0">
                          <td className="py-2.5 font-[500] text-[var(--color-neutral-900)]">{item.name}</td>
                          <td className="py-2.5 text-right">{item.quantity} {item.unit || "satuan"}</td>
                          <td className="py-2.5 text-right">{formatRupiah(item.estimatedUnitPrice)}</td>
                          <td className="py-2.5 text-right font-[600] text-[var(--color-neutral-900)]">
                            {formatRupiah(Number(item.quantity || 0) * Number(item.estimatedUnitPrice || 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {req.notes && (
                  <p className="text-[var(--text-caption)] text-[var(--color-neutral-600)] bg-[var(--color-neutral-50)] p-3 rounded-[var(--radius-s)]">
                    <span className="font-[600]">Catatan:</span> {req.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
