import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/Card"
import { Alert } from "../../../../../components/ui/Alert"
import { formatRupiah } from "../../../../../components/business/FinancialSummary"
import type { FormData } from "../types"

interface ProjectReviewStepProps {
  form: FormData
  calculatedTargetAmount: number
  guarantee: number
  cooperativeFee: number
  agrofundFee: number
  koperasiList?: Array<{ id: string; name: string }>
  isError: boolean
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--color-neutral-200)] rounded-[var(--radius-m)] overflow-hidden">
      <div className="px-4 py-2 bg-[var(--color-neutral-50)] border-b border-[var(--color-neutral-200)]">
        <p className="text-[var(--text-label)] font-[600] text-[var(--color-neutral-700)]">{title}</p>
      </div>
      <div className="px-4 py-3 flex flex-col gap-2">{children}</div>
    </div>
  )
}

function ReviewBlock({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">{label}</p>
      <p
        className={`text-[var(--text-body-m)] font-[500] text-[var(--color-neutral-900)] ${
          multiline ? "whitespace-pre-line" : ""
        }`}
      >
        {value}
      </p>
    </div>
  )
}

export function ProjectReviewStep({
  form,
  calculatedTargetAmount,
  guarantee,
  cooperativeFee,
  agrofundFee,
  koperasiList,
  isError,
}: ProjectReviewStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Submit</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Alert variant="warning" title="Konsekuensi Pengajuan">
          Setelah diajukan, proyek akan masuk ke tahap penilaian Koperasi. Data proyek tidak dapat diedit secara bebas
          setelah diajukan.
        </Alert>

        <div className="flex flex-col gap-4">
          <ReviewSection title="Informasi Proyek">
            {form.imageUrl && (
              <div className="mb-4">
                <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] mb-1">Foto Proyek</p>
                <img src={form.imageUrl} alt="Thumbnail proyek" className="w-full max-w-sm aspect-video rounded-[var(--radius-m)] object-cover border border-[var(--color-neutral-200)]" />
              </div>
            )}
            <ReviewBlock label="Judul Proyek" value={form.title} />
            <ReviewBlock label="Deskripsi" value={form.description} multiline />
            <ReviewBlock
              label="Koperasi Pendamping"
              value={koperasiList?.find((k) => k.id === form.koperasiId)?.name ?? form.koperasiId}
            />
          </ReviewSection>

          <ReviewSection title="Anggaran">
            <ReviewBlock label="Total Target Pendanaan" value={formatRupiah(calculatedTargetAmount)} />
            <ReviewBlock label="Guarantee (5% BPC — Dibayar Terpisah)" value={formatRupiah(guarantee)} />
            <ReviewBlock label="Biaya Layanan Koperasi" value={formatRupiah(cooperativeFee)} />
            <ReviewBlock label="Biaya Layanan AgroFund" value={formatRupiah(agrofundFee)} />
          </ReviewSection>

          <ReviewSection title="Kebutuhan Pengadaan">
            <ReviewBlock
              label="Jumlah Item"
              value={`${form.procurementNeeds.filter((n) => n.item.trim()).length} item`}
            />
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

        {isError && (
          <Alert variant="error">Gagal membuat proyek. Silakan periksa kembali data dan coba lagi.</Alert>
        )}
      </CardContent>
    </Card>
  )
}
