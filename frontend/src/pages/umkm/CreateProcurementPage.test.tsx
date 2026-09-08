import { describe, it, expect } from "vitest"
import {
  parseCurrencyInput,
  formatCurrencyDisplay,
  calculateItemSubtotal,
  buildProcurementPayload,
} from "./CreateProcurementPage"

describe("CreateProcurementPage - Currency Input Parsing & Payload Tests", () => {
  it("1. should parse unformatted integer input '40000' to numeric 40000", () => {
    const result = parseCurrencyInput("40000")
    expect(result).toBe(40000)
  })

  it("2. should parse Indonesian formatted currency '40.000' to numeric 40000", () => {
    const result = parseCurrencyInput("40.000")
    expect(result).toBe(40000)
  })

  it("should parse currency with 'Rp' prefix and dots 'Rp 40.000' to numeric 40000", () => {
    const result = parseCurrencyInput("Rp 40.000")
    expect(result).toBe(40000)
  })

  it("should parse comma separated currency '40,000' to numeric 40000", () => {
    const result = parseCurrencyInput("40,000")
    expect(result).toBe(40000)
  })

  it("3. should parse empty input '' to numeric 0", () => {
    const result = parseCurrencyInput("")
    expect(result).toBe(0)
  })

  it("should format display value correctly with id-ID locale", () => {
    expect(formatCurrencyDisplay(40000)).toBe("40.000")
    expect(formatCurrencyDisplay(1000000)).toBe("1.000.000")
    expect(formatCurrencyDisplay(0)).toBe("")
  })

  it("4. should calculate correct subtotal for quantity 1 + price 40000 = 40000", () => {
    const subtotal = calculateItemSubtotal(1, 40000)
    expect(subtotal).toBe(40000)
  })

  it("should calculate correct subtotal for multiple quantity and price", () => {
    const subtotal = calculateItemSubtotal(5, 40000)
    expect(subtotal).toBe(200000)
  })

  it("5. should build API payload containing estimatedUnitPrice: 40000", () => {
    const items = [
      {
        name: "Pakan Ikan",
        quantity: 1,
        unit: "kg",
        estimatedUnitPrice: 40000,
      },
    ]

    const payload = buildProcurementPayload(
      items,
      "Catatan pengadaan pakan",
      "existing",
      "supp-123"
    )

    expect(payload.items).toHaveLength(1)
    expect(payload.items[0]).toEqual({
      name: "Pakan Ikan",
      quantity: 1,
      estimatedUnitPrice: 40000,
    })
    expect(payload.notes).toBe("Catatan pengadaan pakan")
    expect(payload.supplierId).toBe("supp-123")
  })

  it("should build API payload with nominated supplier", () => {
    const items = [
      {
        name: "Bibit Lele",
        quantity: 100,
        unit: "ekor",
        estimatedUnitPrice: 500,
      },
    ]

    const nominatedSupplier = {
      name: "UD Tani Sejahtera",
      contactInfo: "081234567890",
      bankName: "BRI",
      bankAccountNumber: "123456789",
    }

    const payload = buildProcurementPayload(
      items,
      undefined,
      "nominate",
      undefined,
      nominatedSupplier
    )

    expect(payload.items[0].estimatedUnitPrice).toBe(500)
    expect(payload.supplierId).toBeUndefined()
    expect(payload.nominatedSupplier).toEqual(nominatedSupplier)
  })
})
