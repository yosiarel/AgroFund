export function toFiniteNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback
  }
  if (typeof value === "bigint") {
    const num = Number(value)
    return Number.isFinite(num) ? num : fallback
  }
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (trimmed === "") return fallback
    const num = Number(trimmed)
    return Number.isFinite(num) ? num : fallback
  }
  return fallback
}

export function formatRupiah(amount: unknown): string {
  const num = toFiniteNumber(amount, 0)
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}
