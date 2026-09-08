import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/Card"
import { Input } from "../../../../../components/ui/Input"
import { Alert } from "../../../../../components/ui/Alert"
import { formatRupiah } from "../../../../../components/business/FinancialSummary"
import type { StepProps } from "../types"

// We can reuse the Row component here, or create a small local one
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-[var(--text-body-s)]">
      <span className={bold ? "font-[700] text-[var(--color-neutral-900)]" : "text-[var(--color-neutral-600)]"}>
        {label}
      </span>
      <span className={bold ? "font-[700] text-[var(--color-primary-700)]" : "font-[500] text-[var(--color-neutral-900)]"}>
        {value}
      </span>
    </div>
  )
}

export function ProjectBudgetStep({ form, setForm, errors }: StepProps) {
  const bpc = Number(form.basicProcurementCapital) || 0
  const reserve = Number(form.priceReserve) || 0
  const naturaCost = Number(form.naturaCost) || 0

  const cooperativeFee = Math.round(0.025 * (bpc + reserve))
  const agrofundFee = Math.round(0.025 * bpc)
  const calculatedTargetAmount = bpc + reserve + cooperativeFee + agrofundFee + naturaCost
  const guarantee = Math.round(bpc * 0.05)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anggaran Proyek</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Alert variant="info" title="Cara Kerja Anggaran">
          Target Pendanaan = Modal Pengadaan + Cadangan Harga + Biaya Layanan Koperasi (2,5%) + Biaya Layanan AgroFund
          (2,5%) + Biaya Natura. Guarantee (5% BPC) dibayar terpisah setelah proyek disetujui.
        </Alert>

        <Input
          label="Modal Pengadaan Dasar (Basic Procurement Capital)"
          required
          placeholder="Contoh: 10.000.000"
          value={form.basicProcurementCapital ? new Intl.NumberFormat("id-ID").format(Number(form.basicProcurementCapital)) : ""}
          onChange={(e) => setForm((f) => ({ ...f, basicProcurementCapital: e.target.value.replace(/\D/g, "") }))}
          error={errors.basicProcurementCapital}
          helperText="Estimasi total biaya pengadaan barang/jasa untuk proyek ini."
        />
        <Input
          label="Cadangan Harga (Price Reserve)"
          placeholder="Contoh: 500.000"
          value={form.priceReserve ? new Intl.NumberFormat("id-ID").format(Number(form.priceReserve)) : ""}
          onChange={(e) => setForm((f) => ({ ...f, priceReserve: e.target.value.replace(/\D/g, "") }))}
          helperText="Cadangan untuk antisipasi kenaikan harga. Bisa dikosongkan."
        />
        <Input
          label="Biaya Natura"
          placeholder="Contoh: 200.000"
          value={form.naturaCost ? new Intl.NumberFormat("id-ID").format(Number(form.naturaCost)) : ""}
          onChange={(e) => setForm((f) => ({ ...f, naturaCost: e.target.value.replace(/\D/g, "") }))}
          helperText="Total biaya kompensasi natura (akan dibagi ke paket-paket Natura di langkah berikutnya)."
        />

        {bpc > 0 && (
          <div className="p-4 bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-[var(--radius-m)] flex flex-col gap-2">
            <p className="text-[var(--text-label)] font-[600] text-[var(--color-neutral-900)]">
              Ringkasan Anggaran (Preview)
            </p>
            <Row label="Modal Pengadaan (BPC)" value={formatRupiah(bpc)} />
            <Row label="Cadangan Harga" value={formatRupiah(reserve)} />
            <Row label="Biaya Natura" value={formatRupiah(naturaCost)} />
            <div className="border-t pt-2 mt-1">
              <Row label="Biaya Layanan Koperasi (2,5% BPC+Cadangan)" value={formatRupiah(cooperativeFee)} />
              <Row label="Biaya Layanan AgroFund (2,5% BPC)" value={formatRupiah(agrofundFee)} />
            </div>
            <div className="border-t pt-2 mt-1">
              <Row label="Total Target Pendanaan" value={formatRupiah(calculatedTargetAmount)} bold />
              <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] mt-1">
                Biaya layanan sudah termasuk dalam total target.
              </p>
            </div>
            <div className="border-t pt-2 mt-1">
              <Row label="Guarantee UMKM (5% BPC — Dibayar Terpisah)" value={formatRupiah(guarantee)} />
              <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] mt-1">
                Guarantee bukan bagian dari Target Pendanaan.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
