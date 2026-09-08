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
import { Button } from "../../components/ui/Button"
import { TrendingUp, AlertCircle, CheckCircle, Clock, XCircle, HelpCircle } from "lucide-react"

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

function fetchMyContributions(): Promise<Contribution[]> {
  // Backend returns contributions for the logged-in user
  return api.get("/finance/my-contributions")
}

const STATUS_CONFIG: Record<Contribution["status"], {
  label: string
  variant: "default" | "success" | "warning" | "risk" | "error" | "info"
  Icon: React.ComponentType<{ className?: string }>
  description: string
}> = {
  PENDING_PAYMENT: {
    label: "Menunggu Pembayaran",
    variant: "warning",
    Icon: Clock,
    description: "Pembayaran belum dilakukan. Selesaikan pembayaran untuk mengkonfirmasi kontribusi Anda.",
  },
  PAID: {
    label: "Berhasil",
    variant: "success",
    Icon: CheckCircle,
    description: "Kontribusi telah terkonfirmasi.",
  },
  CANCELLED: {
    label: "Dibatalkan",
    variant: "error",
    Icon: XCircle,
    description: "Kontribusi telah dibatalkan.",
  },
  REFUNDED: {
    label: "Dikembalikan",
    variant: "info",
    Icon: HelpCircle,
    description: "Dana kontribusi telah dikembalikan ke rekening Anda.",
  },
}

import * as React from "react"

export function MyContributionsPage() {
  const { data: contributions = [], isLoading, error } = useQuery<Contribution[]>({
    queryKey: ["my-contributions"],
    queryFn: fetchMyContributions,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat kontribusi Anda..." />
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
            My Contributions
          </h1>
          <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)] mt-1">
            Riwayat dan status seluruh kontribusi pendanaan Anda.
          </p>
        </div>
        <Link to="/pendana/discover">
          <Button variant="primary">
            <TrendingUp className="w-4 h-4 mr-2" />
            Danai Proyek Baru
          </Button>
        </Link>
      </div>

      {contributions.length === 0 ? (
        <EmptyState
          title="Belum Ada Kontribusi"
          description="Anda belum mendanai proyek apapun. Jelajahi etalase untuk mulai mendanai proyek agrikultur potensial."
          icon={<TrendingUp className="w-8 h-8" />}
          action={
            <Link to="/pendana/discover">
              <Button variant="primary">
                <TrendingUp className="w-4 h-4 mr-2" />
                Mulai Mendanai
              </Button>
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
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <Link
              to={`/pendana/discover/${contribution.project.id}`}
              className="text-[var(--text-h4)] font-[600] text-[var(--color-neutral-900)] hover:text-[var(--color-primary-700)] transition-colors"
            >
              {contribution.project.title}
            </Link>
            <div className="mt-1">
              <ProjectStatusBadge status={contribution.project.status} size="sm" />
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">Nominal Kontribusi</p>
            <p className="text-[var(--text-h4)] font-[700] text-[var(--color-primary-700)]">
              {formatRupiah(contribution.amount)}
            </p>
          </div>
        </div>

        {/* Contribution Status (Sec 32) */}
        <div className="p-4 bg-[var(--color-neutral-50)] rounded-[var(--radius-m)] flex items-start gap-3 border border-[var(--color-neutral-100)]">
          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${statusCfg.variant === "success" ? "text-[var(--color-success-500)]" : statusCfg.variant === "error" ? "text-[var(--color-error-500)]" : "text-[var(--color-warning-500)]"}`} />
          <div>
            <p className="text-[var(--text-label)] font-[600] text-[var(--color-neutral-900)]">{statusCfg.label}</p>
            <p className="text-[var(--text-caption)] text-[var(--color-neutral-600)]">{statusCfg.description}</p>
          </div>
          <Badge variant={statusCfg.variant} className="ml-auto flex-shrink-0">
            {statusCfg.label}
          </Badge>
        </div>

        {/* Natura details if selected */}
        {contribution.naturaPackage && (
          <div className="text-[var(--text-body-s)] text-[var(--color-neutral-600)]">
            Paket Natura: <span className="font-[600] text-[var(--color-neutral-900)]">{contribution.naturaPackage.name}</span>
          </div>
        )}

        {/* Pay/Retry CTA for pending and View Detail */}
        <div className="flex flex-wrap items-center gap-3">
          {contribution.status === "PENDING_PAYMENT" && contribution.invoiceUrl && (
            <a
              href={contribution.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-[var(--radius-m)] text-[var(--text-body-s)] font-[500] hover:bg-[var(--color-primary-700)] transition-colors w-fit"
            >
              <AlertCircle className="w-4 h-4" />
              Lanjutkan Pembayaran
            </a>
          )}
          <Link to={`/pendana/contributions/${contribution.id}`}>
            <Button variant="secondary" size="sm">
              Lihat Detail Pendanaan
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
