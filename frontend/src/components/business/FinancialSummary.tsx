import { cn } from "../../lib/utils"

import { toFiniteNumber, formatRupiah } from "../../utils/formatter"

// ─── Project Funding Section ──────────────────────────────────────────────────

interface ProjectFundingData {
  target: number;
  funded: number;
  allocated: number;
  used: number;
}

function ProjectFundingSection({ data }: { data: ProjectFundingData }) {
  const remaining = data.allocated - data.used
  return (
    <Section title="Pendanaan Proyek">
      <Row label="Target Pendanaan" value={formatRupiah(data.target)} />
      <Row label="Dana Terkumpul" value={formatRupiah(data.funded)} highlight />
      <Row label="Dialokasikan ke Pengadaan" value={formatRupiah(data.allocated)} />
      <Row label="Telah Digunakan" value={formatRupiah(data.used)} />
      <Divider />
      {/* Contextual label for remaining (Sec 33 — NOT "Balance") */}
      <Row
        label="Sisa Alokasi Proyek"
        value={formatRupiah(remaining)}
        valueClassName={remaining < 0 ? "text-[var(--color-error-700)]" : "text-[var(--color-primary-700)]"}
        bold
      />
    </Section>
  )
}

// ─── Guarantee Section ────────────────────────────────────────────────────────

interface GuaranteeData {
  initial: number;
  used: number;
  status: "HELD" | "PARTIALLY_USED" | "FULLY_USED" | "RETURNED"
}

const GUARANTEE_STATUS_LABEL: Record<GuaranteeData["status"], { label: string; color: string }> = {
  HELD: { label: "Ditahan (Active)", color: "text-[var(--color-info-700)]" },
  PARTIALLY_USED: { label: "Sebagian Digunakan", color: "text-[var(--color-warning-700)]" },
  FULLY_USED: { label: "Seluruhnya Digunakan", color: "text-[var(--color-risk-700)]" },
  RETURNED: { label: "Dikembalikan", color: "text-[var(--color-success-700)]" },
}

function GuaranteeSection({ data }: { data: GuaranteeData }) {
  // Formula: Initial Guarantee − Guarantee Used = Remaining Guarantee (Doc 5 Sec 35)
  const remaining = data.initial - data.used
  const statusConfig = GUARANTEE_STATUS_LABEL[data.status]

  return (
    <Section
      title="Guarantee UMKM"
      description="Guarantee bukan bagian dari Target Pendanaan."   // Doc 4 Sec 20
    >
      <Row label="Guarantee Awal (5% BPC)" value={formatRupiah(data.initial)} />
      <Row label="Guarantee Digunakan" value={formatRupiah(data.used)} />
      <Divider />
      {/* Initial − Used = Remaining (Sec 35 formula) */}
      <Row label="Sisa Guarantee" value={formatRupiah(remaining)} bold
        valueClassName={remaining <= 0 ? "text-[var(--color-error-700)]" : undefined}
      />
      <div className="flex justify-between items-center">
        <span className="text-[var(--text-body-s)] text-[var(--color-neutral-600)]">Status</span>
        <span className={cn("text-[var(--text-label)] font-[600]", statusConfig.color)}>
          {statusConfig.label}
        </span>
      </div>
    </Section>
  )
}

// ─── Fee Section ──────────────────────────────────────────────────────────────

interface FeeData {
  provision: number;
  vested: number;
  unvested: number;
}

function FeeSection({ data }: { data: FeeData }) {
  return (
    <Section
      title="Biaya Layanan"
      description="Biaya layanan bukan return finansial Pendana."  // Sec 36
    >
      <Row label="Total Provisi (2,5% BPC)" value={formatRupiah(data.provision)} />
      {/* Vested ≠ Unvested must be visually distinct (Sec 36) */}
      <Row label="Sudah Divestedkan" value={formatRupiah(data.vested)}
        valueClassName="text-[var(--color-success-700)]"
      />
      <Row label="Belum Divested" value={formatRupiah(data.unvested)}
        valueClassName="text-[var(--color-neutral-500)]"
      />
    </Section>
  )
}

// ─── Recovery / Refund Section ────────────────────────────────────────────────

interface RecoveryData {
  recoverable: number;
  recoveryPool: number;
  refund: number;
  isPartialRefund: boolean;
}

function RecoverySection({ data }: { data: RecoveryData }) {
  return (
    <Section
      title="Pemulihan & Pengembalian"
      description={
        data.isPartialRefund
          ? "Pengembalian tidak penuh — ini adalah Partial Refund."  // Sec 48
          : "Recovery tidak menjamin pengembalian penuh."  // Sec 47
      }
    >
      <Row label="Nilai yang Dipulihkan" value={formatRupiah(data.recoverable)} />
      <Row label="Recovery Pool" value={formatRupiah(data.recoveryPool)} />
      <Divider />
      <Row
        label={data.isPartialRefund ? "Pengembalian (Partial)" : "Pengembalian"}
        value={formatRupiah(data.refund)}
        bold
        valueClassName="text-[var(--color-primary-700)]"
      />
    </Section>
  )
}

// ─── Shared Primitives ────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <h4 className="text-[var(--text-label)] font-[600] text-[var(--color-neutral-900)]">
          {title}
        </h4>
        {description && (
          <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] mt-0.5">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5 py-3 px-4 bg-[var(--color-neutral-50)] rounded-[var(--radius-m)] border border-[var(--color-neutral-100)]">
        {children}
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  bold,
  highlight,
  valueClassName,
}: {
  label: string
  value: string
  bold?: boolean
  highlight?: boolean
  valueClassName?: string
}) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className={cn(
        "text-[var(--text-body-s)]",
        bold ? "text-[var(--color-neutral-900)] font-[600]" : "text-[var(--color-neutral-600)]"
      )}>
        {label}
      </span>
      <span className={cn(
        "text-[var(--text-body-s)] font-[500]",
        bold && "font-[700]",
        highlight && "text-[var(--color-primary-700)]",
        valueClassName
      )}>
        {value}
      </span>
    </div>
  )
}

function Divider() {
  return <div className="border-t border-[var(--color-neutral-200)] my-1" />
}

// ─── Main Export ──────────────────────────────────────────────────────────────

import * as React from "react"

interface FinancialSummaryProps {
  funding?: ProjectFundingData;
  guarantee?: GuaranteeData;
  fee?: FeeData;
  recovery?: RecoveryData;
  className?: string;
}

/**
 * FinancialSummary — assembles only the sections needed per context.
 * Always in project/contribution/guarantee/procurement/recovery/refund context.
 * Never presents as wallet (Doc 5, Sec 34).
 */
export function FinancialSummary({
  funding,
  guarantee,
  fee,
  recovery,
  className,
}: FinancialSummaryProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {funding && <ProjectFundingSection data={funding} />}
      {guarantee && <GuaranteeSection data={guarantee} />}
      {fee && <FeeSection data={fee} />}
      {recovery && <RecoverySection data={recovery} />}
    </div>
  )
}

// Named exports for flexible per-section usage
export {
  ProjectFundingSection,
  GuaranteeSection,
  FeeSection,
  RecoverySection,
}

export { toFiniteNumber, formatRupiah }