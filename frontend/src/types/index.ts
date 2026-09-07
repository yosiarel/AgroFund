/**
 * Centralized type definitions matching backend Prisma schema.
 * Source of truth: backend/prisma/schema.prisma
 */

export type Role = "PENDANA" | "UMKM" | "KOPERASI" | "AGROFUND"

export type AssessmentStatus = "APPROVED" | "REJECTED" | "NEEDS_CORRECTION"

export type ProjectStatus =
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
  | "GAGAL_DITUTUP"

export interface NaturaPackage {
  id: string
  name: string
  description: string
  amount: number
}

export interface Project {
  id: string
  title: string
  description: string
  status: ProjectStatus
  basicProcurementCapital: number
  priceReserve: number
  naturaCost: number
  totalTarget: number
  fundedAmount: number
  guaranteeAmount: number
  deadline: string
  createdAt: string
  user: { id: string; name: string; username: string }
  koperasi?: { id: string; name: string; username: string }
  koperasiId?: string
  naturaPackages?: NaturaPackage[]
}

export interface Contribution {
  id: string
  amount: number
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "AWAITING_CONFIRMATION"
  invoiceUrl?: string
  naturaPackageId?: string
  naturaPackage?: NaturaPackage
  createdAt: string
  project: Project
}
