import { useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../lib/axios"
import type { Project, NaturaPackage } from "../../types"
import { ProjectStatusBadge } from "../../components/business/ProjectStatusBadge"
import { FundingProgressBar } from "../../components/business/FundingProgressBar"
import { formatRupiah } from "../../components/business/FinancialSummary"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner"
import { Alert } from "../../components/ui/Alert"
import { Button } from "../../components/ui/Button"
import { Modal } from "../../components/ui/Modal"
import { Input } from "../../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Building2, Users, CalendarDays, ShieldCheck } from "lucide-react"

/**
 * Project Detail Page — for Pendana & Public (Doc 4, Sec 26, 27, 28, 29)
 *
 * Must display (Sec 26):
 * - Project: purpose, scope, UMKM, Koperasi
 * - Funding: Target, funded amount, progress, deadline
 * - Natura: package, availability, quantity, quality, fulfillment policy
 * - Rules: Guarantee, cancellation, failure, recovery/refund
 *
 * CTA "Contribute" (Sec 27):
 *   ONLY if: status == FUNDRAISING AND funding < 100% AND deadline not reached
 */

function fetchProject(id: string): Promise<Project> {
  return api.get(`/projects/${id}`)
}

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false)

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" label="Memuat detail proyek..." />
      </div>
    )
  }

  if (error || !project) {
    return (
      <Alert variant="error" className="mt-4">
        Gagal memuat detail proyek. Proyek tidak ditemukan atau terjadi kesalahan.
      </Alert>
    )
  }

  const percentage = Math.round((project.fundedAmount / project.totalTarget) * 100)
  const isFullyFunded = percentage >= 100
  const isExpired = new Date() > new Date(project.fundraisingDeadline || "")

  // CTA eligibility (Doc 4, Sec 27)
  const canContribute =
    project.status === "FUNDRAISING" && !isFullyFunded && !isExpired

  const handleContributeClick = () => {
    if (!user) {
      navigate("/login", { state: { from: location } })
      return
    }
    if (user.role === "PENDANA") {
      setIsContributeModalOpen(true)
    }
  }

  const handleBackNavigation = () => {
    if (location.pathname.startsWith("/projects")) {
      navigate("/projects")
    } else if (location.pathname.startsWith("/umkm")) {
      navigate("/umkm/discover")
    } else {
      navigate("/pendana/discover")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
        <button onClick={handleBackNavigation} className="hover:text-[var(--color-primary-600)] transition-colors">
          Discover Projects
        </button>
        <span className="mx-2">›</span>
        <span className="text-[var(--color-neutral-900)]">{project.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Main Info */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
              <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)]">
                {project.title}
              </h1>
              <ProjectStatusBadge status={project.status} showAuthority />
            </div>

            {/* Fully Funded banner replaces CTA per Sec 30 */}
            {isFullyFunded && (
              <Alert variant="success" title="Dana Terpenuhi">
                Proyek ini telah mencapai target pendanaan. Pendanaan telah ditutup.
              </Alert>
            )}
            {isExpired && !isFullyFunded && (
              <Alert variant="warning" title="Funding Deadline Reached">
                Batas waktu pendanaan telah berakhir. Proyek ini tidak lagi menerima kontribusi.
              </Alert>
            )}
          </div>

          {/* Project Purpose & Scope */}
          <Card>
            <CardHeader><CardTitle>Tentang Proyek</CardTitle></CardHeader>
            <CardContent>
              <p className="text-[var(--text-body-m)] text-[var(--color-neutral-700)] leading-[var(--text-body-m--line-height)] whitespace-pre-line">
                {project.description}
              </p>
            </CardContent>
          </Card>

          {/* UMKM & Koperasi — Doc 4 Sec 26 */}
          <Card>
            <CardHeader><CardTitle>Pelaku Proyek</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <InfoRow icon={<Users className="w-5 h-5" />} label="UMKM / Petani" value={project.user.name} />
              {project.koperasi && (
                <InfoRow
                  icon={<Building2 className="w-5 h-5" />}
                  label="Koperasi Pendamping"
                  value={project.koperasi.name}
                />
              )}
            </CardContent>
          </Card>

          {/* Procurement Needs — Doc 4 Sec 26 */}
          {project.procurementNeeds && project.procurementNeeds.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Kebutuhan Pengadaan</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Alert variant="info">
                  Dana akan dialokasikan untuk kebutuhan pengadaan berikut.
                </Alert>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--color-neutral-200)]">
                        <th className="py-2 px-1 text-[var(--text-caption)] font-[600] text-[var(--color-neutral-600)]">Item</th>
                        <th className="py-2 px-1 text-[var(--text-caption)] font-[600] text-[var(--color-neutral-600)] text-right">Jumlah</th>
                        <th className="py-2 px-1 text-[var(--text-caption)] font-[600] text-[var(--color-neutral-600)] text-right">Estimasi Harga</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.procurementNeeds.map((need, idx) => (
                        <tr key={need.id || idx} className="border-b border-[var(--color-neutral-100)] last:border-0">
                          <td className="py-3 px-1 text-[var(--text-body-s)] text-[var(--color-neutral-900)] font-[500]">{need.item}</td>
                          <td className="py-3 px-1 text-[var(--text-body-s)] text-[var(--color-neutral-700)] text-right whitespace-nowrap">{need.quantity} {need.unit}</td>
                          <td className="py-3 px-1 text-[var(--text-body-s)] text-[var(--color-neutral-900)] text-right whitespace-nowrap">{formatRupiah(Number(need.estimatedPrice))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Natura Packages — Doc 4 Sec 26 (if any) */}
          {project.naturaPackages && project.naturaPackages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Paket Natura</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Alert variant="info">
                  Natura adalah kompensasi non-finansial berupa produk hasil pertanian. Bukan bunga, bukan dividen.
                </Alert>
                {project.naturaPackages.map((pkg) => (
                  <NaturaPackageCard key={pkg.id} pkg={pkg} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Rules — Guarantee, cancellation, refund (Doc 4 Sec 26) */}
          <Card>
            <CardHeader><CardTitle>Ketentuan & Perlindungan</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <InfoRow
                icon={<ShieldCheck className="w-5 h-5 text-[var(--color-primary-500)]" />}
                label="Jaminan (Guarantee)"
                value={`${formatRupiah(project.basicProcurementCapital * 0.05)} (5% dari Modal Pengadaan)`}
              />
              <Alert variant="warning" title="Risiko Pendanaan">
                Pendanaan ini bukan deposito. Dana tidak dijamin kembali 100% jika proyek mengalami kegagalan.
                Recovery & Refund dilakukan sesuai ketentuan platform.
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Funding Widget */}
        <div className="flex flex-col gap-4">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Status Pendanaan</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <FundingProgressBar
                fundedAmount={project.fundedAmount}
                targetAmount={project.totalTarget}
                deadline={project.fundraisingDeadline || ""}
                showRemainingLabel
              />

              <div className="flex flex-col gap-2 text-[var(--text-body-s)]">
                <div className="flex justify-between">
                  <span className="text-[var(--color-neutral-600)]">Modal Pengadaan</span>
                  <span className="font-[600]">{formatRupiah(project.basicProcurementCapital)}</span>
                </div>
                {project.naturaCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-neutral-600)]">Biaya Natura</span>
                    <span className="font-[600]">{formatRupiah(project.naturaCost)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 mt-1">
                  <span className="font-[600] text-[var(--color-neutral-900)]">Total Target</span>
                  <span className="font-[700] text-[var(--color-primary-700)]">{formatRupiah(project.totalTarget)}</span>
                </div>
              </div>

              {/* CTA — only visible when canContribute (Doc 4 Sec 27) */}
              {canContribute && (
                <>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleContributeClick}
                  >
                    Danai Proyek Ini
                  </Button>
                  {user && user.role !== "PENDANA" && (
                    <p className="text-[var(--text-caption)] text-[var(--color-warning-700)] text-center">
                      Akun Anda ({user.role}) tidak memiliki izin mendanai. Gunakan akun Pendana.
                    </p>
                  )}
                </>
              )}

              <div className="flex items-center gap-2 text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  Batas pendanaan: {project.fundraisingDeadline ? new Date(project.fundraisingDeadline).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric"
                  }) : "-"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contribution Modal */}
      {canContribute && (
        <ContributeModal
          isOpen={isContributeModalOpen}
          onClose={() => setIsContributeModalOpen(false)}
          project={project}
        />
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      {icon && <div className="text-[var(--color-primary-500)] flex-shrink-0">{icon}</div>}
      <div>
        <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">{label}</p>
        <p className="text-[var(--text-body-m)] font-[500] text-[var(--color-neutral-900)]">{value}</p>
      </div>
    </div>
  )
}

