import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/Card"
import { Input } from "../../../../../components/ui/Input"
import { Textarea } from "../../../../../components/ui/Textarea"
import { Alert } from "../../../../../components/ui/Alert"
import { Button } from "../../../../../components/ui/Button"
import { Plus, Trash2 } from "lucide-react"
import type { StepProps, NaturaPackageInput } from "../types"

export function ProjectNaturaStep({ form, setForm }: StepProps) {
  const addNatura = () =>
    setForm((f) => ({
      ...f,
      naturaPackages: [...f.naturaPackages, { name: "", description: "", amount: 0 }],
    }))

  const removeNatura = (i: number) =>
    setForm((f) => ({
      ...f,
      naturaPackages: f.naturaPackages.filter((_, idx) => idx !== i),
    }))

  const updateNatura = (i: number, field: keyof NaturaPackageInput, value: string | number) => {
    setForm((f) => {
      const updated = [...f.naturaPackages]
      updated[i] = { ...updated[i], [field]: value }
      return { ...f, naturaPackages: updated }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paket Natura (Opsional)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Alert variant="warning" title="Penting: Natura bukan return finansial">
          Natura adalah kompensasi non-finansial berupa produk hasil pertanian. Bukan bunga, bukan dividen, dan tidak
          dijamin nilainya setara kontribusi. Natura tidak boleh dipresentasikan sebagai guaranteed return kepada Pendana.
        </Alert>

        {form.naturaPackages.map((pkg, i) => (
          <div key={i} className="p-4 border border-[var(--color-neutral-200)] rounded-[var(--radius-m)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[var(--text-label)] font-[600]">Paket Natura #{i + 1}</p>
              <button
                onClick={() => removeNatura(i)}
                className="text-[var(--color-error-500)] hover:text-[var(--color-error-700)] p-1"
                aria-label={`Hapus natura ${i + 1}`}
              >
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
              placeholder="Contoh: 500.000"
              value={pkg.amount ? new Intl.NumberFormat("id-ID").format(pkg.amount) : ""}
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
  )
}
