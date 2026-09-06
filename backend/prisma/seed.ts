import { PrismaClient, Role, ProjectStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Menjalankan proses seeding data...');
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@AkarMakmur2026!';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // 1. Seed Admin (AgroFund)
  let admin = await prisma.user.findFirst({ where: { username: 'admin' } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: 'Super Admin AgroFund',
        username: 'admin',
        password: hashedPassword,
        role: Role.AGROFUND,
      }
    });
    console.log('✅ Admin berhasil ditambahkan');
  }

  // 2. Seed Koperasi
  let koperasiUser = await prisma.user.findFirst({ where: { username: 'koperasi_makmur' } });
  if (!koperasiUser) {
    koperasiUser = await prisma.user.create({
      data: {
        name: 'KUD Makmur Sejahtera',
        username: 'koperasi_makmur',
        password: hashedPassword,
        role: Role.KOPERASI,
        address: 'Jl. Pertanian No. 1, Desa Subur',
      }
    });
    console.log('✅ Koperasi berhasil ditambahkan');
  }

  // 3. Seed UMKM (Petani)
  let umkmUser = await prisma.user.findFirst({ where: { username: 'petani_budi' } });
  if (!umkmUser) {
    umkmUser = await prisma.user.create({
      data: {
        name: 'Budi Santoso',
        username: 'petani_budi',
        password: hashedPassword,
        role: Role.UMKM,
      }
    });
    console.log('✅ UMKM (Petani) berhasil ditambahkan');
  }

  // 4. Seed Pendana (Investor)
  let pendanaUser = await prisma.user.findFirst({ where: { username: 'pendana_sultan' } });
  if (!pendanaUser) {
    pendanaUser = await prisma.user.create({
      data: {
        name: 'Sultan Investor',
        username: 'pendana_sultan',
        password: hashedPassword,
        role: Role.PENDANA,
      }
    });
    console.log('✅ Pendana (Investor) berhasil ditambahkan');
  }

  // 5. Opsi Tambahan: Seed 1 Proyek Draf untuk UMKM (Budi) agar bisa langsung dites Frontend
  const existingProject = await prisma.project.findFirst({ where: { userId: umkmUser.id } });
  if (!existingProject && koperasiUser && koperasiUser.role === Role.KOPERASI) {
    await prisma.project.create({
      data: {
        userId: umkmUser.id,
        koperasiId: koperasiUser.id,
        title: 'Kebun Cabai Hibrida Desa Subur',
        description: 'Pemberdayaan lahan kosong menjadi kebun cabai produktif.',
        basicProcurementCapital: 10000000,
        priceReserve: 1000000,
        naturaCost: 500000,
        cooperativeFeeProvision: 275000,
        agrofundServiceFee: 250000,
        mandatoryTaxes: 0,
        targetAmount: 12025000,
        guaranteeAmount: 500000,
        status: ProjectStatus.DRAFT
      }
    });
    console.log('✅ Proyek (Draft) berhasil ditambahkan untuk Petani Budi');
  }

  console.log('🎉 Seeding selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
