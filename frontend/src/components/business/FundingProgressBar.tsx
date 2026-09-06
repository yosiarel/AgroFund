import { cn } from "../../lib/utils"

/**
 * Funding Progress Bar (Doc 5, Sec 32 & 31)
 *
 * Minimum information required:
 * - funded amount (Rp format)
 * - Target
 * - percentage
 * - deadline
 *
 * CRITICAL RULES:
 * - Progress ≠ Success (Sec 31) — bar reaching 100% does NOT mean project succeeded
 * - At 100%: show "Dana Terpenuhi" label (Sec 32)
 * - At 100%: Contribution CTA must NOT appear (Sec 32)
 * - Remaining Target must use contextual label (Sec 33) — NOT "Balance"
 * - Financial values use Rp format, NOT abbreviations (Sec 76)
 * - Progress bar must NOT use green for all funding values (Sec 76)
 */

interface FundingProgressBarProps {
  fundedAmount: number;    // amount collected (Rp)
  targetAmount: number;    // target funding (Rp)
  deadline: string;        // ISO date string
  className?: string;
  showRemainingLabel?: boolean;  // show "Sisa Target" label
}

function formatRupiah(amount: number): string {
  // Doc 5 Sec 76: "Rp10.000.000" format in formal financial context
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDeadline(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr))
}

function getDaysRemaining(deadline: string): number {
  const today = new Date()
  const end = new Date(deadline)
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function FundingProgressBar({
  fundedAmount,
  targetAmount,
  deadline,
  className,
  showRemainingLabel = true,
}: FundingProgressBarProps) {
  const percentage = Math.min(100, Math.round((fundedAmount / targetAmount) * 100))
  const isFullyFunded = percentage >= 100
  const remainingAmount = Math.max(0, targetAmount - fundedAmount)
  const daysRemaining = getDaysRemaining(deadline)
  const isDeadlineApproaching = daysRemaining <= 7 && daysRemaining > 0
  const isExpired = daysRemaining <= 0 && !isFullyFunded

  return (
    <div className={cn("flex flex-col gap-3", className)}>

      {/* Fully Funded label (Doc 5 Sec 32) */}
      {isFullyFunded && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-success-100)] rounded-[var(--radius-m)]">
          <span className="text-[var(--text-label)] font-[600] text-[var(--color-success-700)]">
            ✓ Dana Terpenuhi
          </span>
          <span className="text-[var(--text-caption)] text-[var(--color-success-700)]">
            — Pendanaan telah ditutup
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div>
        {/* Labels */}
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-[var(--text-label)] font-[600] text-[var(--color-neutral-900)]">
            {formatRupiah(Math.min(fundedAmount, targetAmount))}
          </span>
          <span className="text-[var(--text-body-s)] text-[var(--color-neutral-500)]">
            dari {formatRupiah(targetAmount)}
          </span>
        </div>

        {/* Track */}
        <div
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Pendanaan ${percentage}% dari target`}
          className="w-full bg-[var(--color-neutral-100)] rounded-[var(--radius-full)] overflow-hidden h-2.5"
        >
          <div
            className={cn(
              "h-full rounded-[var(--radius-full)] transition-all duration-500",
              isFullyFunded
                ? "bg-[var(--color-success-500)]"
                : isExpired
                ? "bg-[var(--color-warning-500)]"
                : "bg-[var(--color-primary-500)]"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Percentage */}
        <div className="flex justify-between items-center mt-1.5">
          <span className="text-[var(--text-caption)] font-[600] text-[var(--color-neutral-700)]">
            {percentage}%
          </span>
          {/* Progress ≠ Success — no success label unless isFullyFunded */}
        </div>
      </div>

      {/* Remaining Target (contextual label, NOT "Balance" per Sec 33) */}
      {showRemainingLabel && !isFullyFunded && remainingAmount > 0 && (
        <div className="flex justify-between items-center py-2 px-3 bg-[var(--color-neutral-50)] rounded-[var(--radius-m)] border border-[var(--color-neutral-100)]">
          <span className="text-[var(--text-body-s)] text-[var(--color-neutral-600)]">
            Sisa Target Pendanaan
          </span>
          <span className="text-[var(--text-label)] font-[600] text-[var(--color-neutral-900)]">
            {formatRupiah(remainingAmount)}
          </span>
        </div>
      )}

      {/* Deadline */}
      <div className="flex justify-between items-center">
        <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
          Batas waktu pendanaan
        </span>
        <span
          className={cn(
            "text-[var(--text-caption)] font-[500]",
            isExpired
              ? "text-[var(--color-error-700)]"
              : isDeadlineApproaching
              ? "text-[var(--color-warning-700)]"   // approaching: warning, not error
              : "text-[var(--color-neutral-700)]"
          )}
        >
          {isExpired
            ? "Waktu pendanaan habis"
            : isDeadlineApproaching
            ? `${daysRemaining} hari lagi · ${formatDeadline(deadline)}`
            : formatDeadline(deadline)}
        </span>
      </div>
    </div>
  )
}