function NaturaPackageCard({ pkg }: { pkg: NaturaPackage }) {
  return (
    <div className="p-3 border border-[var(--color-neutral-200)] rounded-[var(--radius-m)] flex justify-between items-center">
      <div>
        <p className="text-[var(--text-label)] font-[600] text-[var(--color-neutral-900)]">{pkg.name}</p>
        <p className="text-[var(--text-caption)] text-[var(--color-neutral-600)]">{pkg.description}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)]">Min. Kontribusi</p>
        <p className="text-[var(--text-label)] font-[600] text-[var(--color-primary-700)]">
          {formatRupiah(pkg.amount)}
        </p>
      </div>
    </div>
  )
}

// ─── Contribute Modal (Doc 4, Sec 28, 29, 31) ────────────────────────────────

import * as React from "react"
import { useMutation } from "@tanstack/react-query"

function ContributeModal({
  isOpen, onClose, project
}: {
  isOpen: boolean
  onClose: () => void
  project: Project
}) {
  const [amount, setAmount] = useState("")
  const [selectedNatura, setSelectedNatura] = useState<string | null>(null)
  const [step, setStep] = useState<"enter" | "review">("enter")
  const [amountError, setAmountError] = useState("")
  const navigate = useNavigate()

  const remainingAmount = project.totalTarget - project.fundedAmount
  const numericAmount = Number(amount.replace(/\D/g, ""))
  const processingFee = Math.round(numericAmount * 0.025) // 2.5% processing fee
  const totalPayment = numericAmount + processingFee

  const contributeMutation = useMutation({
    mutationFn: () => api.post(`/finance/projects/${project.id}/contribute`, {
      amount: numericAmount,
      naturaPackageId: selectedNatura ?? undefined,
    }),
    onSuccess: (data: any) => {
      // Redirect to Xendit payment page (invoice URL)
      if (data?.invoiceUrl) {
        window.location.href = data.invoiceUrl
      } else {
        navigate("/pendana/contributions")
      }
    },
  })

  const validateAmount = () => {
    setAmountError("")
    if (numericAmount < 10000) {
      setAmountError("Kontribusi minimal Rp10.000.")
      return false
    }
    // Doc 4 Sec 29: Contribution cannot exceed remaining target
    if (numericAmount > remainingAmount) {
      setAmountError(`Kontribusi melebihi sisa target. Maksimum: ${formatRupiah(remainingAmount)}.`)
      return false
    }
    return true
  }

  const handleNext = () => {
    if (validateAmount()) setStep("review")
  }

  const handleBack = () => {
    setStep("enter")
    contributeMutation.reset()
  }

  const handleClose = () => {
    setStep("enter")
    setAmount("")
    setSelectedNatura(null)
    setAmountError("")
    contributeMutation.reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Danai Proyek"
      size="md"
      footer={
        step === "enter" ? (
          <>
            <Button variant="tertiary" onClick={handleClose}>Batal</Button>
            <Button variant="primary" onClick={handleNext}>Lanjutkan</Button>
          </>
        ) : (
          <>
            <Button variant="tertiary" onClick={handleBack}>Kembali</Button>
            <Button
              variant="primary"
              onClick={() => contributeMutation.mutate()}
              isLoading={contributeMutation.isPending}
            >
              Konfirmasi & Bayar
            </Button>
          </>
        )
      }
    >
      {step === "enter" ? (
        <div className="flex flex-col gap-5">
          {/* Remaining target (Doc 4 Sec 29) */}
          <div className="p-3 bg-[var(--color-primary-50)] rounded-[var(--radius-m)] border border-[var(--color-primary-100)]">
            <p className="text-[var(--text-caption)] text-[var(--color-primary-600)]">Sisa Target Pendanaan</p>
            <p className="text-[var(--text-h4)] font-[700] text-[var(--color-primary-700)]">
              {formatRupiah(remainingAmount)}
            </p>
          </div>

          <Input
            label="Jumlah Kontribusi"
            required
            helperText="Minimal Rp10.000. Tidak boleh melebihi sisa target."
            error={amountError}
            value={amount}
            onChange={(e) => {
              // Format as number input
              const val = e.target.value.replace(/\D/g, "")
              setAmount(val)
              setAmountError("")
            }}
            placeholder="Contoh: 500000"
          />

          {/* Natura selection */}
          {project.naturaPackages && project.naturaPackages.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[var(--text-label)] font-[500] text-[var(--color-neutral-700)]">
                Pilih Paket Natura (Opsional)
              </p>
              <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
                Natura adalah kompensasi produk pertanian — bukan bunga atau dividen.
              </p>
              <button
                onClick={() => setSelectedNatura(null)}
                className={`text-left p-3 rounded-[var(--radius-m)] border transition-colors ${!selectedNatura
                  ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)]"
                  : "border-[var(--color-neutral-200)] hover:border-[var(--color-neutral-300)]"
                  }`}
              >
                <p className="text-[var(--text-body-s)] font-[500] text-[var(--color-neutral-700)]">
                  Tidak memilih Natura
                </p>
              </button>
              {project.naturaPackages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedNatura(pkg.id)}
                  className={`text-left p-3 rounded-[var(--radius-m)] border transition-colors ${selectedNatura === pkg.id
                    ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)]"
                    : "border-[var(--color-neutral-200)] hover:border-[var(--color-neutral-300)]"
                    }`}
                >
                  <p className="text-[var(--text-body-s)] font-[600]">{pkg.name}</p>
                  <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">{pkg.description}</p>
                  <p className="text-[var(--text-caption)] text-[var(--color-primary-600)] mt-1">Min. {formatRupiah(pkg.amount)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Step 2: Review — Doc 4 Sec 31 */
        <div className="flex flex-col gap-4">
          <Alert variant="info">
            Mohon periksa kembali detail kontribusi Anda sebelum melakukan pembayaran.
          </Alert>

          {/* Review breakdown (Doc 4 Sec 31) */}
          <div className="flex flex-col gap-2 bg-[var(--color-neutral-50)] rounded-[var(--radius-m)] p-4 border border-[var(--color-neutral-100)]">
            <ReviewRow label="Kontribusi" value={formatRupiah(numericAmount)} />
            {selectedNatura && project.naturaPackages && (
              <ReviewRow
                label="Paket Natura"
                value={project.naturaPackages.find(p => p.id === selectedNatura)?.name ?? "-"}
              />
            )}
            {!selectedNatura && <ReviewRow label="Natura" value="Tidak dipilih" />}
            <ReviewRow label="Biaya Layanan (2.5%)" value={formatRupiah(processingFee)} />
            <div className="border-t border-[var(--color-neutral-200)] pt-2 mt-1">
              <ReviewRow label="Total Pembayaran" value={formatRupiah(totalPayment)} bold />
            </div>
          </div>

          {/* Cancellation / refund information (Doc 4 Sec 31) */}
          <Alert variant="warning" title="Informasi Pembatalan">
            Setelah pembayaran terkonfirmasi, kontribusi tidak dapat dibatalkan secara sepihak.
            Pengembalian dana hanya mungkin dilakukan sesuai ketentuan Recovery & Refund platform.
          </Alert>

          {contributeMutation.isError && (
            <Alert variant="error">
              Gagal memproses kontribusi. Silakan coba lagi.
            </Alert>
          )}
        </div>
      )}
    </Modal>
  )
}

function ReviewRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-[var(--text-body-s)] ${bold ? "font-[700] text-[var(--color-neutral-900)]" : "text-[var(--color-neutral-600)]"}`}>
        {label}
      </span>
      <span className={`text-[var(--text-body-s)] ${bold ? "font-[700] text-[var(--color-primary-700)]" : "font-[500] text-[var(--color-neutral-900)]"}`}>
        {value}
      </span>
    </div>
  )
}
