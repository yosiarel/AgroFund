import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Badge/Status System (Doc 5, Sec 28 & Sec 7)
   * Status ALWAYS uses: label + semantic treatment + optional icon + context
   * Status must be unambiguous — NOT color-only (DS-PR-003)
   *
   * Variants mapped to Design System semantic colors:
   * - default: neutral (general info)
   * - success: fulfilled, validated, completed (#2E7D32)
   * - warning: pending attention, approaching deadline (#B26A00)
   * - risk: delay, risk, incident — NOT failure (#C06A12) ← Risk ≠ Failure
   * - error: rejected, failed, invalid, blocked (#C62828)
   * - info: informational, system explanation (#1565C0)
   * - accent: agricultural emphasis (#D9A441)
   *
   * Radius: full (9999px) for pill/badge per Doc 5 Sec 14
   */
  variant?: "default" | "success" | "warning" | "risk" | "error" | "info" | "accent" | "outline"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default:     "bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]",
    success:     "bg-[var(--color-success-100)] text-[var(--color-success-700)]",
    warning:     "bg-[var(--color-warning-100)] text-[var(--color-warning-700)]",
    // Risk: orange tones. Must NOT use error/red treatment (Doc 5, Sec 8 Rule 4)
    risk:        "bg-[var(--color-risk-100)]    text-[var(--color-risk-700)]",
    error:       "bg-[var(--color-error-100)]   text-[var(--color-error-700)]",
    info:        "bg-[var(--color-info-100)]    text-[var(--color-info-700)]",
    // Accent: limited use for agricultural emphasis (Doc 5, Sec 5.1)
    accent:      "bg-[var(--color-accent-100)]  text-[var(--color-accent-600)]",
    outline:     "bg-transparent text-[var(--color-neutral-700)] border border-[var(--color-neutral-200)]",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-full)] px-2.5 py-0.5",
        "text-[var(--text-caption)] font-[500]",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
