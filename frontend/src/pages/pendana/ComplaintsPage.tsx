import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { Dispute, Contribution } from "../../types"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Textarea } from "../../components/ui/Textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { MessageSquareWarning, Plus, ShieldCheck } from "lucide-react"

export function ComplaintsPage() {
  const queryClient = useQueryClient()

  const { data: disputes, isLoading: isDisputesLoading } = useQuery<Dispute[]>({
    queryKey: ["pendana-disputes"],
    queryFn: () => api.get("/disputes"),
  })

  const { data: contributions } = useQuery<Contribution[]>({
    queryKey: ["pendana-contributions"],
    queryFn: () => api.get("/contributions"),
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [category, setCategory] = useState("Layanan / Pelaksanaan Proyek")
  const [description, setDescription] = useState("")

  const submitDisputeMutation = useMutation({
    mutationFn: () =>
      api.post("/disputes", {
        projectId: selectedProjectId,
        category,
        description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendana-disputes"] })
      setIsModalOpen(false)
      setDescription("")
      alert("Keluhan Anda berhasil dikirim ke Admin AgroFund.")
    },
  })

  if (isDisputesLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat pengaduan & kasus..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
            Pengaduan & Pusat Bantuan
          </h1>
          <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)]">
            Sampaikan kendala, laporan ketidaksesuaian laporan lapangan, atau keluhan terkait proyek yang Anda danai.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Buat Pengaduan Baru
        </Button>
      </div>

      <Alert variant="info" className="bg-[var(--color-primary-50)] border-[var(--color-primary-200)]">
        <div className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--color-primary-600)] flex-shrink-0" />
          <div className="text-[var(--text-body-m)] text-[var(--color-primary-900)]">
            <span className="font-[600]">Perlindungan Pendana (EP-12):</span> Setiap pengaduan akan langsung ditangani oleh Tim Kepatuhan AgroFund dengan berkoordinasi bersama Koperasi pendamping proyek.
          </div>
        </div>
      </Alert>

      <div className="flex flex-col gap-4">
        {(!disputes || disputes.length === 0) ? (
          <Card>
            <CardContent className="py-12 text-center text-[var(--color-neutral-600)]">
              <MessageSquareWarning className="w-12 h-12 text-[var(--color-neutral-400)] mx-auto mb-2" />
              <p className="font-[600]">Tidak ada pengaduan aktif</p>
              <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)]">
                Semua proyek dan interaksi pendanaan Anda berjalan lancar.
              </p>
            </CardContent>
          </Card>
        ) : (
          disputes.map((d) => (
            <Card key={d.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[var(--text-h5)]">
                    {d.category} — {d.project?.title || "Proyek Pertanian"}
                  </CardTitle>
                  <Badge variant={d.status === "RESOLVED" ? "success" : d.status === "INVESTIGATING" ? "info" : "warning"}>
                    {d.status === "RESOLVED" ? "Terselesaikan" : d.status === "INVESTIGATING" ? "Sedang Diselidiki" : "Menunggu Tanggapan"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-[var(--text-body-m)] text-[var(--color-neutral-800)] bg-[var(--color-neutral-50)] p-3 rounded-[var(--radius-s)]">
                  {d.description}
                </p>

                {d.resolutionNotes && (
                  <div className="p-3 bg-[var(--color-success-50)] rounded-[var(--radius-s)] border border-[var(--color-success-200)] text-[var(--text-body-s)] text-[var(--color-success-900)]">
                    <span className="font-[600]">Penyelesaian Admin AgroFund:</span> {d.resolutionNotes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle>Form Pengaduan / Keluhan</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <label className="text-[var(--text-label)] font-[500] mb-1 block">Pilih Proyek Terkait</label>
                <select
                  className="w-full px-3 py-2 border border-[var(--color-neutral-300)] rounded-[var(--radius-m)] text-[var(--text-body-m)] bg-white"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">-- Pilih Proyek yang Anda Danai --</option>
                  {contributions?.map((c) => (
                    <option key={c.project.id} value={c.project.id}>{c.project.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[var(--text-label)] font-[500] mb-1 block">Kategori Kendala</label>
                <select
                  className="w-full px-3 py-2 border border-[var(--color-neutral-300)] rounded-[var(--radius-m)] text-[var(--text-body-m)] bg-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Layanan / Pelaksanaan Proyek">Layanan / Pelaksanaan Proyek</option>
                  <option value="Keterlambatan Pengiriman Natura">Keterlambatan Pengiriman Natura</option>
                  <option value="Ketidaksesuaian Laporan Lapangan">Ketidaksesuaian Laporan Lapangan</option>
                  <option value="Kendala Pembayaran / Invoice">Kendala Pembayaran / Invoice</option>
                </select>
              </div>

              <Textarea
                label="Rincian Pengaduan"
                placeholder="Jelaskan secara spesifik masalah yang dialami..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button variant="tertiary" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={() => submitDisputeMutation.mutate()}
                isLoading={submitDisputeMutation.isPending}
                disabled={!selectedProjectId || !description}
              >
                Kirim Pengaduan
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
