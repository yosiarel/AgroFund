import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { Project } from "../../types"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/Card"
import { formatRupiah, toFiniteNumber } from "../../components/business/FinancialSummary"
import { ShieldCheck, Receipt, AlertTriangle } from "lucide-react"

function fetchProject(id: string): Promise<Project> {
  return api.get(`/projects/${id}`)
}

export function GuaranteePaymentPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId,
  })

  const payMutation = useMutation({
    mutationFn: () => api.post(`/finance/projects/${projectId}/guarantee/pay`),
    onSuccess: (data: any) => {
      if (data?.invoiceUrl) {
        window.location.href = data.invoiceUrl
      } else {
        navigate(`/umkm/projects/${projectId}`)
      }
    }
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat rincian Guarantee..." />
      </div>
    )
  }

  if (error || !project) {
    return (
      <Alert variant="error">
        Gagal memuat rincian proyek. Proyek mungkin tidak ditemukan.
      </Alert>
    )
  }

  // Calculate Guarantee (5% of Basic Procurement Capital)
  const bpc = toFiniteNumber(project.basicProcurementCapital)
  const guaranteeAmount = Math.round(bpc * 0.05)
  const processingFee = 4000 // Mock admin fee
  const totalPayment = guaranteeAmount + processingFee

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-[var(--text-h2)] font-[700] text-[var(--color-neutral-900)]">
          Penempatan Guarantee (Jaminan)
        </h1>
        <p className="text-[var(--text-body-l)] text-[var(--color-neutral-600)] mt-2">
          {project.title}
        </p>
      </div>

      <Alert variant="warning" className="bg-[var(--color-warning-50)] border-[var(--color-warning-200)]">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-[var(--color-warning-600)] flex-shrink-0" />
          <div className="text-[var(--text-body-m)] text-[var(--color-warning-900)]">
            <span className="font-[600]">Perhatian:</span> Guarantee bukan bagian dari Target Pendanaan. Dana ini sebagai komitmen Anda terhadap keberhasilan proyek dan akan dikembalikan (Refund) saat proyek sukses ditutup.
          </div>
        </div>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Rincian Jaminan
          </CardTitle>
          <p className="text-[var(--text-body-s)] text-[var(--color-neutral-600)]">
            Berdasarkan 5% dari Modal Pengadaan (Basic Procurement Capital)
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex justify-between items-center py-2 border-b border-[var(--color-neutral-100)]">
            <span className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">Modal Pengadaan (BPC)</span>
            <span className="text-[var(--text-body-m)] font-[600] text-[var(--color-neutral-900)]">{formatRupiah(bpc)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[var(--color-neutral-100)]">
            <span className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">Guarantee Rate</span>
            <span className="text-[var(--text-body-m)] font-[600] text-[var(--color-neutral-900)]">5%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[var(--color-neutral-100)]">
            <span className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">Jumlah Guarantee</span>
            <span className="text-[var(--text-body-m)] font-[600] text-[var(--color-neutral-900)]">{formatRupiah(guaranteeAmount)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[var(--color-neutral-100)]">
            <span className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">Biaya Pemrosesan</span>
            <span className="text-[var(--text-body-m)] font-[600] text-[var(--color-neutral-900)]">{formatRupiah(processingFee)}</span>
          </div>
          
          <div className="flex justify-between items-center pt-4 mt-2">
            <span className="text-[var(--text-h4)] text-[var(--color-neutral-900)] font-[600]">Total Pembayaran</span>
            <span className="text-[var(--text-h3)] font-[700] text-[var(--color-primary-700)]">{formatRupiah(totalPayment)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3 pt-6">
          <Button 
            variant="primary" 
            className="w-full" 
            size="lg"
            onClick={() => payMutation.mutate()}
            disabled={payMutation.isPending}
          >
            {payMutation.isPending ? "Memproses..." : `Bayar ${formatRupiah(totalPayment)}`}
          </Button>
          <Button 
            variant="tertiary" 
            className="w-full"
            onClick={() => navigate(-1)}
            disabled={payMutation.isPending}
          >
            Kembali
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
