/**
 * Centralized type definitions matching backend Prisma schema and 7 design docs.
 * Source of truth: backend/prisma/schema.prisma & 7 Perancangan Dokumen
 */

export type Role = "PENDANA" | "UMKM" | "KOPERASI" | "AGROFUND"

export type AssessmentStatus = "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_CORRECTION"

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
  amount: number | string
  expectedDeliveryDate?: string
}

export interface Project {
  id: string
  title: string
  description: string
  status: ProjectStatus
  basicProcurementCapital: number | string
  priceReserve: number | string
  naturaCost: number | string
  targetAmount: number | string
  fundedAmount: number | string
  guaranteeAmount: number | string
  fundraisingDeadline?: string | null
  createdAt: string
  user: { id: string; name: string; username: string }
  koperasi?: { id: string; name: string; username: string }
  koperasiId?: string
  naturaPackages?: NaturaPackage[]
  procurements?: ProcurementRequest[]
  procurementRequests?: ProcurementRequest[]
}

export interface Contribution {
  id: string
  amount: number | string
  status: "PENDING_PAYMENT" | "PAID" | "CANCELLED" | "REFUNDED"
  invoiceUrl?: string
  naturaPackageId?: string
  naturaPackage?: NaturaPackage
  createdAt: string
  project: Project
}

export interface SupplierRecord {
  id: string
  name: string
  contactInfo?: string
  businessInformation?: string
  bankName?: string
  bankAccountNumber?: string
  status?: "ACTIVE" | "PENDING_VALIDATION" | "REJECTED"
}

export interface ProcurementItem {
  id: string
  name: string
  quantity: number
  unit?: string
  estimatedUnitPrice: number | string
  actualUnitPrice?: number | string
}

export interface PurchaseOrder {
  id: string
  procurementRequestId: string
  supplierId: string
  supplier: SupplierRecord
  quotedTotal: number | string
  status: "DRAFT" | "VALID" | "PROCUREMENT_COMMITTED" | "PAID"
  createdAt: string
  invoiceUrl?: string
  receiptUrl?: string
}

export interface ProcurementRequest {
  id: string
  projectId: string
  project?: Project
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "PO_ISSUED"
  notes?: string
  createdAt: string
  items: ProcurementItem[]
  orders?: PurchaseOrder[]
  nominatedSupplier?: {
    name: string
    contactInfo: string
    bankName: string
    bankAccountNumber: string
  }
}

export interface Milestone {
  id: string
  projectId: string
  name: string
  description?: string
  plannedDate?: string
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED"
  reports?: ProgressReport[]
}

export interface ProgressReport {
  id: string
  milestoneId: string
  progressPercentage: number
  description: string
  evidenceUrl?: string
  status: "SUBMITTED" | "UNDER_REVIEW" | "VALIDATED" | "REJECTED"
  createdAt: string
}

export interface Incident {
  id: string
  projectId: string
  project?: Project
  category: "DELAY" | "DAMAGE" | "FRAUD" | "FORCE_MAJEURE"
  severity: "LOW" | "MEDIUM" | "HIGH"
  description: string
  status: "UNDER_REVIEW" | "RESOLVED"
  decision?: string
  requestedExtensionDays?: number
  isExtensionApproved?: boolean
  createdAt: string
}

export interface Dispute {
  id: string
  projectId: string
  project?: Project
  submittedBy: { id: string; name: string; role: Role }
  category: string
  description: string
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "REJECTED"
  resolutionNotes?: string
  createdAt: string
}

export interface CooperativePartner {
  id: string
  name: string
  address: string
  phone: string
  contactPerson: string
  status: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED"
  activeProjectsCount: number
}

export interface AuditLog {
  id: string
  actor: string
  role: Role
  action: string
  targetResource: string
  details: string
  timestamp: string
}
