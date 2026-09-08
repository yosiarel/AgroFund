export interface NaturaPackageInput {
  name: string
  description: string
  amount: number
}

export interface ProcurementNeed {
  item: string
  quantity: string
  unit: string
  estimatedPrice: string
}

export interface FormData {
  // Step 1 — Info
  title: string
  description: string
  koperasiId: string
  imageUrl: string
  // Step 2 — Budget
  basicProcurementCapital: string
  priceReserve: string
  naturaCost: string
  // Step 3 — Procurement Needs
  procurementNeeds: ProcurementNeed[]
  // Step 4 — Timeline
  startDate: string
  endDate: string
  harvestDate: string
  // Step 5 — Natura
  naturaPackages: NaturaPackageInput[]
  // Step 6 — Risk
  riskDescription: string
  mitigationPlan: string
}

export interface StepProps {
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
  errors: Partial<Record<keyof FormData, string>>
}
