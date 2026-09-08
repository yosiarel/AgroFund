import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/Card"
import { Input } from "../../../../../components/ui/Input"
import { Textarea } from "../../../../../components/ui/Textarea"
import { Select } from "../../../../../components/ui/Select"
import { Alert } from "../../../../../components/ui/Alert"
import { ImagePlus, Loader2, X } from "lucide-react"
import { useState } from "react"
import api from "../../../../../lib/axios"
import type { StepProps } from "../types"

interface ProjectInfoStepProps extends StepProps {
  koperasiList?: Array<{ id: string; name: string }>
}

export function ProjectInfoStep({ form, setForm, errors, koperasiList }: ProjectInfoStepProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError("")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res: any = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setForm((f) => ({ ...f, imageUrl: res.data?.url || res.url }))
    } catch (err: any) {
      setUploadError(err.response?.data?.message || "Gagal mengunggah gambar")
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    setForm((f) => ({ ...f, imageUrl: "" }))
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Informasi Proyek</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input
          label="Judul Proyek"
          required
          placeholder="Contoh: Budidaya Padi Organik 2025"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          error={errors.title}
        />
        <Textarea
          label="Deskripsi Proyek"
          required
          placeholder="Jelaskan tujuan, komoditas, lokasi, dan estimasi hasil panen..."
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          error={errors.description}
          rows={5}
          helperText="Semakin jelas deskripsi, semakin mudah Koperasi dan Pendana mengevaluasi proyek Anda."
        />
        <Select
          label="Koperasi Pendamping"
          required
          options={koperasiList?.map((k) => ({ label: k.name, value: k.id })) ?? []}
          value={form.koperasiId}
          onChange={(e) => setForm((f) => ({ ...f, koperasiId: e.target.value }))}
          error={errors.koperasiId}
          helperText="Koperasi akan melakukan penilaian lapangan (Field Assessment) pada proyek Anda."
        />

        {/* Image Upload Section */}
        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-[var(--text-label)] font-[600] text-[var(--color-neutral-700)]">
            Foto Proyek / Thumbnail
          </label>
          <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)] mb-2">
            Pilih foto yang menarik dan representatif agar proyek Anda menonjol di halaman publik.
          </p>

          {uploadError && <Alert variant="error">{uploadError}</Alert>}

          {form.imageUrl ? (
            <div className="relative w-full aspect-video rounded-[var(--radius-m)] overflow-hidden border border-[var(--color-neutral-200)] group">
              <img src={form.imageUrl} alt="Thumbnail proyek" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={removeImage}
                  className="bg-white text-[var(--color-error-600)] p-2 rounded-full hover:scale-110 transition-transform flex items-center gap-2 px-4 shadow-lg"
                >
                  <X className="w-4 h-4" /> Hapus Foto
                </button>
              </div>
            </div>
          ) : (
            <label className={`relative flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-[var(--radius-m)] transition-colors ${isUploading ? 'bg-[var(--color-neutral-100)] border-[var(--color-neutral-300)] cursor-not-allowed' : 'border-[var(--color-neutral-300)] hover:border-[var(--color-primary-400)] hover:bg-[var(--color-primary-50)] cursor-pointer bg-[var(--color-neutral-50)]'}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-[var(--color-neutral-500)]">
                {isUploading ? (
                  <>
                    <Loader2 className="w-10 h-10 mb-3 text-[var(--color-primary-500)] animate-spin" />
                    <p className="text-sm font-[600]">Mengunggah foto...</p>
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-10 h-10 mb-3 text-[var(--color-neutral-400)]" />
                    <p className="text-sm font-[600]">Klik untuk mengunggah gambar</p>
                    <p className="text-xs mt-1">JPG, PNG, WEBP (Maks 5MB)</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/jpeg, image/png, image/webp" 
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
