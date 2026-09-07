import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import api from "../../lib/axios"
import { Input } from "../../components/ui/Input"
import { Textarea } from "../../components/ui/Textarea"
import { Select } from "../../components/ui/Select"
import { Button } from "../../components/ui/Button"
import { Alert } from "../../components/ui/Alert"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { formatRupiah } from "../../components/business/FinancialSummary"
import { ChevronRight, ChevronLeft, Plus, Trash2 } from "lucide-react"

/**
 * Create Project Form (Doc 4, Sec 12)
 *
 * Step Flow (EXACT per Doc 4 Sec 12):
 * 1. Project Information
 * 2. Budget
 * 3. Procurement Needs
 * 4. Timeline
 * 5. Natura
 * 6. Risk
 * 7. Review & Submit
 *
 * Key business rules:
 * - Guarantee = 5% BPC (auto-calculated, SEPARATE from funding target — Doc 4 Sec 19, 20)
 * - Total Target = BPC + Reserve + CoopFee(2.5%×BPC+Reserve) + AgroFundFee(2.5%×BPC) + NaturaCost
 * - No contribution in DRAFT state (Doc 4 Sec 13)
 * - koperasiId required — UMKM selects Koperasi
 */

interface NaturaPackageInput {
  name: string
  description: string
  amount: number
}

interface ProcurementNeed {
  item: string
  quantity: string
  unit: string
  estimatedPrice: string
}

interface FormData {
  // Step 1 — Info
  title: string
  description: string
  koperasiId: string
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

const STEPS = [
  "Informasi Proyek",
  "Anggaran",
  "Kebutuhan Pengadaan",
  "Timeline",
  "Natura",
  "Risiko",
  "Review & Submit",
]

function fetchKoperasiList(): Promise<Array<{ id: string; name: string }>> {
  return api.get("/user/koperasi")
}

export function CreateProjectPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    koperasiId: "",
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
  // Backend: project.service.ts calculateFinancials()
  const cooperativeFee = Math.round(0.025 * (bpc + reserve))
  const agrofundFee = Math.round(0.025 * bpc)
  const totalTarget = bpc + reserve + cooperativeFee + agrofundFee + naturaCost
  const guarantee = Math.round(bpc * 0.05)  // 5% BPC — Separate (Doc 4 Sec 20)

