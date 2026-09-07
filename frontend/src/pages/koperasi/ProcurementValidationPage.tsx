import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { ProcurementRequest } from "../../types"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Textarea } from "../../components/ui/Textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Modal } from "../../components/ui/Modal"
import { formatRupiah } from "../../components/business/FinancialSummary"
import { ShoppingBag, CheckCircle, XCircle, FileText, ShieldCheck } from "lucide-react"

export function ProcurementValidationPage() {
  const queryClient = useQueryClient()
  const [rejectRequest, setRejectRequest] = useState<{ id: string; projectTitle: string } | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const { data: requests, isLoading } = useQuery<ProcurementRequest[]>({
    queryKey: ["koperasi-procurements"],
    queryFn: () => api.get("/procurement/requests"),
  })

  const approveMutation = useMutation({
    mutationFn: (requestId: string) =>
      api.post(`/procurement/requests/${requestId}/approve`, { status: 'APPROVED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["koperasi-procurements"] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      api.post(`/procurement/requests/${requestId}/approve`, { status: 'REJECTED', notes: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["koperasi-procurements"] })
      setRejectRequest(null)
      setRejectReason("")
    },
  })

  const issuePoMutation = useMutation({
    mutationFn: (requestId: string) =>
      api.post(`/procurement/requests/${requestId}/issue-po`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["koperasi-procurements"] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat pengadaan proyek..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
          Validasi Pengadaan & Penerbitan PO
        </h1>
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">
          Validasi item kebutuhan barang dari UMKM, verifikasi supplier, dan terbitkan Purchase Order (PO) langsung.
        </p>
      </div>

      <Alert variant="info" className="bg-[var(--color-primary-50)] border-[var(--color-primary-200)]">
        <div className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--color-primary-600)] flex-shrink-0" />
          <div className="text-[var(--text-body-m)] text-[var(--color-primary-900)]">
            <span className="font-[600]">Integritas Finansial (Doc 4 Sec 39):</span> Koperasi memvalidasi kewajaran harga dan rekening Supplier. Sistem AgroFund akan mengeksekusi pembayaran langsung ke rekening Supplier tanpa melewati kas Koperasi atau UMKM.
          </div>
        </div>
      </Alert>

      <div className="flex flex-col gap-4">
        {(!requests || requests.length === 0) ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <ShoppingBag className="w-12 h-12 text-[var(--color-neutral-400)] mb-3" />
              <p className="text-[var(--text-body-l)] font-[600] text-[var(--color-neutral-800)]">
                Tidak ada pengajuan pengadaan yang menunggu validasi
              </p>
              <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)] max-w-md mt-1">
                Seluruh pengajuan dari proyek UMKM yang ditugaskan telah divalidasi.
              </p>
            </CardContent>
          </Card>
        ) : (
          requests.map((req) => {
            const totalEst = req.items?.reduce(
              (sum, item) => sum + (item.quantity || 0) * (item.estimatedUnitPrice || 0),
              0
            )

            return (
              <Card key={req.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[var(--text-h5)]">
                        {req.project?.title || `Proyek #${req.projectId.slice(0, 8)}`}
                      </CardTitle>
                      <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                        Pengajuan ID: {req.id} • Diajukan: {new Date(req.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
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
                        ? "PO Terbit & Dibayar"
                        : req.status === "APPROVED"
                        ? "Disetujui"
                        : req.status === "REJECTED"
                        ? "Ditolak"
                        : "Menunggu Validasi Koperasi"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {/* Items list */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[var(--text-body-s)]">
                      <thead>
                        <tr className="border-b border-[var(--color-neutral-200)] text-[var(--color-neutral-600)]">
                          <th className="py-2">Item Barang</th>
                          <th className="py-2 text-right">Jumlah</th>
                          <th className="py-2 text-right">Estimasi Satuan</th>
                          <th className="py-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {req.items?.map((item) => (
                          <tr key={item.id} className="border-b border-[var(--color-neutral-100)] last:border-0">
                            <td className="py-2.5 font-[500] text-[var(--color-neutral-900)]">{item.name}</td>
                            <td className="py-2.5 text-right">{item.quantity} {item.unit}</td>
                            <td className="py-2.5 text-right">{formatRupiah(item.estimatedUnitPrice)}</td>
                            <td className="py-2.5 text-right font-[600] text-[var(--color-neutral-900)]">
                              {formatRupiah(item.quantity * item.estimatedUnitPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Supplier detail */}
                  {req.nominatedSupplier && (
                    <div className="p-3 bg-[var(--color-neutral-50)] rounded-[var(--radius-s)] border border-[var(--color-neutral-200)] text-[var(--text-body-s)]">
                      <p className="font-[600] text-[var(--color-neutral-900)]">Supplier Diajukan UMKM:</p>
                      <p className="text-[var(--color-neutral-700)]">
                        {req.nominatedSupplier.name} ({req.nominatedSupplier.contactInfo}) • {req.nominatedSupplier.bankName} - {req.nominatedSupplier.bankAccountNumber}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-[var(--text-body-s)] text-[var(--color-neutral-500)]">Total Alokasi: </span>
                      <span className="font-[700] text-[var(--color-primary-700)] text-[var(--text-body-l)]">
                        {formatRupiah(totalEst)}
                      </span>
                    </div>

                    {req.status === "REQUESTED" && (
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setRejectRequest({
                              id: req.id,
                              projectTitle: req.project?.title || `Proyek #${req.projectId.slice(0, 8)}`,
                            })
                          }}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Tolak Pengajuan
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => approveMutation.mutate(req.id)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Validasi & Setujui
                        </Button>
                      </div>
                    )}

                    {req.status === "APPROVED" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => issuePoMutation.mutate(req.id)}
                        disabled={issuePoMutation.isPending}
                      >
                        <FileText className="w-4 h-4 mr-1" /> Terbitkan PO & Cairkan ke Supplier
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Reject Modal */}
      {rejectRequest && (
        <Modal
          isOpen={!!rejectRequest}
          onClose={() => {
            setRejectRequest(null)
            setRejectReason("")
          }}
          title="Penolakan Pengajuan Pengadaan"
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="tertiary"
                onClick={() => {
                  setRejectRequest(null)
                  setRejectReason("")
                }}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                disabled={!rejectReason.trim()}
                onClick={() =>
                  rejectMutation.mutate({
                    requestId: rejectRequest.id,
                    reason: rejectReason.trim(),
                  })
                }
                isLoading={rejectMutation.isPending}
              >
                Konfirmasi Penolakan
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            <p className="text-[var(--text-body-m)] text-[var(--color-neutral-800)]">
              Proyek: <strong>{rejectRequest.projectTitle}</strong>
            </p>
            <Textarea
              label="Alasan Penolakan Pengadaan"
              placeholder="Jelaskan alasan harga tidak wajar atau dokumen supplier yang tidak sesuai..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              required
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
