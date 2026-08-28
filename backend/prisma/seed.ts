import { PrismaClient, Role, ProjectStatus, TransactionType } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🧹 Membersihkan database...');
  await prisma.transaction.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.project.deleteMany();
  await prisma.item.deleteMany();
  await prisma.topUp.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  console.log('🌱 Memulai proses seeding data demo...');

  // 1. Setup Password
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@AkarMakmur2026!';
  const defaultPassword = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash(adminPassword, 10);

  // 2. Buat Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      username: 'admin',
      password: adminHash,
      role: Role.ADMIN,
      wallet: { create: { balance: 0n, hold: 0n } }
    }
  });

  // 3. Buat UMKM (Petani/Pekebun)
  const umkm1 = await prisma.user.create({
    data: {
      name: 'Pak Sugeng (Petani Jagung)',
      username: 'petani1',
      password: defaultPassword,
      role: Role.UMKM,
      phone: '081234567890',
      address: 'Desa Suka Makmur, Jawa Tengah',
      wallet: { create: { balance: 5000000n, hold: 0n } }
    }
  });

  const umkm2 = await prisma.user.create({
    data: {
      name: 'Bu Siti (Peternak Ayam)',
      username: 'petani2',
      password: defaultPassword,
      role: Role.UMKM,
      phone: '081234567891',
      address: 'Desa Unggas Jaya, Jawa Barat',
      wallet: { create: { balance: 1500000n, hold: 0n } }
    }
  });

  const umkm3 = await prisma.user.create({
    data: {
      name: 'Pak Joko (Pekebun Sawit)',
      username: 'petani3',
      password: defaultPassword,
      role: Role.UMKM,
      phone: '081234567892',
      address: 'Pekanbaru, Riau',
      wallet: { create: { balance: 12000000n, hold: 0n } }
    }
  });

  const umkm4 = await prisma.user.create({
    data: {
      name: 'Bu Tini (Petani Sayur Organik)',
      username: 'petani4',
      password: defaultPassword,
      role: Role.UMKM,
      phone: '081234567893',
      address: 'Lembang, Jawa Barat',
      wallet: { create: { balance: 3500000n, hold: 0n } }
    }
  });

  // 4. Buat Investor
  const investor1 = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      username: 'investor1',
      password: defaultPassword,
      role: Role.INVESTOR,
      phone: '08111222333',
      address: 'Jakarta Selatan',
      wallet: { create: { balance: 25000000n, hold: 0n } }
    }
  });

  const investor2 = await prisma.user.create({
    data: {
      name: 'Siska Oktavia',
      username: 'investor2',
      password: defaultPassword,
      role: Role.INVESTOR,
      phone: '08111222444',
      address: 'Surabaya',
      wallet: { create: { balance: 10000000n, hold: 0n } }
    }
  });

  const investor3 = await prisma.user.create({
    data: {
      name: 'Arman Maulana',
      username: 'investor3',
      password: defaultPassword,
      role: Role.INVESTOR,
      phone: '08111222555',
      address: 'Bandung',
      wallet: { create: { balance: 50000000n, hold: 0n } }
    }
  });

  const investor4 = await prisma.user.create({
    data: {
      name: 'Dewi Lestari',
      username: 'investor4',
      password: defaultPassword,
      role: Role.INVESTOR,
      phone: '08111222666',
      address: 'Medan',
      wallet: { create: { balance: 3500000n, hold: 0n } }
    }
  });

  // 5. Buat Item Koperasi
  console.log('🛒 Membuat katalog koperasi...');
  const item1 = await prisma.item.create({
    data: {
      name: 'Pupuk Urea Premium 50kg',
      description: 'Pupuk urea berkualitas tinggi untuk meningkatkan hasil panen jagung dan padi.',
      price: 350000n,
      stock: 150,
      category: 'Pupuk',
      imageUrl: 'https://res.cloudinary.com/dznn7frej/image/upload/v1785312239/akarmakmur/pggr9bhkukuevbakircz.jpg'
    }
  });

  const item2 = await prisma.item.create({
    data: {
      name: 'Bibit Jagung Hibrida 5kg',
      description: 'Bibit jagung unggulan tahan hama, hasil panen melimpah.',
      price: 200000n,
      stock: 300,
      category: 'Bibit',
      imageUrl: 'https://res.cloudinary.com/dznn7frej/image/upload/v1785312200/akarmakmur/qrmxdcauvjqpu9onjt7o.jpg'
    }
  });

  const item3 = await prisma.item.create({
    data: {
      name: 'Traktor Mini Kubota',
      description: 'Traktor tangan mini untuk membajak sawah lahan sempit.',
      price: 15000000n,
      stock: 5,
      category: 'Alat',
      imageUrl: 'https://res.cloudinary.com/dznn7frej/image/upload/v1715873020/samples/ecommerce/accessories-bag.jpg' // dummy image
    }
  });

  const item4 = await prisma.item.create({
    data: {
      name: 'Pupuk NPK Mutiara 10kg',
      description: 'Pupuk majemuk lengkap untuk merangsang pertumbuhan akar, daun, dan buah.',
      price: 150000n,
      stock: 500,
      category: 'Pupuk',
      imageUrl: 'https://res.cloudinary.com/dznn7frej/image/upload/v1785310243/akarmakmur/yjlpob3ryqlxjcpmehdf.jpg'
    }
  });

  const item5 = await prisma.item.create({
    data: {
      name: 'Pestisida Organik Cair 1L',
      description: 'Membasmi hama tanpa merusak ekosistem dan ramah lingkungan.',
      price: 85000n,
      stock: 200,
      category: 'Obat',
      imageUrl: 'https://res.cloudinary.com/dznn7frej/image/upload/v1785310389/akarmakmur/kd1mdza890t3vcluq0dq.jpg'
    }
  });

  const item6 = await prisma.item.create({
    data: {
      name: 'Mesin Pompa Air Irigasi 3 Inch',
      description: 'Mesin sedot air bertenaga diesel untuk mengairi sawah tadah hujan.',
      price: 2500000n,
      stock: 10,
      category: 'Alat',
      imageUrl: 'https://res.cloudinary.com/dznn7frej/image/upload/v1785310230/akarmakmur/wt0cnpwdfxcmjeiox9t7.jpg'
    }
  });

  const item7 = await prisma.item.create({
    data: {
      name: 'Bibit Cabe Rawit Unggul (Isi 1000 biji)',
      description: 'Tahan virus gemini, hasil buah lebat dan pedas maksimal.',
      price: 120000n,
      stock: 50,
      category: 'Bibit',
      imageUrl: 'https://res.cloudinary.com/dznn7frej/image/upload/v1785310220/akarmakmur/yfszmznu3w1eaa6ybbop.jpg'
    }
  });

  const item8 = await prisma.item.create({
    data: {
      name: 'Cangkul Baja Asli',
      description: 'Cangkul baja kuat anti patah untuk mengolah tanah keras.',
      price: 135000n,
      stock: 120,
      category: 'Alat',
      imageUrl: 'https://res.cloudinary.com/dznn7frej/image/upload/v1785310100/akarmakmur/zr49tf8eiwqm3oe5owst.jpg'
    }
  });

  const item9 = await prisma.item.create({
    data: {
      name: 'Kandang besi ayam',
      description: 'Kandang besi kuat anti karat untuk ayam',
      price: 750000n,
      stock: 50,
      category: 'Alat',
      imageUrl: 'https://res.cloudinary.com/dznn7frej/image/upload/v1785311406/akarmakmur/eznytwysrgprfafiv3sl.jpg'
    }
  });

  const item10 = await prisma.item.create({
    data: {
      name: 'anak ayam petelur',
      description: 'anak ayam untuk dikembang biakkan',
      price: 50000n,
      stock: 100,
      category: 'Hewan Ternak',
      imageUrl: 'https://res.cloudinary.com/dznn7frej/image/upload/v1785311828/images_8_w29d3v.jpg'
    }
  })

  // 6. Buat Proyek
  console.log('🌾 Membuat proyek UMKM...');

  // Proyek 1: Sedang Funding (Baru mulai)
  const target1 = 5000000n;
  const markup1 = (target1 * 15n) / 100n;
  await prisma.project.create({
    data: {
      userId: umkm1.id,
      title: 'Perluasan Lahan Jagung Manis Pak Sugeng',
      description: 'Saya berencana memperluas lahan jagung manis seluas 1 hektar. Membutuhkan dana untuk bibit hibrida dan pupuk urea agar hasil maksimal.',
      targetAmount: target1,
      markupAmount: markup1,
      collectedAmount: 1000000n,
      status: ProjectStatus.FUNDING,
      imageUrl: 'https://res.cloudinary.com/dznn7frej/image/upload/v1785312167/akarmakmur/dfed8gk6jphkwpgudmvz.jpg',
      investments: {
        create: [
          {
            investorId: investor1.id,
            amount: 1000000n,
            rewardOptIn: true,
            status: 'SUCCESS'
          }
        ]
      }
    }
  });

  // Proyek 2: Sukses Terkumpul (Soft Cap tercapai)
  const target2 = 20000000n;
  const markup2 = (target2 * 15n) / 100n;
  await prisma.project.create({
    data: {
      userId: umkm2.id,
      title: 'Modernisasi Kandang Ayam Petelur',
      description: 'Kandang ayam saat ini sudah tua dan tingkat produksi menurun. Kami butuh dana untuk membeli material kandang baru dan vitamin unggas.',
      targetAmount: target2,
      markupAmount: markup2,
      collectedAmount: 20000000n,
      status: ProjectStatus.SUCCESS,
      imageUrl: 'https://res.cloudinary.com/dznn7frej/image/upload/v1785308476/jenis-kandang-ayam-1280x720_m8kqso.jpg',
      investments: {
        create: [
          {
            investorId: investor1.id,
            amount: 15000000n,
            rewardOptIn: true,
            status: 'RECEIVED',
            trackingResi: 'RESI-AYAM-001'
          },
          {
            investorId: investor2.id,
            amount: 5000000n,
            rewardOptIn: false, // Skip reward
            status: 'SUCCESS'
          }
        ]
      }
    }
  });

  // Proyek 3: Pending (Menunggu Approval)
  const target3 = 8000000n;
  const markup3 = (target3 * 15n) / 100n;
  await prisma.project.create({
    data: {
      userId: umkm1.id,
      title: 'Pengadaan Alat Panen Modern',
      description: 'Membeli alat panen modern untuk menekan angka kehilangan hasil panen saat musim hujan.',
      targetAmount: target3,
      markupAmount: markup3,
      collectedAmount: 0n,
      status: ProjectStatus.PENDING,
      imageUrl: 'https://res.cloudinary.com/dznn7frej/image/upload/v1785308475/images_4_jhwte0.jpg',
    }
  });

  // Proyek 4: Hampir Penuh (FUNDING)
  const target4 = 15000000n;
  const markup4 = (target4 * 15n) / 100n;
  await prisma.project.create({
    data: {
      userId: umkm2.id,
      title: 'Pembelian Pakan Konsentrat Ayam Pedaging',
      description: 'Membutuhkan tambahan modal untuk menyetok pakan ayam berkualitas tinggi agar bobot ayam cepat naik sebelum musim panen raya.',
      targetAmount: target4,
      markupAmount: markup4,
      collectedAmount: 13500000n, // Hampir penuh
      status: ProjectStatus.FUNDING,
      imageUrl: 'https://res.cloudinary.com/dznn7frej/image/upload/v1785309116/images_5_hd2uak.jpg',
      investments: {
        create: [
          {
            investorId: investor2.id,
            amount: 13500000n,
            rewardOptIn: true,
            status: 'SUCCESS'
          }
        ]
      }
    }
  });

  // Proyek 5: Gagal (FAILED - di bawah soft cap)
  const target5 = 10000000n;
  const markup5 = (target5 * 15n) / 100n;
  await prisma.project.create({
    data: {
      userId: umkm1.id,
      title: 'Pembuatan Sumur Bor Irigasi Ladang',
      description: 'Musim kemarau panjang membuat ladang kekeringan, butuh dana untuk membuat sumur bor.',
      targetAmount: target5,
      markupAmount: markup5,
      collectedAmount: 2000000n,
      status: ProjectStatus.FAILED,
      failedReason: 'Pembuatan sumur bor gagal karena alat berat tidak bisa masuk ke lahan akibat jalan longsor. Dana dikembalikan.',
      failedProofUrl: 'https://res.cloudinary.com/dznn7frej/image/upload/v1785405254/Screenshot_2026-07-30_165343_xykbck.png',
      imageUrl: 'https://res.cloudinary.com/dznn7frej/image/upload/v1785309302/images_6_ldr5kt.jpg',
      investments: {
        create: [
          {
            investorId: investor1.id,
            amount: 2000000n,
            rewardOptIn: true,
            status: 'REFUNDED'
          }
        ]
      }
    }
  });

  // Proyek 6: Sukses Penuh (FUNDED)
  const target6 = 12000000n;
  const markup6 = (target6 * 15n) / 100n;
  await prisma.project.create({
    data: {
      userId: umkm1.id,
      title: 'Budidaya Tomat Ceri Hidroponik',
      description: 'Mengembangkan sayap ke budidaya hidroponik tomat ceri yang memiliki nilai jual tinggi di supermarket modern.',
      targetAmount: target6,
      markupAmount: markup6,
      collectedAmount: 12000000n,
      status: ProjectStatus.FUNDED,
      imageUrl: 'https://res.cloudinary.com/dznn7frej/image/upload/v1785309301/images_7_ird5cf.jpg',
      investments: {
        create: [
          {
            investorId: investor2.id,
            amount: 12000000n,
            rewardOptIn: true,
            status: 'SUCCESS'
          }
        ]
      }
    }
  });

  console.log('✅ Seeding selesai! Database siap digunakan.');
  console.log('--------------------------------------------------');
  console.log('🔐 Akun Login Demo (Password semua akun: password123):');
  console.log(`👤 Admin    | Username: admin`);
  console.log(`👤 Petani 1 | Username: petani1`);
  console.log(`👤 Petani 2 | Username: petani2`);
  console.log(`👤 Petani 3 | Username: petani3`);
  console.log(`👤 Petani 4 | Username: petani4`);
  console.log(`👤 Investor1| Username: investor1`);
  console.log(`👤 Investor2| Username: investor2`);
  console.log(`👤 Investor3| Username: investor3`);
  console.log(`👤 Investor4| Username: investor4`);
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
