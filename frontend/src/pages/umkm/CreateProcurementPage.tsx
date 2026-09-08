import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { Project, SupplierRecord } from "../../types"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Textarea } from "../../components/ui/Textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/Card"
import { formatRupiah } from "../../components/business/FinancialSummary"
import { ArrowLeft, Plus, Trash2, ShieldAlert } from "lucide-react"

export interface ItemInput {
  name: string
  quantity: number
  unit: string
  estimatedUnitPrice: number
}

export function parseCurrencyInput(value: string): number {
  const rawDigits = value.replace(/\D/g, "")
  return rawDigits ? parseInt(rawDigits, 10) : 0
}

export function formatCurrencyDisplay(value: number): string {
  return value ? value.toLocaleString("id-ID") : ""
}

export function calculateItemSubtotal(quantity: number, unitPrice: number): number {
  return (Number(quantity) || 0) * (Number(unitPrice) || 0)
}

export function buildProcurementPayload(
  items: ItemInput[],
  notes?: string,
  supplierType: "existing" | "nominate" = "existing",
  selectedSupplierId?: string,
  nominatedSupplier?: any
) {
  return {
    items: items.map((item) => ({
      name: item.name.trim(),
      quantity: Number(item.quantity) || 1,
      estimatedUnitPrice: Number(item.estimatedUnitPrice) || 0,
    })),
    notes: notes ? notes.trim() : undefined,
    supplierId: supplierType === "existing" ? selectedSupplierId || undefined : undefined,
    nominatedSupplier: supplierType === "nominate" ? nominatedSupplier : undefined,
  }
}