  const createMutation = useMutation({
    mutationFn: () =>
      api.post("/projects", {
        title: form.title.trim(),
        description: form.description.trim(),
        koperasiId: form.koperasiId,
        basicProcurementCapital: bpc,
        priceReserve: reserve,
        naturaCost: naturaCost,
        procurementNeeds: form.procurementNeeds.filter(n => n.item.trim()),
        startDate: form.startDate,
        endDate: form.endDate,
        harvestDate: form.harvestDate,
        riskDescription: form.riskDescription.trim(),
        mitigationPlan: form.mitigationPlan.trim(),
        naturaPackages: form.naturaPackages.filter(p => p.name.trim()),
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
      const hasItem = form.procurementNeeds.some(n => n.item.trim())
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

  // ─── Procurement Needs helpers ───────────────────────────────────────────────
  const addNeed = () => setForm(f => ({
    ...f,
    procurementNeeds: [...f.procurementNeeds, { item: "", quantity: "", unit: "unit", estimatedPrice: "" }],
  }))
  const removeNeed = (i: number) => setForm(f => ({
    ...f,
    procurementNeeds: f.procurementNeeds.filter((_, idx) => idx !== i),
  }))
  const updateNeed = (i: number, field: keyof ProcurementNeed, value: string) => {
    setForm(f => {
      const updated = [...f.procurementNeeds]
      updated[i] = { ...updated[i], [field]: value }
      return { ...f, procurementNeeds: updated }
    })
  }

  // ─── Natura Package helpers ──────────────────────────────────────────────────
  const addNatura = () => setForm(f => ({
    ...f,
    naturaPackages: [...f.naturaPackages, { name: "", description: "", amount: 0 }],
  }))
  const removeNatura = (i: number) => setForm(f => ({
    ...f,
    naturaPackages: f.naturaPackages.filter((_, idx) => idx !== i),
  }))
  const updateNatura = (i: number, field: keyof NaturaPackageInput, value: string | number) => {
    setForm(f => {
      const updated = [...f.naturaPackages]
      updated[i] = { ...updated[i], [field]: value }
      return { ...f, naturaPackages: updated }
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div>
        <button onClick={() => navigate("/umkm/projects")} className="text-[var(--text-caption)] text-[var(--color-neutral-500)] hover:text-[var(--color-primary-600)] mb-2 transition-colors">
          ← Kembali ke My Projects
        </button>
        <h1 className="text-[var(--text-h2)] font-[700] text-[var(--color-neutral-900)]">Buat Proyek Baru</h1>
        <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)] mt-1">
          Proyek yang Anda ajukan akan melewati penilaian Koperasi dan tinjauan AgroFund sebelum dipublikasikan.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-1 last:flex-none min-w-fit">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-[700] flex-shrink-0 ${i < step ? "bg-[var(--color-primary-600)] text-white" : i === step ? "bg-[var(--color-primary-100)] text-[var(--color-primary-700)] ring-2 ring-[var(--color-primary-400)]" : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]"}`}>
              {i + 1}
            </div>
            <span className={`text-[10px] hidden sm:block whitespace-nowrap ${i === step ? "text-[var(--color-primary-700)] font-[600]" : "text-[var(--color-neutral-500)]"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="w-4 h-px bg-[var(--color-neutral-200)] mx-1 flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* ── Step 0: Project Information ─────────────────────────────────────── */}
      {step === 0 && (
        <Card>
          <CardHeader><CardTitle>Informasi Proyek</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              label="Judul Proyek"
              required
              placeholder="Contoh: Budidaya Padi Organik 2025"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              error={errors.title}
            />
            <Textarea
              label="Deskripsi Proyek"
              required
              placeholder="Jelaskan tujuan, komoditas, lokasi, dan estimasi hasil panen..."
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              error={errors.description}
              rows={5}
              helperText="Semakin jelas deskripsi, semakin mudah Koperasi dan Pendana mengevaluasi proyek Anda."
            />
            <Select
              label="Koperasi Pendamping"
              required
              options={koperasiList?.map((k) => ({ label: k.name, value: k.id })) ?? []}
              value={form.koperasiId}
              onChange={(e) => setForm(f => ({ ...f, koperasiId: e.target.value }))}
              error={errors.koperasiId}
              helperText="Koperasi akan melakukan penilaian lapangan (Field Assessment) pada proyek Anda."
            />
          </CardContent>
        </Card>
      )}

      {/* ── Step 1: Budget ──────────────────────────────────────────────────── */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>Anggaran Proyek</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Alert variant="info" title="Cara Kerja Anggaran">
              Target Pendanaan = Modal Pengadaan + Cadangan Harga + Biaya Layanan Koperasi (2,5%) + Biaya Layanan AgroFund (2,5%) + Biaya Natura.
              Guarantee (5% BPC) dibayar terpisah setelah proyek disetujui.
            </Alert>

            <Input
              label="Modal Pengadaan Dasar (Basic Procurement Capital)"
              required
              placeholder="Contoh: 10000000"
              value={form.basicProcurementCapital}
              onChange={(e) => setForm(f => ({ ...f, basicProcurementCapital: e.target.value.replace(/\D/g, "") }))}
              error={errors.basicProcurementCapital}
              helperText="Estimasi total biaya pengadaan barang/jasa untuk proyek ini."
            />
            <Input
              label="Cadangan Harga (Price Reserve)"
              placeholder="Contoh: 500000"
              value={form.priceReserve}
              onChange={(e) => setForm(f => ({ ...f, priceReserve: e.target.value.replace(/\D/g, "") }))}
              helperText="Cadangan untuk antisipasi kenaikan harga. Bisa dikosongkan."
            />
            <Input
              label="Biaya Natura"
              placeholder="Contoh: 200000"
              value={form.naturaCost}
              onChange={(e) => setForm(f => ({ ...f, naturaCost: e.target.value.replace(/\D/g, "") }))}
              helperText="Total biaya kompensasi natura (akan dibagi ke paket-paket Natura di langkah berikutnya)."
            />

            {/* Budget Summary — Auto-calculated (Guarantee separate, Doc 4 Sec 20) */}
            {bpc > 0 && (
              <div className="p-4 bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-[var(--radius-m)] flex flex-col gap-2">
                <p className="text-[var(--text-label)] font-[600] text-[var(--color-neutral-900)]">Ringkasan Anggaran (Preview)</p>
                <Row label="Modal Pengadaan (BPC)" value={formatRupiah(bpc)} />
                <Row label="Cadangan Harga" value={formatRupiah(reserve)} />
                <Row label="Biaya Natura" value={formatRupiah(naturaCost)} />
                <div className="border-t pt-2 mt-1">
                  {/* Transparent fee breakdown (Doc 5 Sec 36, 71) */}
                  <Row label="Biaya Layanan Koperasi (2,5% BPC+Cadangan)" value={formatRupiah(cooperativeFee)} />
                  <Row label="Biaya Layanan AgroFund (2,5% BPC)" value={formatRupiah(agrofundFee)} />
                </div>
                <div className="border-t pt-2 mt-1">
                  <Row label="Total Target Pendanaan" value={formatRupiah(totalTarget)} bold />
                  <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] mt-1">
                    Biaya layanan sudah termasuk dalam total target.
                  </p>
                </div>
                <div className="border-t pt-2 mt-1">
                  {/* Guarantee visually separate (Doc 5 Sec 35, Doc 4 Sec 19, 20) */}
                  <Row label="Guarantee UMKM (5% BPC — Dibayar Terpisah)" value={formatRupiah(guarantee)} />
                  <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] mt-1">
                    Guarantee bukan bagian dari Target Pendanaan.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Procurement Needs (Doc 4 Sec 12, 36) ─────────────────── */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle>Kebutuhan Pengadaan</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Alert variant="info">
              Daftarkan barang atau jasa yang akan dibeli menggunakan dana proyek ini.
              Koperasi akan memvalidasi setiap kebutuhan pengadaan sebelum Procurement dapat dilanjutkan.
            </Alert>
            {errors.procurementNeeds && (
              <Alert variant="error">{errors.procurementNeeds}</Alert>
            )}

            {form.procurementNeeds.map((need, i) => (
              <div key={i} className="p-4 border border-[var(--color-neutral-200)] rounded-[var(--radius-m)] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-[var(--text-label)] font-[600]">Kebutuhan #{i + 1}</p>
                  {form.procurementNeeds.length > 1 && (
                    <button onClick={() => removeNeed(i)} className="text-[var(--color-error-500)] hover:text-[var(--color-error-700)] p-1" aria-label={`Hapus kebutuhan ${i + 1}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Input
                  label="Nama Barang / Jasa"
                  required
                  placeholder="Contoh: Pupuk NPK, Bibit Padi, Jasa Pengolahan Tanah"
                  value={need.item}
                  onChange={(e) => updateNeed(i, "item", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Jumlah"
                    required
                    placeholder="Contoh: 100"
                    value={need.quantity}
                    onChange={(e) => updateNeed(i, "quantity", e.target.value.replace(/\D/g, ""))}
                  />
                  <Input
                    label="Satuan"
                    placeholder="Contoh: kg, liter, unit"
                    value={need.unit}
                    onChange={(e) => updateNeed(i, "unit", e.target.value)}
                  />
                </div>
                <Input
                  label="Estimasi Harga Satuan (Rp)"
                  placeholder="Contoh: 50000"
                  value={need.estimatedPrice}
                  onChange={(e) => updateNeed(i, "estimatedPrice", e.target.value.replace(/\D/g, ""))}
                  helperText="Opsional, digunakan sebagai referensi validasi Koperasi."
                />
              </div>
            ))}

            <Button variant="tertiary" onClick={addNeed}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kebutuhan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Step 3: Timeline (Doc 4 Sec 12) ─────────────────────────────────── */}
      {step === 3 && (
        <Card>
          <CardHeader><CardTitle>Timeline Proyek</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Alert variant="info">
              Timeline digunakan sebagai acuan monitoring progres dan jadwal Natura (jika ada).
            </Alert>
            <Input
              label="Tanggal Mulai Proyek"
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
              error={errors.startDate}
            />
            <Input
              label="Tanggal Target Selesai"
              type="date"
              required
              value={form.endDate}
              onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
              error={errors.endDate}
            />
            <Input
              label="Estimasi Tanggal Panen / Penyelesaian Output"
              type="date"
              value={form.harvestDate}
              onChange={(e) => setForm(f => ({ ...f, harvestDate: e.target.value }))}
              helperText="Opsional. Digunakan sebagai referensi untuk jadwal distribusi Natura."
            />
          </CardContent>
        </Card>
      )}

      {/* ── Step 4: Natura (Doc 4 Sec 12) ───────────────────────────────────── */}
      {step === 4 && (
        <Card>
          <CardHeader><CardTitle>Paket Natura (Opsional)</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Alert variant="warning" title="Penting: Natura bukan return finansial">
              Natura adalah kompensasi non-finansial berupa produk hasil pertanian. Bukan bunga, bukan dividen, dan tidak dijamin nilainya setara kontribusi. Natura tidak boleh dipresentasikan sebagai guaranteed return kepada Pendana.
            </Alert>

            {form.naturaPackages.map((pkg, i) => (
              <div key={i} className="p-4 border border-[var(--color-neutral-200)] rounded-[var(--radius-m)] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-[var(--text-label)] font-[600]">Paket Natura #{i + 1}</p>
                  <button onClick={() => removeNatura(i)} className="text-[var(--color-error-500)] hover:text-[var(--color-error-700)] p-1" aria-label={`Hapus natura ${i + 1}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Input
                  label="Nama Paket"
                  required
                  placeholder="Contoh: Paket Beras 5kg"
                  value={pkg.name}
                  onChange={(e) => updateNatura(i, "name", e.target.value)}
                />
                <Textarea
                  label="Deskripsi"
                  placeholder="Jelaskan isi dan spesifikasi paket..."
                  value={pkg.description}
                  onChange={(e) => updateNatura(i, "description", e.target.value)}
                  rows={2}
                />
                <Input
                  label="Minimum Kontribusi (Rp)"
                  required
                  placeholder="Contoh: 500000"
                  value={pkg.amount.toString()}
                  onChange={(e) => updateNatura(i, "amount", Number(e.target.value.replace(/\D/g, "")))}
                  helperText="Jumlah minimum kontribusi agar Pendana berhak atas paket ini."
                />
              </div>
            ))}

            <Button variant="tertiary" onClick={addNatura}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Paket Natura
            </Button>
            {form.naturaPackages.length === 0 && (
              <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] text-center">
                Anda tidak wajib menambahkan paket Natura. Lanjutkan ke tahap berikutnya jika tidak ada.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Step 5: Risk (Doc 4 Sec 12) ─────────────────────────────────────── */}
      {step === 5 && (
        <Card>
          <CardHeader><CardTitle>Identifikasi Risiko</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Alert variant="warning" title="Transparansi Risiko">
              Anda wajib mengidentifikasi potensi risiko yang dapat mempengaruhi keberhasilan proyek. Informasi ini digunakan Koperasi dan Pendana untuk evaluasi. Menyembunyikan risiko dapat mengakibatkan penolakan proyek.
            </Alert>
            <Textarea
              label="Deskripsi Potensi Risiko"
              required
              placeholder="Contoh: Risiko cuaca ekstrem (banjir/kekeringan), fluktuasi harga komoditas, hama penyakit tanaman..."
              value={form.riskDescription}
              onChange={(e) => setForm(f => ({ ...f, riskDescription: e.target.value }))}
              error={errors.riskDescription}
              rows={4}
            />
            <Textarea
              label="Rencana Mitigasi"
              required
              placeholder="Contoh: Menggunakan irigasi, asuransi pertanian, varietas tahan penyakit, diversifikasi komoditas..."
              value={form.mitigationPlan}
              onChange={(e) => setForm(f => ({ ...f, mitigationPlan: e.target.value }))}
              error={errors.mitigationPlan}
              rows={4}
              helperText="Jelaskan langkah konkret yang akan diambil untuk meminimalkan setiap risiko yang diidentifikasi."
            />
          </CardContent>
        </Card>
      )}

      {/* ── Step 6: Review & Submit ──────────────────────────────────────────── */}
      {step === 6 && (
        <Card>
          <CardHeader><CardTitle>Review & Submit</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Alert variant="warning" title="Konsekuensi Pengajuan">
              Setelah diajukan, proyek akan masuk ke tahap penilaian Koperasi. Data proyek tidak dapat diedit secara bebas setelah diajukan.
            </Alert>

            <div className="flex flex-col gap-4">
              <ReviewSection title="Informasi Proyek">
                <ReviewBlock label="Judul Proyek" value={form.title} />
                <ReviewBlock label="Deskripsi" value={form.description} multiline />
                <ReviewBlock label="Koperasi Pendamping" value={koperasiList?.find(k => k.id === form.koperasiId)?.name ?? form.koperasiId} />
              </ReviewSection>

              <ReviewSection title="Anggaran">
                <ReviewBlock label="Total Target Pendanaan" value={formatRupiah(totalTarget)} />
                <ReviewBlock label="Guarantee (5% BPC — Dibayar Terpisah)" value={formatRupiah(guarantee)} />
                <ReviewBlock label="Biaya Layanan Koperasi" value={formatRupiah(cooperativeFee)} />
                <ReviewBlock label="Biaya Layanan AgroFund" value={formatRupiah(agrofundFee)} />
              </ReviewSection>

              <ReviewSection title="Kebutuhan Pengadaan">
                <ReviewBlock label="Jumlah Item" value={`${form.procurementNeeds.filter(n => n.item.trim()).length} item`} />
              </ReviewSection>

              <ReviewSection title="Timeline">
                <ReviewBlock label="Tanggal Mulai" value={form.startDate || "Belum diisi"} />
                <ReviewBlock label="Tanggal Selesai" value={form.endDate || "Belum diisi"} />
                {form.harvestDate && <ReviewBlock label="Estimasi Panen" value={form.harvestDate} />}
              </ReviewSection>

              {form.naturaPackages.length > 0 && (
                <ReviewSection title="Paket Natura">
                  <ReviewBlock label="Jumlah Paket" value={`${form.naturaPackages.length} paket`} />
                </ReviewSection>
              )}

              <ReviewSection title="Risiko">
                <ReviewBlock label="Deskripsi Risiko" value={form.riskDescription} multiline />
                <ReviewBlock label="Rencana Mitigasi" value={form.mitigationPlan} multiline />
              </ReviewSection>
            </div>

            {createMutation.isError && (
              <Alert variant="error">
                Gagal membuat proyek. Silakan periksa kembali data dan coba lagi.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
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
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-[var(--text-body-s)]">
      <span className={bold ? "font-[700] text-[var(--color-neutral-900)]" : "text-[var(--color-neutral-600)]"}>{label}</span>
      <span className={bold ? "font-[700] text-[var(--color-primary-700)]" : "font-[500] text-[var(--color-neutral-900)]"}>{value}</span>
    </div>
  )
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--color-neutral-200)] rounded-[var(--radius-m)] overflow-hidden">
      <div className="px-4 py-2 bg-[var(--color-neutral-50)] border-b border-[var(--color-neutral-200)]">
        <p className="text-[var(--text-label)] font-[600] text-[var(--color-neutral-700)]">{title}</p>
      </div>
      <div className="px-4 py-3 flex flex-col gap-2">
        {children}
      </div>
    </div>
  )
}

function ReviewBlock({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">{label}</p>
      <p className={`text-[var(--text-body-m)] font-[500] text-[var(--color-neutral-900)] ${multiline ? "whitespace-pre-line" : ""}`}>
        {value}
      </p>
    </div>
  )
}

import * as React from "react"
