import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import api from "../../lib/axios"
import { Button } from "../../components/ui/Button"
import { ChevronRight, ChevronLeft } from "lucide-react"

import type { FormData } from "./components/create-project/types"
import { CreateProjectStepper } from "./components/create-project/CreateProjectStepper"
import { ProjectInfoStep } from "./components/create-project/steps/ProjectInfoStep"
import { ProjectBudgetStep } from "./components/create-project/steps/ProjectBudgetStep"
import { ProjectProcurementStep } from "./components/create-project/steps/ProjectProcurementStep"
import { ProjectTimelineStep } from "./components/create-project/steps/ProjectTimelineStep"
import { ProjectNaturaStep } from "./components/create-project/steps/ProjectNaturaStep"
import { ProjectRiskStep } from "./components/create-project/steps/ProjectRiskStep"
import { ProjectReviewStep } from "./components/create-project/steps/ProjectReviewStep"

const STEPS = [
  "Informasi Proyek",
  "Anggaran",
  "Kebutuhan Pengadaan",
  "Timeline",
  "Natura",
  "Risiko",
  "Review & Submit",
]

async function fetchKoperasiList(): Promise<Array<{ id: string; name: string }>> {
  const res: any = await api.get("/koperasi")
  return res.data || res
}

export function CreateProjectPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    koperasiId: "",
    imageUrl: "",
    basicProcurementCapital: "",
    priceReserve: "",
    naturaCost: "",
    procurementNeeds: [{ item: "", quantity: "", unit: "unit", estimatedPrice: "" }],
    startDate: "",
    endDate: "",
    harvestDate: "",
    naturaPackages: [],
    riskDescription: "",
    mitigationPlan: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const { data: koperasiList } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ["koperasi-list"],
    queryFn: fetchKoperasiList,
  })

  // ─── Budget Calculations (exact backend formula) ────────────────────────────
  const bpc = Number(form.basicProcurementCapital) || 0
  const reserve = Number(form.priceReserve) || 0
  const naturaCost = Number(form.naturaCost) || 0
  const cooperativeFee = Math.round(0.025 * (bpc + reserve))
  const agrofundFee = Math.round(0.025 * bpc)
  const calculatedTargetAmount = bpc + reserve + cooperativeFee + agrofundFee + naturaCost
  const guarantee = Math.round(bpc * 0.05)

  const createMutation = useMutation({
    mutationFn: () =>
      api.post("/projects", {
        title: form.title.trim(),
        description: form.description.trim(),
        koperasiId: form.koperasiId,
        imageUrl: form.imageUrl,
        basicProcurementCapital: bpc,
        priceReserve: reserve,
        naturaCost: naturaCost,
        naturaPackages: form.naturaPackages
          .filter((p) => p.name.trim())
          .map((p) => ({
            name: p.name.trim(),
            description: p.description.trim(),
            amount: Number(p.amount) || 0,
          })),
      }),
    onSuccess: () => navigate("/umkm/projects"),
  })

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (step === 0) {
      if (!form.title.trim()) newErrors.title = "Judul proyek wajib diisi."
      if (!form.description.trim()) newErrors.description = "Deskripsi proyek wajib diisi."
      if (!form.koperasiId) newErrors.koperasiId = "Koperasi pendamping wajib dipilih."
    }
    if (step === 1) {
      if (!form.basicProcurementCapital || bpc < 1000000)
        newErrors.basicProcurementCapital = "Modal Pengadaan minimal Rp1.000.000."
    }
    if (step === 2) {
      const hasItem = form.procurementNeeds.some((n) => n.item.trim())
      if (!hasItem) newErrors.procurementNeeds = "Tambahkan minimal satu kebutuhan pengadaan."
    }
    if (step === 3) {
      if (!form.startDate) newErrors.startDate = "Tanggal mulai proyek wajib diisi."
      if (!form.endDate) newErrors.endDate = "Tanggal selesai proyek wajib diisi."
    }
    if (step === 5) {
      if (!form.riskDescription.trim()) newErrors.riskDescription = "Deskripsi risiko wajib diisi."
      if (!form.mitigationPlan.trim()) newErrors.mitigationPlan = "Rencana mitigasi wajib diisi."
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const handleBack = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full pb-12">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/umkm/projects")}
          className="text-[var(--text-caption)] text-[var(--color-neutral-500)] hover:text-[var(--color-primary-600)] mb-2 transition-colors"
        >
          ← Kembali ke My Projects
        </button>
        <h1 className="text-[var(--text-h2)] font-[700] text-[var(--color-neutral-900)]">Buat Proyek Baru</h1>
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)] mt-1">
          Proyek yang Anda ajukan akan melewati penilaian Koperasi dan tinjauan AgroFund sebelum dipublikasikan.
        </p>
      </div>

      <CreateProjectStepper steps={STEPS} currentStep={step} />

      <div className="mt-4 md:mt-0">
        {step === 0 && <ProjectInfoStep form={form} setForm={setForm} errors={errors} koperasiList={koperasiList} />}
        {step === 1 && <ProjectBudgetStep form={form} setForm={setForm} errors={errors} />}
        {step === 2 && <ProjectProcurementStep form={form} setForm={setForm} errors={errors} />}
        {step === 3 && <ProjectTimelineStep form={form} setForm={setForm} errors={errors} />}
        {step === 4 && <ProjectNaturaStep form={form} setForm={setForm} errors={errors} />}
        {step === 5 && <ProjectRiskStep form={form} setForm={setForm} errors={errors} />}
        {step === 6 && (
          <ProjectReviewStep
            form={form}
            calculatedTargetAmount={calculatedTargetAmount}
            guarantee={guarantee}
            cooperativeFee={cooperativeFee}
            agrofundFee={agrofundFee}
            koperasiList={koperasiList}
            isError={createMutation.isError}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <Button variant="tertiary" onClick={handleBack} disabled={step === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Sebelumnya
          </Button>
          {step < STEPS.length - 1 ? (
            <Button variant="primary" onClick={handleNext}>
              Selanjutnya
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => createMutation.mutate()}
              isLoading={createMutation.isPending}
            >
              Submit Proyek
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}