export function CreateProcurementPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const { data: project, isLoading: isProjectLoading } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: () => api.get(`/projects/${projectId}`),
    enabled: !!projectId,
  })

  const { data: suppliers } = useQuery<SupplierRecord[]>({
    queryKey: ["suppliers"],
    queryFn: () => api.get("/procurement/suppliers"),
  })

  const [items, setItems] = useState<ItemInput[]>([
    { name: "", quantity: 1, unit: "kg", estimatedUnitPrice: 0 },
  ])

  const [supplierType, setSupplierType] = useState<"existing" | "nominate">("existing")
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("")
  const [nominatedSupplier, setNominatedSupplier] = useState({
    name: "",
    contactInfo: "",
    bankName: "",
    bankAccountNumber: "",
  })
  const [notes, setNotes] = useState("")

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, unit: "kg", estimatedUnitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof ItemInput, value: any) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const totalEstimated = items.reduce(
    (sum, item) => sum + calculateItemSubtotal(item.quantity, item.estimatedUnitPrice),
    0
  )

  const createMutation = useMutation({
    mutationFn: () =>
      api.post(
        `/procurement/projects/${projectId}/request`,
        buildProcurementPayload(items, notes, supplierType, selectedSupplierId, nominatedSupplier)
      ),
    onSuccess: () => {
      navigate(`/umkm/projects/${projectId}/procurement`)
    },
  })

  if (isProjectLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat formulir pengadaan..." />
      </div>
    )
  }

  if (!project) {
    return <Alert variant="error">Proyek tidak ditemukan.</Alert>
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button
          variant="tertiary"
          className="px-2"
          onClick={() => navigate(`/umkm/projects/${projectId}/procurement`)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
            Buat Pengajuan Pengadaan
          </h1>
          <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">
            {project.title}
          </p>
        </div>
      </div>

      <Alert variant="warning" className="bg-[var(--color-warning-50)] border-[var(--color-warning-200)]">
        <div className="flex gap-3">
          <ShieldAlert className="w-5 h-5 text-[var(--color-warning-600)] flex-shrink-0" />
          <div className="text-[var(--text-body-m)] text-[var(--color-warning-900)]">
            <span className="font-[600]">Ketentuan Supplier:</span> Supplier adalah pihak eksternal independen. Informasi rekening pembayaran yang diajukan wajib valid karena pencairan akan dieksekusi langsung oleh sistem ke rekening tersebut setelah diverifikasi Koperasi.
          </div>
        </div>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Item Kebutuhan Pengadaan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-[var(--radius-m)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-label)] font-[600] text-[var(--color-neutral-700)]">
                  Item #{idx + 1}
                </span>
                {items.length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(idx)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Hapus
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <Input
                    label="Nama Item / Barang"
                    placeholder="Contoh: Pupuk NPK Organik"
                    value={item.name}
                    onChange={(e) => updateItem(idx, "name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Jumlah"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Satuan"
                    placeholder="kg / liter / zak"
                    value={item.unit}
                    onChange={(e) => updateItem(idx, "unit", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Input
                  label="Estimasi Harga Satuan (Rp)"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={item.estimatedUnitPrice ? item.estimatedUnitPrice.toLocaleString("id-ID") : ""}
                  onChange={(e) => {
                    const rawDigits = e.target.value.replace(/\D/g, "")
                    updateItem(idx, "estimatedUnitPrice", rawDigits ? parseInt(rawDigits, 10) : 0)
                  }}
                  helperText={`Subtotal: ${formatRupiah((item.quantity || 0) * (item.estimatedUnitPrice || 0))}`}
                  required
                />
              </div>
            </div>
          ))}

          <Button variant="secondary" onClick={addItem} className="w-fit">
            <Plus className="w-4 h-4 mr-1.5" /> Tambah Item Lain
          </Button>

          <div className="flex justify-between items-center p-4 bg-[var(--color-primary-50)] rounded-[var(--radius-m)] mt-2">
            <span className="font-[600] text-[var(--color-neutral-900)]">Total Estimasi Pengadaan:</span>
            <span className="text-[var(--text-h4)] font-[700] text-[var(--color-primary-700)]">
              {formatRupiah(totalEstimated)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Section (Doc 4 Sec 37-38) */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Supplier</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="supplierType"
                checked={supplierType === "existing"}
                onChange={() => setSupplierType("existing")}
              />
              <span className="text-[var(--text-body-m)] font-[500]">Pilih Supplier Terdaftar</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="supplierType"
                checked={supplierType === "nominate"}
                onChange={() => setSupplierType("nominate")}
              />
              <span className="text-[var(--text-body-m)] font-[500]">Ajukan Supplier Baru</span>
            </label>
          </div>

          {supplierType === "existing" ? (
            <div className="flex flex-col gap-2">
              <label className="text-[var(--text-label)] font-[500] text-[var(--color-neutral-800)]">
                Daftar Supplier
              </label>
              <select
                className="w-full px-3 py-2 border border-[var(--color-neutral-300)] rounded-[var(--radius-m)] text-[var(--text-body-m)] bg-white"
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
              >
                <option value="">-- Pilih Supplier --</option>
                {suppliers?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.bankName || "Bank"} - {s.bankAccountNumber || "N/A"})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nama Supplier / Toko"
                placeholder="UD Tani Makmur"
                value={nominatedSupplier.name}
                onChange={(e) => setNominatedSupplier({ ...nominatedSupplier, name: e.target.value })}
                required
              />
              <Input
                label="Kontak / WhatsApp"
                placeholder="08123456789"
                value={nominatedSupplier.contactInfo}
                onChange={(e) => setNominatedSupplier({ ...nominatedSupplier, contactInfo: e.target.value })}
                required
              />
              <Input
                label="Nama Bank"
                placeholder="Bank Mandiri / BRI / BCA"
                value={nominatedSupplier.bankName}
                onChange={(e) => setNominatedSupplier({ ...nominatedSupplier, bankName: e.target.value })}
                required
              />
              <Input
                label="Nomor Rekening Supplier"
                placeholder="1234567890"
                value={nominatedSupplier.bankAccountNumber}
                onChange={(e) => setNominatedSupplier({ ...nominatedSupplier, bankAccountNumber: e.target.value })}
                required
              />
            </div>
          )}

          <Textarea
            label="Catatan Pengadaan (Opsional)"
            placeholder="Jelaskan kebutuhan pengadaan atau spesifikasi khusus barang..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button
            variant="tertiary"
            onClick={() => navigate(`/umkm/projects/${projectId}/procurement`)}
            disabled={createMutation.isPending}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={() => createMutation.mutate()}
            isLoading={createMutation.isPending}
            disabled={
              items.some((i) => !i.name || i.quantity <= 0 || i.estimatedUnitPrice <= 0) ||
              (supplierType === "existing" && !selectedSupplierId) ||
              (supplierType === "nominate" && (!nominatedSupplier.name || !nominatedSupplier.bankAccountNumber))
            }
          >
            Kirim Pengajuan ke Koperasi
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
