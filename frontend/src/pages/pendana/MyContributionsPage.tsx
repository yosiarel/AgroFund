import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import api from "../../lib/axios"
import type { Contribution } from "../../types"
import { ProjectStatusBadge } from "../../components/business/ProjectStatusBadge"
import { formatRupiah } from "../../components/business/FinancialSummary"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { EmptyState } from "../../components/ui/EmptyState"
import { Alert } from "../../components/ui/Alert"
import { Badge } from "../../components/ui/Badge"
import { Card } from "../../components/ui/Card"
import { Wallet, AlertCircle, CheckCircle, Clock, XCircle, HelpCircle } from "lucide-react"

/**
 * My Contributions Page (Doc 4, Sec 32 — Contribution Payment States)
 *
 * States: Pending, Processing, Success, Failed, Awaiting Confirmation
 *
 * Rule (Sec 32): If status is AWAITING_CONFIRMATION:
 *   → do NOT show as completed.
 *
 * No wallet terminology (Doc 4, Sec 4.6 & UX rule).
 */

interface ContributionResponse {
  contributions: Contribution[]
}

function fetchMyContributions(): Promise<ContributionResponse> {
  // Backend returns contributions for the logged-in user
  return api.get("/finance/my-contributions")
}

const STATUS_CONFIG: Record<Contribution["status"], {
  label: string
  variant: "default" | "success" | "warning" | "risk" | "error" | "info"
  Icon: React.ComponentType<{ className?: string }>
  description: string
}> = {
  PENDING: {
    label: "Menunggu Pembayaran",
    variant: "warning",
    Icon: Clock,
    description: "Pembayaran belum dilakukan. Selesaikan pembayaran untuk mengkonfirmasi kontribusi Anda.",
  },
  PROCESSING: {
    label: "Sedang Diproses",
    variant: "info",
    Icon: Clock,
    description: "Pembayaran sedang diproses oleh sistem.",
  },
  SUCCESS: {
    label: "Berhasil",
    variant: "success",
    Icon: CheckCircle,
    description: "Kontribusi telah terkonfirmasi.",
  },
  FAILED: {
    label: "Gagal",
    variant: "error",
    Icon: XCircle,
    description: "Pembayaran gagal. Silakan hubungi kami jika dana sudah terpotong.",
  },
  // Doc 4 Sec 32 & Doc 5 Sec 43 — AWAITING_CONFIRMATION:
  // - MUST NOT use visual success
  // - MUST be visually DISTINCT from PENDING (sudah bayar, belum dikonfirmasi sistem)
  AWAITING_CONFIRMATION: {
    label: "Menunggu Konfirmasi Sistem",
    variant: "default",      // Neutral — bukan warning, bukan success
    Icon: HelpCircle,        // Icon berbeda dari PENDING (Clock)
    description: "Pembayaran sudah dilakukan, namun belum dikonfirmasi oleh sistem. Kontribusi BELUM dianggap selesai.",
  },
}

import * as React from "react"

export function MyContributionsPage() {
  const { data, isLoading, error } = useQuery<ContributionResponse>({
    queryKey: ["my-contributions"],
    queryFn: fetchMyContributions,
  })

  const contributions = data?.contributions ?? []

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat kontribusi..." />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="error">
        Gagal memuat daftar kontribusi. Silakan coba lagi.
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
          My Contributions
        </h1>
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)] mt-1">
          Riwayat kontribusi pendanaan Anda ke proyek-proyek agrikultur.
        </p>
      </div>

      {contributions.length === 0 ? (
        <EmptyState
          title="Belum Ada Kontribusi"
          description="Anda belum mendanai proyek manapun. Mulai jelajahi proyek yang tersedia."
          icon={<Wallet className="w-8 h-8" />}
          action={
            <Link to="/pendana/discover">
              <button className="px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-[var(--radius-m)] hover:bg-[var(--color-primary-700)] transition-colors text-[var(--text-body-s)] font-[500]">
                Jelajahi Proyek
              </button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {contributions.map((contribution) => (
            <ContributionCard key={contribution.id} contribution={contribution} />
          ))}
        </div>
      )}
    </div>
  )
}

function ContributionCard({ contribution }: { contribution: Contribution }) {
  const statusCfg = STATUS_CONFIG[contribution.status]
  const { Icon } = statusCfg

  return (
    <Card>
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <Link
              to={`/pendana/discover/${contribution.project.id}`}
              className="text-[var(--text-h5)] font-[600] text-[var(--color-neutral-900)] hover:text-[var(--color-primary-700)] transition-colors"
            >
              {contribution.project.title}
            </Link>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <ProjectStatusBadge status={contribution.project.status} size="sm" />
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[var(--text-h4)] font-[700] text-[var(--color-primary-700)]">
              {formatRupiah(contribution.amount)}
            </p>
            <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
              {new Date(contribution.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Contribution Status (Sec 32) */}
        <div className="flex items-start gap-3 p-3 rounded-[var(--radius-m)] bg-[var(--color-neutral-50)] border border-[var(--color-neutral-100)]">
          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${statusCfg.variant === "success" ? "text-[var(--color-success-500)]" : statusCfg.variant === "error" ? "text-[var(--color-error-500)]" : "text-[var(--color-warning-500)]"}`} />
          <div>
            <p className="text-[var(--text-label)] font-[600] text-[var(--color-neutral-900)]">{statusCfg.label}</p>
            <p className="text-[var(--text-caption)] text-[var(--color-neutral-600)]">{statusCfg.description}</p>
          </div>
          <Badge variant={statusCfg.variant} className="ml-auto flex-shrink-0">
            {statusCfg.label}
          </Badge>
        </div>

        {/* Natura info if selected */}
        {contribution.naturaPackage && (
          <div className="text-[var(--text-body-s)] text-[var(--color-neutral-600)]">
            Paket Natura: <span className="font-[600] text-[var(--color-neutral-900)]">{contribution.naturaPackage.name}</span>
          </div>
        )}

        {/* Pay/Retry CTA for pending */}
        {(contribution.status === "PENDING" || contribution.status === "FAILED") && contribution.invoiceUrl && (
          <a
            href={contribution.invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-[var(--radius-m)] text-[var(--text-body-s)] font-[500] hover:bg-[var(--color-primary-700)] transition-colors w-fit"
          >
            <AlertCircle className="w-4 h-4" />
            {contribution.status === "FAILED" ? "Coba Bayar Lagi" : "Lanjutkan Pembayaran"}
          </a>
        )}
      </div>
    </Card>
  )
}
