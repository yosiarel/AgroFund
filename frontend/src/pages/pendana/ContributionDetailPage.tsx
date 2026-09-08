import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { Contribution } from "../../types"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardFooter } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { formatRupiah, toFiniteNumber } from "../../components/business/FinancialSummary"
import { ArrowLeft, Receipt, ExternalLink, Leaf, AlertCircle } from "lucide-react"

function fetchContribution(id: string): Promise<Contribution> {
  return api.get(`/finance/contributions/${id}`)
}

export function ContributionDetailPage() {
  const { contributionId } = useParams<{ contributionId: string }>()
  const navigate = useNavigate()

  const { data: contribution, isLoading } = useQuery<Contribution>({
    queryKey: ["contribution", contributionId],
    queryFn: () => fetchContribution(contributionId!),
    enabled: !!contributionId,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat rincian pendanaan..." />
      </div>
    )
  }

  if (!contribution) {
    return (
      <Alert variant="error">
        Data kontribusi tidak ditemukan.
      </Alert>
    )
  }

  // Get status configuration (Doc 4 Sec 32)
  const getStatusCfg = (status: string) => {
    switch (status) {
      case "PAID": return { label: "Berhasil", variant: "success" as const }
      case "CANCELLED": return { label: "Dibatalkan", variant: "error" as const }
      case "REFUNDED": return { label: "Dikembalikan", variant: "info" as const }
      case "PENDING_PAYMENT":
      default: return { label: "Menunggu Pembayaran", variant: "warning" as const }
    }
  }

  const statusCfg = getStatusCfg(contribution.status)
  
  // Mock processing fee calculation
  const processingFee = 5000
  const totalPayment = toFiniteNumber(contribution.amount) + processingFee

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="tertiary" className="px-2" onClick={() => navigate("/pendana/contributions")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
          Rincian Pendanaan
        </h1>
      </div>

      {contribution.status === "CANCELLED" && (
        <Alert variant="error" className="mb-2">
          Pembayaran untuk pendanaan ini telah dibatalkan atau kedaluwarsa. Silakan ulangi proses pendanaan.
        </Alert>
      )}

      {contribution.status === "REFUNDED" && (
        <Alert variant="info" className="mb-2">
          Dana pendanaan ini telah dikembalikan ke rekening bank Anda.
        </Alert>
      )}

      <Card>
        <CardHeader className="border-b border-[var(--color-neutral-100)] pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] mb-1">
                Tanggal Transaksi
              </p>
              <p className="text-[var(--text-body-m)] font-[500] text-[var(--color-neutral-900)]">
                {new Date(contribution.createdAt).toLocaleDateString("id-ID", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                })}
              </p>
            </div>
            <div className="text-right">
              <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 flex flex-col gap-6">
          {/* Project Summary */}
          <div>
            <h3 className="text-[var(--text-h5)] font-[600] text-[var(--color-neutral-900)] mb-2">Proyek</h3>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 bg-[var(--color-neutral-50)] rounded-[var(--radius-m)] border border-[var(--color-neutral-200)]">
              <div>
                <p className="font-[500] text-[var(--color-neutral-900)]">{contribution.project.title}</p>
                <p className="text-[var(--text-caption)] text-[var(--color-neutral-600)]">ID: {contribution.project.id}</p>
              </div>
              <Link to={`/pendana/discover/${contribution.project.id}`} className="w-full lg:w-auto">
                <Button variant="secondary" size="sm" className="w-full lg:w-auto">
                  Lihat Proyek <ExternalLink className="w-3.5 h-3.5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div>
            <h3 className="text-[var(--text-h5)] font-[600] text-[var(--color-neutral-900)] mb-3">Rincian Pembayaran</h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center py-1">
                <span className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">Nominal Pendanaan</span>
                <span className="text-[var(--text-body-m)] font-[600] text-[var(--color-neutral-900)]">{formatRupiah(contribution.amount)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">Biaya Pemrosesan (Platform)</span>
                <span className="text-[var(--text-body-m)] font-[600] text-[var(--color-neutral-900)]">{formatRupiah(processingFee)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[var(--color-neutral-200)]">
                <span className="text-[var(--text-body-l)] font-[600] text-[var(--color-neutral-900)]">Total Pembayaran</span>
                <span className="text-[var(--text-h4)] font-[700] text-[var(--color-primary-700)]">{formatRupiah(totalPayment)}</span>
              </div>
            </div>
          </div>

          {/* Natura Selection */}
          {contribution.naturaPackage && (
            <div>
              <h3 className="text-[var(--text-h5)] font-[600] text-[var(--color-neutral-900)] mb-3">Paket Natura Dipilih</h3>
              <div className="flex items-start gap-3 p-4 bg-[var(--color-success-50)] rounded-[var(--radius-m)] border border-[var(--color-success-200)]">
                <Leaf className="w-5 h-5 text-[var(--color-success-600)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-[600] text-[var(--color-neutral-900)]">{contribution.naturaPackage.name}</p>
                  <p className="text-[var(--text-body-s)] text-[var(--color-neutral-700)] mt-1">{contribution.naturaPackage.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Refund Info (Doc 4 Sec 31) */}
          <div className="flex items-start gap-3 p-4 bg-[var(--color-info-50)] rounded-[var(--radius-m)] text-[var(--color-info-900)] text-[var(--text-body-s)]">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-[var(--color-info-600)]" />
            <div>
              <span className="font-[600]">Informasi Pembatalan & Pengembalian Dana:</span> Pendanaan ini tidak dapat ditarik kembali secara sepihak. Jika proyek dibatalkan atau gagal mencapai target, dana Anda (tidak termasuk biaya pemrosesan) akan dikembalikan secara penuh ke rekening Anda.
            </div>
          </div>
        </CardContent>
        
        {/* Payment CTA for PENDING */}
        {contribution.status === "PENDING_PAYMENT" && contribution.invoiceUrl && (
          <CardFooter className="bg-[var(--color-neutral-50)] border-t border-[var(--color-neutral-100)] p-6">
            <a 
              href={contribution.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-primary-600)] text-white rounded-[var(--radius-m)] font-[600] hover:bg-[var(--color-primary-700)] transition-colors"
            >
              <Receipt className="w-5 h-5" />
              Lanjutkan ke Pembayaran
            </a>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
