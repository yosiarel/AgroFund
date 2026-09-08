import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/Card"
import { Textarea } from "../../../../../components/ui/Textarea"
import { Alert } from "../../../../../components/ui/Alert"
import type { StepProps } from "../types"

export function ProjectRiskStep({ form, setForm, errors }: StepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Identifikasi Risiko</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Alert variant="warning" title="Transparansi Risiko">
          Anda wajib mengidentifikasi potensi risiko yang dapat mempengaruhi keberhasilan proyek. Informasi ini digunakan
          Koperasi dan Pendana untuk evaluasi. Menyembunyikan risiko dapat mengakibatkan penolakan proyek.
        </Alert>
        <Textarea
          label="Deskripsi Potensi Risiko"
          required
          placeholder="Contoh: Risiko cuaca ekstrem (banjir/kekeringan), fluktuasi harga komoditas, hama penyakit tanaman..."
          value={form.riskDescription}
          onChange={(e) => setForm((f) => ({ ...f, riskDescription: e.target.value }))}
          error={errors.riskDescription}
          rows={4}
        />
        <Textarea
          label="Rencana Mitigasi"
          required
          placeholder="Contoh: Menggunakan irigasi, asuransi pertanian, varietas tahan penyakit, diversifikasi komoditas..."
          value={form.mitigationPlan}
          onChange={(e) => setForm((f) => ({ ...f, mitigationPlan: e.target.value }))}
          error={errors.mitigationPlan}
          rows={4}
          helperText="Jelaskan langkah konkret yang akan diambil untuk meminimalkan setiap risiko yang diidentifikasi."
        />
      </CardContent>
    </Card>
  )
}
