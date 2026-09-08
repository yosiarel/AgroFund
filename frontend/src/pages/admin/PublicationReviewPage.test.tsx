import { describe, it, expect } from "vitest"
import { buildReviewProjectPayload } from "./PublicationReviewPage"

describe("PublicationReviewPage - BUG-ADMIN-001 Payload Contract Tests", () => {
  it("should generate a payload with 'status' and without 'decision' for APPROVED", () => {
    const payload = buildReviewProjectPayload("APPROVED", "dsds")

    expect(payload.status).toBe("APPROVED")
    expect(payload.notes).toBe("dsds")
    expect((payload as any).decision).toBeUndefined()
    expect(Object.keys(payload)).not.toContain("decision")
  })

  it("should generate a payload with 'status' and without 'decision' for NEEDS_CORRECTION", () => {
    const payload = buildReviewProjectPayload("NEEDS_CORRECTION", "Perlu perbaikan RAB")

    expect(payload.status).toBe("NEEDS_CORRECTION")
    expect(payload.notes).toBe("Perlu perbaikan RAB")
    expect((payload as any).decision).toBeUndefined()
  })

  it("should generate a payload with 'status' and without 'decision' for REJECTED", () => {
    const payload = buildReviewProjectPayload("REJECTED", "Tidak memenuhi standar risiko")

    expect(payload.status).toBe("REJECTED")
    expect(payload.notes).toBe("Tidak memenuhi standar risiko")
    expect((payload as any).decision).toBeUndefined()
  })

  it("should handle empty or whitespace notes cleanly", () => {
    const payload = buildReviewProjectPayload("APPROVED", "   ")

    expect(payload.status).toBe("APPROVED")
    expect(payload.notes).toBeUndefined()
  })
})
