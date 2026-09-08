import { describe, it, expect } from "vitest"
import { getNextAction } from "./ProjectDetailPage"
import type { Project } from "../../types"

const mockProject = (status: any): Project => ({
  id: "proj-test-123",
  title: "Test Hydroponic Project",
  description: "Test description",
  status,
  targetAmount: 50000000,
  fundedAmount: 0,
  basicProcurementCapital: 40000000,
  priceReserve: 4000000,
  naturaCost: 2000000,
  guaranteeAmount: 2000000,
  createdAt: new Date().toISOString(),
  user: { id: "user-umkm-1", name: "Budi", username: "budi" },
  koperasi: { id: "user-koperasi-1", name: "Koperasi Makmur", username: "kop_makmur" },
  koperasiId: "user-koperasi-1",
})

describe("ProjectDetailPage - BUG-UMKM-002 Regression Tests", () => {
  it("should return REQUEST_ASSESSMENT actionType for DRAFT projects instead of dummy href link", () => {
    const project = mockProject("DRAFT")
    const action = getNextAction(project)

    expect(action).not.toBeNull()
    expect(action?.title).toBe("Draf Proyek Siap")
    expect(action?.ctaLabel).toBe("Ajukan Penilaian")
    expect(action?.actionType).toBe("REQUEST_ASSESSMENT")
    expect(action?.href).toBeUndefined()
    expect(action?.primary).toBe(true)
  })

  it("should return informative status without interactive button for COOPERATIVE_ASSESSMENT", () => {
    const project = mockProject("COOPERATIVE_ASSESSMENT")
    const action = getNextAction(project)

    expect(action).not.toBeNull()
    expect(action?.title).toBe("Penilaian Koperasi")
    expect(action?.actionType).toBeUndefined()
    expect(action?.href).toBeUndefined()
  })

  it("should return navigation action for GUARANTEE_PLACEMENT", () => {
    const project = mockProject("GUARANTEE_PLACEMENT")
    const action = getNextAction(project)

    expect(action).not.toBeNull()
    expect(action?.ctaLabel).toBe("Bayar Guarantee")
    expect(action?.href).toBe("/umkm/projects/proj-test-123/guarantee")
    expect(action?.actionType).toBeUndefined()
  })

  it("should return navigation action for DANA_TERPENUHI", () => {
    const project = mockProject("DANA_TERPENUHI")
    const action = getNextAction(project)

    expect(action).not.toBeNull()
    expect(action?.ctaLabel).toBe("Buat Pengadaan")
    expect(action?.href).toBe("/umkm/projects/proj-test-123/procurement/create")
  })
})
