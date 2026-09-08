import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import api from "../../../../lib/axios"
import type { Project } from "../../../../types"
import { formatRupiah, toFiniteNumber } from "../../../../components/business/FinancialSummary"
import { Modal } from "../../../../components/ui/Modal"
import { Button } from "../../../../components/ui/Button"
import { Input } from "../../../../components/ui/Input"
import { Alert } from "../../../../components/ui/Alert"

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

export function ContributeModal({
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

  const remainingAmount = Math.max(0, toFiniteNumber(project.targetAmount) - toFiniteNumber(project.fundedAmount))
  const numericAmount = Number(amount.replace(/\D/g, ""))
  const processingFee = Math.round(numericAmount * 0.025) // 2.5% processing fee
  const totalPayment = numericAmount + processingFee

  const contributeMutation = useMutation({
    mutationFn: () => api.post(`/finance/projects/${project.id}/contribute`, {
      amount: numericAmount,
      naturaPackageId: selectedNatura ?? undefined,
    }),
    onSuccess: (data: any) => {
      const redirectUrl = data?.paymentUrl || data?.invoiceUrl
      if (redirectUrl) {
        window.location.href = redirectUrl
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
    if (selectedNatura && project.naturaPackages) {
      const selectedPkg = project.naturaPackages.find(p => p.id === selectedNatura)
      if (selectedPkg && numericAmount < toFiniteNumber(selectedPkg.amount)) {
        setAmountError(`Kontribusi minimal untuk paket ini adalah ${formatRupiah(selectedPkg.amount)}.`)
        return false
      }
    }
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
              const val = e.target.value.replace(/\D/g, "")
              setAmount(val)
              setAmountError("")
            }}
            placeholder="Contoh: 500000"
          />

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
        <div className="flex flex-col gap-4">
          <Alert variant="info">
            Mohon periksa kembali detail kontribusi Anda sebelum melakukan pembayaran.
          </Alert>

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
