export const REVIEW_CHECKLIST = [
  {
    id: "completeness",
    label: "Kelengkapan Data",
    description: "Seluruh informasi wajib telah diisi (judul, deskripsi, timeline, pengadaan).",
  },
  {
    id: "assessment_approved",
    label: "Hasil Penilaian Koperasi",
    description: "Koperasi telah menyetujui proyek (Cooperative Assessment = Approved).",
  },
  {
    id: "financial_structure",
    label: "Struktur Keuangan",
    description: "Target pendanaan, Guarantee (5% BPC), dan biaya layanan sudah sesuai formula.",
  },
  {
    id: "guarantee_requirement",
    label: "Persyaratan Guarantee",
    description: "UMKM memahami kewajiban Guarantee yang harus dibayar setelah approval.",
  },
  {
    id: "natura_disclosure",
    label: "Disclosure Natura",
    description: "Paket Natura (jika ada) tidak disajikan sebagai guaranteed financial return.",
  },
  {
    id: "risk_disclosure",
    label: "Disclosure Risiko",
    description: "Risiko proyek teridentifikasi dan dikomunikasikan secara transparan.",
  },
  {
    id: "publication_ready",
    label: "Siap Dipublikasikan",
    description: "Proyek memenuhi semua persyaratan publikasi platform AgroFund.",
  },
] as const
