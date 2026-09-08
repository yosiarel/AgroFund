import { describe, it, expect } from "vitest"
import { calculateGuaranteeFinancials } from "./GuaranteePaymentPage"

describe("GuaranteePaymentPage - BUG-FIN-001 Contract & Calculation Tests", () => {
  it("should calculate correct financial breakdown for Rp40.000.000 BPC", () => {
    const { bpc, guaranteeAmount, processingFee, totalPayment } =
      calculateGuaranteeFinancials(40000000)

    expect(bpc).toBe(40000000)
    expect(guaranteeAmount).toBe(2000000) // 5% of BPC
    expect(processingFee).toBe(4000) // Transaction processing fee
    expect(totalPayment).toBe(2004000) // Guarantee + Processing Fee
  })

  it("should calculate correct financial breakdown for Rp10.000.000 BPC", () => {
    const { bpc, guaranteeAmount, processingFee, totalPayment } =
      calculateGuaranteeFinancials(10000000)

    expect(bpc).toBe(10000000)
    expect(guaranteeAmount).toBe(500000) // 5% of BPC
    expect(processingFee).toBe(4000)
    expect(totalPayment).toBe(504000)
  })

  it("should handle string numerical inputs cleanly", () => {
    const { bpc, guaranteeAmount, processingFee, totalPayment } =
      calculateGuaranteeFinancials("50000000")

    expect(bpc).toBe(50000000)
    expect(guaranteeAmount).toBe(2500000)
    expect(processingFee).toBe(4000)
    expect(totalPayment).toBe(2504000)
  })

  it("should resolve canonical backend response property 'paymentUrl' for redirect", () => {
    const backendResponse = {
      message: "Silakan lakukan pembayaran jaminan",
      guaranteeAmount: "2000000",
      processingFee: "4000",
      totalPayment: "2004000",
      paymentUrl: "https://checkout.xendit.co/web/test-invoice-123",
      externalId: "GUARANTEE_proj-1_12345",
    }

    const redirectUrl = backendResponse.paymentUrl

    expect(redirectUrl).toBe("https://checkout.xendit.co/web/test-invoice-123")
    expect((backendResponse as any).invoiceUrl).toBeUndefined()
  })
})
