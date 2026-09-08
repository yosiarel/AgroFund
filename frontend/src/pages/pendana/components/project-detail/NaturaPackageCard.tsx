import type { NaturaPackage } from "../../../../types"
import { formatRupiah } from "../../../../components/business/FinancialSummary"

export function NaturaPackageCard({ pkg }: { pkg: NaturaPackage }) {
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
