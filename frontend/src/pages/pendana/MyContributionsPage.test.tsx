import { describe, it, expect } from "vitest"
import { getStatusConfig } from "./MyContributionsPage"

describe("MyContributionsPage - getStatusConfig", () => {
  it("should return valid configuration for PAID", () => {
    const config = getStatusConfig("PAID")
    expect(config.label).toBe("Berhasil")
    expect(config.variant).toBe("success")
    expect(config.Icon).toBeDefined()
  })

  it("should return valid configuration for PENDING_PAYMENT", () => {
    const config = getStatusConfig("PENDING_PAYMENT")
    expect(config.label).toBe("Menunggu Pembayaran")
    expect(config.variant).toBe("warning")
    expect(config.Icon).toBeDefined()
  })

  it("should return valid configuration for CANCELLED", () => {
    const config = getStatusConfig("CANCELLED")
    expect(config.label).toBe("Dibatalkan")
    expect(config.variant).toBe("error")
    expect(config.Icon).toBeDefined()
  })

  it("should return valid configuration for REFUNDED", () => {
    const config = getStatusConfig("REFUNDED")
    expect(config.label).toBe("Dikembalikan")
    expect(config.variant).toBe("info")
    expect(config.Icon).toBeDefined()
  })

  it("should safely handle legacy or uppercase PENDING status without crashing", () => {
    const config = getStatusConfig("PENDING")
    expect(config.label).toBe("Menunggu Pembayaran")
    expect(config.variant).toBe("warning")
    expect(config.Icon).toBeDefined()
  })

  it("should safely handle AWAITING_CONFIRMATION status without crashing", () => {
    const config = getStatusConfig("AWAITING_CONFIRMATION")
    expect(config.label).toBe("Menunggu Konfirmasi")
    expect(config.variant).toBe("warning")
    expect(config.Icon).toBeDefined()
  })

  it("should safely fallback when given an unknown or undefined status", () => {
    const configUnknown = getStatusConfig("UNKNOWN_STATUS_123")
    expect(configUnknown.Icon).toBeDefined()
    expect(configUnknown.label).toBe("UNKNOWN_STATUS_123")

    const configUndefined = getStatusConfig(undefined)
    expect(configUndefined.Icon).toBeDefined()
    expect(configUndefined.label).toBe("Menunggu Pembayaran")
  })
})
