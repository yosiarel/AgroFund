import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/Card"
import { Input } from "../../../../../components/ui/Input"
import { Alert } from "../../../../../components/ui/Alert"
import { Button } from "../../../../../components/ui/Button"
import { Plus, Trash2 } from "lucide-react"
import type { StepProps, ProcurementNeed } from "../types"

export function ProjectProcurementStep({ form, setForm, errors }: StepProps) {
  const addNeed = () =>
    setForm((f) => ({
      ...f,
      procurementNeeds: [...f.procurementNeeds, { item: "", quantity: "", unit: "unit", estimatedPrice: "" }],
    }))

  const removeNeed = (i: number) =>
    setForm((f) => ({
      ...f,
      procurementNeeds: f.procurementNeeds.filter((_, idx) => idx !== i),
    }))

  const updateNeed = (i: number, field: keyof ProcurementNeed, value: string) => {
    setForm((f) => {
      const updated = [...f.procurementNeeds]
      updated[i] = { ...updated[i], [field]: value }
      return { ...f, procurementNeeds: updated }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kebutuhan Pengadaan</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Alert variant="info">
          Daftarkan barang atau jasa yang akan dibeli menggunakan dana proyek ini. Koperasi akan memvalidasi setiap
          kebutuhan pengadaan sebelum Procurement dapat dilanjutkan.
        </Alert>
        {errors.procurementNeeds && <Alert variant="error">{errors.procurementNeeds}</Alert>}

        {form.procurementNeeds.map((need, i) => (
          <div key={i} className="p-4 border border-[var(--color-neutral-200)] rounded-[var(--radius-m)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[var(--text-label)] font-[600]">Kebutuhan #{i + 1}</p>
              {form.procurementNeeds.length > 1 && (
                <button
                  onClick={() => removeNeed(i)}
                  className="text-[var(--color-error-500)] hover:text-[var(--color-error-700)] p-1"
                  aria-label={`Hapus kebutuhan ${i + 1}`}
                >
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
                value={need.quantity ? new Intl.NumberFormat("id-ID").format(Number(need.quantity)) : ""}
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
              placeholder="Contoh: 50.000"
              value={need.estimatedPrice ? new Intl.NumberFormat("id-ID").format(Number(need.estimatedPrice)) : ""}
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
  )
}
