import { describe, it, expect } from "vitest"
import { getCardActions, getNextAction } from "./MyProjectsPage"
import type { Project } from "../../types"

const baseProject: Project = {
  id: "b260beaa-dc6b-4a40-bd5e-9655ee90f2b9",
  user: { id: "user-budi", name: "Budi", username: "budi" },
  title: "aacas",
  description: "Deskripsi proyek",
  basicProcurementCapital: 40000000,
  priceReserve: 0,
  naturaCost: 0,
  targetAmount: 48100000,
  fundedAmount: 48100000,
  status: "PROCUREMENT",
  guaranteeAmount: 2000000,
  createdAt: "2026-09-08T00:00:00Z",
}

describe("MyProjectsPage - Action Buttons & Navigation Invariant Tests", () => {
  it("1. should expose BOTH 'Lihat Detail' and 'Lihat Pengadaan' for PROCUREMENT project", () => {
    const actions = getCardActions({ ...baseProject, status: "PROCUREMENT" })

    expect(actions.detailLabel).toBe("Lihat Detail")
    expect(actions.detailHref).toBe(`/umkm/projects/${baseProject.id}`)
    expect(actions.detailVariant).toBe("secondary")

    expect(actions.contextualAction).toBeDefined()
    expect(actions.contextualAction?.ctaLabel).toBe("Lihat Pengadaan")
    expect(actions.contextualAction?.href).toBe(`/umkm/projects/${baseProject.id}/procurement`)
    expect(actions.contextualAction?.variant).toBe("primary")
  })

  it("2. should expose BOTH 'Lihat Detail' and 'Lapor Progres' for EXECUTION project", () => {
    const actions = getCardActions({ ...baseProject, status: "EXECUTION" })

    expect(actions.detailLabel).toBe("Lihat Detail")
    expect(actions.detailHref).toBe(`/umkm/projects/${baseProject.id}`)
    expect(actions.detailVariant).toBe("secondary")

    expect(actions.contextualAction).toBeDefined()
    expect(actions.contextualAction?.ctaLabel).toBe("Lapor Progres")
    expect(actions.contextualAction?.href).toBe(`/umkm/projects/${baseProject.id}/execution`)
  })

  it("3. should expose BOTH 'Lihat Detail' and 'Bayar Guarantee' for GUARANTEE_PLACEMENT project", () => {
    const actions = getCardActions({
      ...baseProject,
      status: "GUARANTEE_PLACEMENT",
    })

    expect(actions.detailLabel).toBe("Lihat Detail")
    expect(actions.detailHref).toBe(`/umkm/projects/${baseProject.id}`)
    expect(actions.detailVariant).toBe("secondary")

    expect(actions.contextualAction).toBeDefined()
    expect(actions.contextualAction?.ctaLabel).toBe("Bayar Guarantee")
    expect(actions.contextualAction?.href).toBe(`/umkm/projects/${baseProject.id}/guarantee`)
  })

  it("4. should expose BOTH 'Lihat Detail' and 'Buat Procurement' for DANA_TERPENUHI project", () => {
    const actions = getCardActions({ ...baseProject, status: "DANA_TERPENUHI" })

    expect(actions.detailLabel).toBe("Lihat Detail")
    expect(actions.detailHref).toBe(`/umkm/projects/${baseProject.id}`)
    expect(actions.detailVariant).toBe("secondary")

    expect(actions.contextualAction).toBeDefined()
    expect(actions.contextualAction?.ctaLabel).toBe("Buat Procurement")
    expect(actions.contextualAction?.href).toBe(`/umkm/projects/${baseProject.id}/procurement/create`)
  })

  it("5. should expose 'Lihat Detail' for FUNDRAISING project", () => {
    const actions = getCardActions({ ...baseProject, status: "FUNDRAISING" })

    expect(actions.detailLabel).toBe("Lihat Detail")
    expect(actions.detailHref).toBe(`/umkm/projects/${baseProject.id}`)
    expect(actions.detailVariant).toBe("primary")
    expect(actions.contextualAction).toBeUndefined()
  })

  it("6. should expose 'Lihat Detail' for COOPERATIVE_ASSESSMENT and PUBLICATION_REVIEW", () => {
    const actionsCoop = getCardActions({ ...baseProject, status: "COOPERATIVE_ASSESSMENT" })
    expect(actionsCoop.detailLabel).toBe("Lihat Detail")
    expect(actionsCoop.detailHref).toBe(`/umkm/projects/${baseProject.id}`)
    expect(actionsCoop.detailVariant).toBe("primary")

    const actionsPub = getCardActions({ ...baseProject, status: "PUBLICATION_REVIEW" })
    expect(actionsPub.detailLabel).toBe("Lihat Detail")
    expect(actionsPub.detailHref).toBe(`/umkm/projects/${baseProject.id}`)
    expect(actionsPub.detailVariant).toBe("primary")
  })

  it("7. should expose 'Lihat Detail' for closed projects (SUKSES_DITUTUP and GAGAL_DITUTUP)", () => {
    const actionsSuccess = getCardActions({ ...baseProject, status: "SUKSES_DITUTUP" })
    expect(actionsSuccess.detailLabel).toBe("Lihat Detail")
    expect(actionsSuccess.detailHref).toBe(`/umkm/projects/${baseProject.id}`)
    expect(actionsSuccess.detailVariant).toBe("primary")
    expect(actionsSuccess.contextualAction).toBeUndefined()

    const actionsFailed = getCardActions({ ...baseProject, status: "GAGAL_DITUTUP" })
    expect(actionsFailed.detailLabel).toBe("Lihat Detail")
    expect(actionsFailed.detailHref).toBe(`/umkm/projects/${baseProject.id}`)
    expect(actionsFailed.detailVariant).toBe("primary")
  })

  it("8. should verify getNextAction returns expected contract per lifecycle stage", () => {
    expect(getNextAction({ ...baseProject, status: "PROCUREMENT" })?.ctaLabel).toBe("Lihat Pengadaan")
    expect(getNextAction({ ...baseProject, status: "EXECUTION" })?.ctaLabel).toBe("Lapor Progres")
    expect(getNextAction({ ...baseProject, status: "GUARANTEE_PLACEMENT" })?.ctaLabel).toBe("Bayar Guarantee")
    expect(getNextAction({ ...baseProject, status: "DANA_TERPENUHI" })?.ctaLabel).toBe("Buat Procurement")
    expect(getNextAction({ ...baseProject, status: "DRAFT" })?.ctaLabel).toBe("Ajukan Assessment")
  })
})
