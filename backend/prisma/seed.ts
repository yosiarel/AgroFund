import { PrismaClient, Role, ProjectStatus, GuaranteeStatus, AssessmentStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Menjalankan proses seeding data SUPER komprehensif...');
  
  // Hapus data lama agar bersih (Cascade delete)
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User", "Project", "Contribution", "Assessment", "NaturaPackage", "ProcurementRequest", "ProcurementItem", "GuaranteeTransaction", "Incident", "Milestone", "ProgressReport", "ProjectFinancialLedger", "FinancialTransaction", "SupplierRecord", "PurchaseOrder", "Evidence" CASCADE;`);

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // ==========================================
  // 1. SEED USERS (Lebih banyak akun)
  // ==========================================
  const admin = await prisma.user.create({ data: { name: 'Super Admin', username: 'admin', password: adminPassword, role: Role.AGROFUND } });
  
  const koperasi = await prisma.user.create({ data: { name: 'KUD Makmur Sejahtera', username: 'kop_makmur', password: userPassword, role: Role.KOPERASI } });
  const koperasi2 = await prisma.user.create({ data: { name: 'Koperasi Nelayan Jaya', username: 'kop_jaya', password: userPassword, role: Role.KOPERASI } });
  
  const umkmBudi = await prisma.user.create({ data: { name: 'Budi (Petani)', username: 'budi', password: userPassword, role: Role.UMKM } });
  const umkmSanto = await prisma.user.create({ data: { name: 'Santo (Nelayan)', username: 'santo', password: userPassword, role: Role.UMKM } });
  
  const pendanaSultan = await prisma.user.create({ data: { name: 'Sultan Investor', username: 'sultan', password: userPassword, role: Role.PENDANA } });
  const pendanaDermawan = await prisma.user.create({ data: { name: 'Ibu Dermawan', username: 'dermawan', password: userPassword, role: Role.PENDANA } });

  console.log('✅ Users berhasil dibuat (Admin, 2 Koperasi, 2 UMKM, 2 Pendana)');

  // Base financial template to avoid repetition
  const baseFinance = {
    basicProcurementCapital: 50000000n,
    priceReserve: 5000000n,
    cooperativeFeeProvision: 1000000n,
    agrofundServiceFee: 1000000n,
    naturaCost: 2000000n,
    mandatoryTaxes: 1000000n,
    targetAmount: 60000000n,
    guaranteeAmount: 3000000n,
  };

  // ==========================================
  // 2. SEED PROJECTS UNTUK SEMUA STATUS (11 Status)
  // ==========================================
  
  // 1. DRAFT (Baru diisi form)
  await prisma.project.create({
    data: {
      userId: umkmBudi.id, koperasiId: koperasi.id,
      title: 'Kebun Cabai', description: 'Deskripsi Kebun Cabai',
      ...baseFinance, status: ProjectStatus.DRAFT
    }
  });

  // 2. COOPERATIVE_ASSESSMENT (Menunggu disurvei Koperasi)
  const projAssesment = await prisma.project.create({
    data: {
      userId: umkmSanto.id, koperasiId: koperasi2.id,
      title: 'Budidaya Rumput Laut', description: 'Menunggu survei',
      ...baseFinance, status: ProjectStatus.COOPERATIVE_ASSESSMENT
    }
  });
  await prisma.assessment.create({
    data: { projectId: projAssesment.id, type: 'COOPERATIVE', assessorId: koperasi2.id, status: AssessmentStatus.PENDING }
  });

  // 3. PUBLICATION_REVIEW (Disetujui Koperasi, dicek Admin Agrofund)
  const projPubReview = await prisma.project.create({
    data: {
      userId: umkmBudi.id, koperasiId: koperasi.id,
      title: 'Peternakan Ayam', description: 'Menunggu admin',
      ...baseFinance, status: ProjectStatus.PUBLICATION_REVIEW
    }
  });
  await prisma.assessment.create({
    data: { projectId: projPubReview.id, type: 'COOPERATIVE', assessorId: koperasi.id, status: AssessmentStatus.APPROVED, notes: 'Layak didanai' }
  });

  // 4. GUARANTEE_PLACEMENT (Disetujui Admin, nunggu UMKM bayar Jaminan)
  await prisma.project.create({
    data: {
      userId: umkmSanto.id, koperasiId: koperasi2.id,
      title: 'Tambak Udang', description: 'Menunggu jaminan',
      ...baseFinance, status: ProjectStatus.GUARANTEE_PLACEMENT,
      guaranteeStatus: GuaranteeStatus.PENDING_PAYMENT
    }
  });

  // 5. FUNDRAISING (Sedang cari dana, ada pendanaan parsial)
  const projFundraising = await prisma.project.create({
    data: {
      userId: umkmBudi.id, koperasiId: koperasi.id,
      title: 'Melon Hidroponik', description: 'Sedang cari dana di etalase',
      ...baseFinance, status: ProjectStatus.FUNDRAISING, guaranteeStatus: GuaranteeStatus.HELD,
      fundedAmount: 20000000n, publishedAt: new Date(), fundraisingDeadline: new Date(Date.now() + 30 * 86400000)
    }
  });
  await prisma.contribution.create({ data: { projectId: projFundraising.id, investorId: pendanaSultan.id, amount: 20000000n, processingFee: 4000n, totalPayment: 20004000n, status: 'SUCCESS' } });

  // 6. DANA_TERPENUHI (Target dana sudah 100%)
  const projTerpenuhi = await prisma.project.create({
    data: {
      userId: umkmSanto.id, koperasiId: koperasi2.id,
      title: 'Budidaya Kerapu', description: 'Dana 100% kumpul',
      ...baseFinance, status: ProjectStatus.DANA_TERPENUHI, guaranteeStatus: GuaranteeStatus.HELD,
      fundedAmount: 60000000n, fundingCompletedAt: new Date(), fundraisingDeadline: new Date(Date.now() + 15 * 86400000)
    }
  });
  await prisma.contribution.create({ data: { projectId: projTerpenuhi.id, investorId: pendanaDermawan.id, amount: 60000000n, processingFee: 4000n, totalPayment: 60004000n, status: 'SUCCESS' } });

  // 7. PROCUREMENT (Proses belanja barang)
  const projProcurement = await prisma.project.create({
    data: {
      userId: umkmSanto.id, koperasiId: koperasi2.id,
      title: 'Pabrik Es Mini', description: 'Sedang PO barang',
      ...baseFinance, status: ProjectStatus.PROCUREMENT, guaranteeStatus: GuaranteeStatus.HELD,
      fundedAmount: 60000000n, fundingCompletedAt: new Date(Date.now() - 5 * 86400000), fundraisingDeadline: new Date(Date.now() - 5 * 86400000)
    }
  });
  await prisma.contribution.create({ data: { projectId: projProcurement.id, investorId: pendanaSultan.id, amount: 60000000n, processingFee: 4000n, totalPayment: 60004000n, status: 'SUCCESS' } });
  
  const supplier = await prisma.supplierRecord.create({ data: { name: 'Toko Mesin Nelayan' } });
  const procReq = await prisma.procurementRequest.create({ data: { projectId: projProcurement.id, status: 'PO_ISSUED', supplierId: supplier.id } });
  await prisma.purchaseOrder.create({ data: { procurementRequestId: procReq.id, supplierId: supplier.id, quotedTotal: 50000000n, status: 'VALID' } });

  // 8. EXECUTION (Pengerjaan Proyek / Progress)
  const projExecution = await prisma.project.create({
    data: {
      userId: umkmBudi.id, koperasiId: koperasi.id,
      title: 'Panen Padi', description: 'Proyek sedang berjalan di lapangan',
      ...baseFinance, status: ProjectStatus.EXECUTION, guaranteeStatus: GuaranteeStatus.HELD,
      fundedAmount: 60000000n, executionStartedAt: new Date(Date.now() - 20 * 86400000)
    }
  });
  await prisma.contribution.create({ data: { projectId: projExecution.id, investorId: pendanaDermawan.id, amount: 60000000n, processingFee: 4000n, totalPayment: 60004000n, status: 'SUCCESS' } });
  const milestone = await prisma.milestone.create({ data: { projectId: projExecution.id, name: 'Bulan 1', status: 'IN_PROGRESS' } });
  await prisma.progressReport.create({ data: { milestoneId: milestone.id, progressPercentage: 50, description: 'Tumbuh baik', status: 'VALIDATED' } });

  // 9. NATURA_FULFILLMENT (Pengiriman / Klaim Hasil Panen)
  const projNatura = await prisma.project.create({
    data: {
      userId: umkmSanto.id, koperasiId: koperasi2.id,
      title: 'Pengeringan Ikan', description: 'Proyek beres, natura siap dikirim',
      ...baseFinance, status: ProjectStatus.NATURA_FULFILLMENT, guaranteeStatus: GuaranteeStatus.HELD,
      fundedAmount: 60000000n, outputAvailableAt: new Date()
    }
  });
  const pkg = await prisma.naturaPackage.create({ data: { projectId: projNatura.id, name: 'Paket Ikan Asin 5Kg', description: 'Ikan asin premium', amount: 500000n } });
  await prisma.contribution.create({ data: { projectId: projNatura.id, investorId: pendanaSultan.id, amount: 60000000n, processingFee: 4000n, totalPayment: 60004000n, status: 'SUCCESS', naturaPackageId: pkg.id } });

  // 10. SUKSES_DITUTUP (Semua Selesai, Jaminan Dikembalikan)
  const projSukses = await prisma.project.create({
    data: {
      userId: umkmBudi.id, koperasiId: koperasi.id,
      title: 'Ternak Lele', description: 'Proyek sukses sempurna',
      ...baseFinance, status: ProjectStatus.SUKSES_DITUTUP, guaranteeStatus: GuaranteeStatus.RETURNED,
      fundedAmount: 60000000n
    }
  });
  await prisma.contribution.create({ data: { projectId: projSukses.id, investorId: pendanaDermawan.id, amount: 60000000n, processingFee: 4000n, totalPayment: 60004000n, status: 'SUCCESS' } });

  // 11. GAGAL_DITUTUP (Proyek hancur / Badai / Gagal)
  const projGagal = await prisma.project.create({
    data: {
      userId: umkmSanto.id, koperasiId: koperasi2.id,
      title: 'Keramba Jaring Apung', description: 'Kena badai el nino', failedReason: 'Bencana Alam',
      ...baseFinance, status: ProjectStatus.GAGAL_DITUTUP, guaranteeStatus: GuaranteeStatus.USED,
      fundedAmount: 60000000n
    }
  });
  await prisma.contribution.create({ data: { projectId: projGagal.id, investorId: pendanaSultan.id, amount: 60000000n, processingFee: 4000n, totalPayment: 60004000n, status: 'SUCCESS' } });
  await prisma.incident.create({ data: { projectId: projGagal.id, category: 'FORCE_MAJEURE', severity: 'HIGH', description: 'Hancur karena badai', status: 'RESOLVED', decision: 'Gagal Total' } });

  console.log('✅ 11 Proyek berhasil dibuat mencakup SELURUH 11 STATUS SIKLUS PROYEK (Dari Draft hingga Sukses/Gagal)');
  console.log('✅ Kontribusi, Milestone, Incident, Assessment, PO sudah disisipkan sebagai contoh');
  console.log('🎉 Seeding SUPER komprehensif selesai! Data siap uji coba UI sepenuhnya!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
