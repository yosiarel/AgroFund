import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/Card"
import { Input } from "../../../../../components/ui/Input"
import { Alert } from "../../../../../components/ui/Alert"
import type { StepProps } from "../types"

export function ProjectTimelineStep({ form, setForm, errors }: StepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Proyek</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Alert variant="info">
          Timeline digunakan sebagai acuan monitoring progres dan jadwal Natura (jika ada).
        </Alert>
        <Input
          label="Tanggal Mulai Proyek"
          type="date"
          required
          value={form.startDate}
          onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
          error={errors.startDate}
        />
        <Input
          label="Tanggal Target Selesai"
          type="date"
          required
          value={form.endDate}
          onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
          error={errors.endDate}
        />
        <Input
          label="Estimasi Tanggal Panen / Penyelesaian Output"
          type="date"
          value={form.harvestDate}
          onChange={(e) => setForm((f) => ({ ...f, harvestDate: e.target.value }))}
          helperText="Opsional. Digunakan sebagai referensi untuk jadwal distribusi Natura."
        />
      </CardContent>
    </Card>
  )
}
