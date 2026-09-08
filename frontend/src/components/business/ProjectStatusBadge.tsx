import { cn } from "../../lib/utils"
import { Badge } from "../ui/Badge"
import type { BadgeProps } from "../ui/Badge"
import { toFiniteNumber } from "./FinancialSummary"

/**
 * Project Status Badge (Doc 5, Sec 28, 29, 77)
 * 
 * Project lifecycle (Doc 4, Sec 7):
 * Draft → Cooperative Assessment → Publication Review → Guarantee Placement
 * → Fundraising → Dana Terpenuhi → Procurement → Execution → Natura Fulfillment
 * → Sukses Ditutup
 *
 * Risk path: Terlambat/Berisiko → Incident Review → Recovery → Gagal Ditutup
 *
 * CRITICAL RULES (Doc 5, Sec 71):
 * - "Risk" ≠ "Failure" — NEVER use error/red for risk states
 * - "Verification" is NOT used as lifecycle label (Sec 29)
 * - "Assessment" (Koperasi) ≠ "Publication Review" (AgroFund)
 * - Status must use: label + semantic treatment (not color alone)
 *
 * Status terminology must NOT change per screen (Doc 5, Sec 77)
 */

export type ProjectStatus =
  // Main lifecycle
  | "DRAFT"
  | "COOPERATIVE_ASSESSMENT"
  | "PUBLICATION_REVIEW"
  | "GUARANTEE_PLACEMENT"
  | "FUNDRAISING"
  | "DANA_TERPENUHI"
  | "PROCUREMENT"
  | "EXECUTION"
  | "NATURA_FULFILLMENT"
  | "SUKSES_DITUTUP"
  // Risk path (Risk ≠ Failure)
  | "TERLAMBAT_BERISIKO"
  | "INCIDENT_REVIEW"
  | "RECOVERY"
  | "GAGAL_DITUTUP"
  // Assessment states
  | "NEEDS_CORRECTION"
  | "REJECTED"

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; variant: BadgeProps["variant"]; icon?: string }
> = {
  // --- Main Lifecycle ---
  DRAFT: {
    label: "Draft",
    variant: "default",
  },
  COOPERATIVE_ASSESSMENT: {
    label: "Assessment in Progress", // Doc 4 Sec 14 — exact label
    variant: "info",
  },
  PUBLICATION_REVIEW: {
    label: "Platform / Publication Review", // Doc 5 Sec 30 — Authority: AgroFund
    variant: "info",
  },
  GUARANTEE_PLACEMENT: {
    label: "Guarantee Placement",
    variant: "warning",
  },
  FUNDRAISING: {
    label: "Fundraising",
    variant: "info",
  },
  DANA_TERPENUHI: {
    label: "Dana Terpenuhi", // Doc 5 Sec 32 — label "Fully Funded"
    variant: "success",
  },
  PROCUREMENT: {
    label: "Procurement",
    variant: "info",
  },
  EXECUTION: {
    label: "Execution",
    variant: "info",
  },
  NATURA_FULFILLMENT: {
    label: "Natura Fulfillment",
    variant: "info",
  },
  SUKSES_DITUTUP: {
    label: "Sukses Ditutup",
    variant: "success",
  },

  // --- Risk Path (CRITICAL: risk ≠ error, Doc 5 Sec 8 Rule 4) ---
  TERLAMBAT_BERISIKO: {
    label: "Terlambat / Berisiko", // Doc 5 Sec 46 exact label
    variant: "risk",             // Orange, NOT red
  },
  INCIDENT_REVIEW: {
    label: "Incident Review",
    variant: "risk",
  },
  RECOVERY: {
    label: "Pemulihan & Penyelesaian",
    variant: "warning",
  },
  GAGAL_DITUTUP: {
    label: "Gagal Ditutup",
    variant: "error",           // Only this terminal failure state uses error/red
  },

  // --- Correction / Rejection States ---
  NEEDS_CORRECTION: {
    label: "Needs Correction",
    variant: "warning",
  },
  REJECTED: {
    label: "Ditolak",
    variant: "error",
  },
}

export interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  deadline?: string | null;
  fundedAmount?: number | string;
  targetAmount?: number | string;
  /**
   * authority — shows who performed this action (Doc 5, Sec 54)
   * "Performed by Koperasi" / "Performed by AgroFund"
   */
  showAuthority?: boolean;
  className?: string;
  size?: "sm" | "md"
}

export function ProjectStatusBadge({
  status,
  deadline,
  fundedAmount,
  targetAmount,
  showAuthority = false,
  className,
  size = "md",
}: ProjectStatusBadgeProps) {
  let label = STATUS_CONFIG[status]?.label ?? status
  let variant = STATUS_CONFIG[status]?.variant ?? "default"

  // Expiration check (Doc 4 Sec 33)
  if (
    status === "FUNDRAISING" &&
    deadline &&
    fundedAmount !== undefined &&
    targetAmount !== undefined
  ) {
    const d = new Date(deadline)
    const numFunded = toFiniteNumber(fundedAmount, 0)
    const numTarget = toFiniteNumber(targetAmount, 0)
    if (!isNaN(d.getTime()) && d < new Date() && numFunded < numTarget) {
      label = "Funding Deadline Reached"
      variant = "risk"
    }
  }

  // Authority context per Doc 5 Sec 54
  const authorityLabel =
    status === "COOPERATIVE_ASSESSMENT"
      ? "Dilakukan oleh Koperasi"
      : status === "PUBLICATION_REVIEW"
      ? "Dilakukan oleh AgroFund"
      : null

  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <Badge
        variant={variant}
        className={size === "sm" ? "text-[10px]" : ""}
      >
        {label}
      </Badge>
      {showAuthority && authorityLabel && (
        <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
          {authorityLabel}
        </span>
      )}
    </div>
  )
}
