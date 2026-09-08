# AgroFund 🌾

AgroFund adalah platform inovatif yang menghubungkan UMKM sektor agrikultur (petani dan nelayan) dengan pendana (investor). Platform ini memfasilitasi pendanaan transparan yang aman di mana penyaluran dana difokuskan untuk pembelian barang/modal kerja, yang diawasi ketat melalui kerja sama dengan Koperasi setempat, dengan pengembalian berupa bagi hasil (Natura/Uang).

---

## 🌟 Fitur Utama

- **Pendanaan Berbasis Proyek**: Memodali UMKM agrikultur secara patungan (*crowdfunding*).
- **Pengawasan Koperasi**: Setiap proyek yang diajukan UMKM wajib diverifikasi kelayakannya oleh Koperasi setempat.
- **Transparansi Alur Dana**: Dana investasi dialokasikan langsung untuk Pengadaan Barang (Purchase Order/PO) ke Pemasok (Supplier), bukan tunai mentah.
- **Dashboard Multi-Peran**: Antarmuka terpisah khusus untuk 4 peran: UMKM, Pendana, Koperasi, dan Super Admin.
- **Opsi Return Natura**: Pendana dapat memilih kompensasi menarik berupa produk hasil panen (Natura).
- **Sistem Perlindungan Dana**: Pengamanan investasi melalui Jaminan (Guarantee 5%) dan skema restrukturisasi jika terjadi musibah/gagal panen.

---

## 🛠️ Tech Stack (Teknologi Utama)

Proyek ini dibangun menggunakan teknologi modern untuk memastikan performa yang cepat, aman, dan mudah dikembangkan:

**Frontend:**
- **React.js** dengan **Vite**: *Library* dan *bundler* super cepat untuk antarmuka pengguna.
- **Tailwind CSS**: *Framework* CSS untuk desain yang *responsive* dan modern.
- **TypeScript**: Bahasa pemrograman dengan sistem tipe data statis untuk mencegah *bug*.

**Backend:**
- **NestJS**: *Framework* Node.js yang tangguh dan terstruktur (arsitektur modular) untuk membangun API.
- **Prisma ORM**: *Object-Relational Mapping modern* untuk berinteraksi dengan *database* secara aman (*type-safe*).
- **PostgreSQL**: Sistem manajemen *database* relasional.
- **TypeScript**: Menjaga konsistensi bahasa pemrograman antara *frontend* dan *backend*.

---

## 📂 Struktur Folder Proyek

Aplikasi ini menggunakan pendekatan repositori tunggal (*monorepo-style*) di mana kode *frontend* dan *backend* ditempatkan secara berdampingan:

```text
Akar/
├── backend/                  # Server API (NestJS)
│   ├── prisma/               # Konfigurasi ORM & Database
│   │   ├── schema.prisma     # Definisi skema dan relasi basis data
│   │   └── seed.ts           # Skrip otomatis pemuat data awal uji coba (dummy data)
│   ├── src/                  # Kode utama backend
│   │   ├── admin/            # API pengelolaan Admin (Persetujuan proyek, validasi)
│   │   ├── auth/             # API Autentikasi & Otorisasi (JWT, Guard, Dekorator)
│   │   ├── common/           # Interceptor global, filter error, dan validator kustom
│   │   ├── cron/             # Tugas terjadwal (cron jobs) untuk deteksi deadline
│   │   ├── evidence/         # API manajemen dokumen/bukti laporan lapangan
│   │   ├── finance/          # API transaksi keuangan, kontribusi pendana, & saldo
│   │   ├── koperasi/         # API peninjauan (assessment) kelayakan proyek 
│   │   ├── procurement/      # API Pengadaan barang (Natura) & Purchase Order (PO)
│   │   ├── project/          # API Inti: Manajemen siklus proyek dan pelaporan progres
│   │   ├── upload/           # API layanan penyimpanan berkas (Cloudinary)
│   │   ├── user/             # API manajemen profil dan entitas pengguna
│   │   └── main.ts           # Titik masuk utama aplikasi (entry point)
│   ├── .env                  # Konfigurasi kredensial environment backend
│   └── package.json          # Daftar dependensi dan perintah (script) backend
│
├── frontend/                 # Aplikasi Klien Web (React + Vite)
│   ├── src/                  # Kode utama frontend
│   │   ├── assets/           # Gambar statis, logo, dan sumber daya visual
│   │   ├── components/       # Komponen antarmuka yang dapat digunakan ulang (Reusable)
│   │   │   ├── business/     # Komponen spesifik alur bisnis (Bilah progres, Status Proyek)
│   │   │   ├── layout/       # Kerangka tata letak (Sidebar, TopBar, Footer, Wrapper per-peran)
│   │   │   └── ui/           # Sistem Desain Inti (Tombol, Input, Modal, Tabel, Alert)
│   │   ├── contexts/         # React Context untuk manajemen data global (seperti AuthContext)
│   │   ├── lib/              # Konfigurasi utilitas (Axios interceptor, format angka/tanggal)
│   │   ├── pages/            # Seluruh halaman (Routing), dipisahkan berdasarkan Peran (Role)
│   │   │   ├── admin/        # Tampilan Dasbor AgroFund dan Tabel peninjauan proyek
│   │   │   ├── auth/         # Tampilan Layar Masuk (Login) dan Pendaftaran
│   │   │   ├── koperasi/     # Tampilan Dasbor Koperasi, Laporan lapangan, dan Penerbitan PO
│   │   │   ├── pendana/      # Tampilan Dasbor Investor, Etalase proyek (Discover), dan Riwayat
│   │   │   ├── umkm/         # Tampilan Dasbor Petani, Pembuatan draf proyek, dan Pelaporan
│   │   │   └── LandingPage.tsx
│   │   ├── types/            # Definisi tipe data TypeScript global yang sinkron dengan backend
│   │   ├── App.tsx           # Pusat Routing (React Router) dan proteksi rute (Guarded Routes)
│   │   └── index.css         # Aturan gaya dasar dan variabel (tokens) menggunakan Tailwind CSS
│   ├── .env                  # Konfigurasi environment frontend (seperti URL API Server)
│   └── package.json          # Daftar dependensi dan perintah (script) frontend
│
└── README.MD                 # Dokumentasi Proyek Induk ini
```

---
## 📋 Spesifikasi Lingkungan Pengujian

Untuk memastikan aplikasi dapat berjalan dengan stabil saat dievaluasi, kami merekomendasikan penggunaan spesifikasi lingkungan pengujian berikut:

- **Node.js**: v18.x atau lebih baru.
- **Package Manager**: npm (v9.x atau lebih baru).
- **Database**: PostgreSQL (v14 atau lebih baru).
- **Backend Framework**: NestJS (TypeScript).
- **Frontend Framework**: React + Vite + Tailwind CSS (TypeScript).
- **ORM**: Prisma.
- **Browser Pengujian**: Google Chrome, Microsoft Edge, atau Mozilla Firefox versi desktop terbaru.

---

## 🚀 Panduan Instalasi

Sebelum memulai instalasi, pastikan Anda telah memasang **Node.js**, **npm**, dan memiliki akses ke basis data **PostgreSQL**.

### 1. Kloning Repositori
Salin (*clone*) proyek ini ke mesin/komputer lokal Anda:
```bash
git clone <url-repo-anda>
cd Akar
```

### 2. Konfigurasi Backend (NestJS)
Buka terminal dan masuk ke folder `backend` untuk mengatur sisi _server_:
```bash
cd backend
npm install
```

Buat _file_ `.env` baru di dalam folder `backend/` dan isi dengan konfigurasi berikut. Sesuaikan nilai `DATABASE_URL` dengan *connection string* PostgreSQL milik Anda:
```env
DATABASE_URL='postgres://user:password@localhost:5432/agrofund'
JWT_SECRET='super-secret-jwt-key'
XENDIT_SECRET_KEY='your-xendit-secret-key'
CLOUDINARY_API_SECRET='your-cloudinary-secret'
CLOUDINARY_API_KEY='your-cloudinary-key'
CLOUDINARY_CLOUD_NAME='your-cloud-name'
XENDIT_WEBHOOK_TOKEN='your-webhook-token'
PORT=3000
```

### 3. Migrasi Database dan Seeding
Setelah mengonfigurasi basis data, jalankan perintah berikut secara berurutan untuk menyelaraskan skema tabel dan memuat data uji (*dummy data*):
```bash
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
```

### 4. Konfigurasi Frontend (React + Vite)
Buka jendela/tab terminal yang baru, lalu masuk ke folder `frontend`:
```bash
cd frontend
npm install
```

Buat _file_ `.env` di dalam folder `frontend/` dan masukkan _endpoint_ koneksi menuju _backend_:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 🏃‍♂️ Cara Menjalankan Aplikasi

Aplikasi ini menggunakan arsitektur terpisah antara _frontend_ dan _backend_. Anda wajib menjalankan keduanya **secara bersamaan** di jendela terminal yang berbeda.

### Menjalankan Backend
Di terminal pertama, pastikan Anda berada di direktori `backend/` lalu ketik:
```bash
npm run start:dev
```
Aplikasi _backend_ akan aktif secara lokal dan siap melayani permintaan API di `http://localhost:3000`.

### Menjalankan Frontend
Di terminal kedua, pastikan Anda berada di direktori `frontend/` lalu ketik:
```bash
npm run dev
```
Aplikasi _frontend_ akan berjalan. Buka _browser_ Anda dan akses tautan `http://localhost:5173` untuk menggunakan AgroFund.

---

## 🔑 Akun Demo (Uji Coba)

Untuk memudahkan proses pengujian (_testing_), proses _seeding_ database sebelumnya secara otomatis telah membuat 18 proyek uji coba (mewakili seluruh tahapan alur hidup proyek dari _Draft_ hingga _Sukses_ beserta berbagai skenario kompleks / *edge-cases*) beserta 7 buah akun yang memiliki peran berbeda-beda.

Gunakan kredensial (nama pengguna dan kata sandi) di bawah ini untuk mengakses aplikasi:

### Super Admin (AgroFund)
Memiliki akses ke Dasbor Admin untuk menyetujui, menerbitkan (*publish*) proyek, serta melihat laporan keseluruhan.
- **Username:** `admin`
- **Password:** `admin123`

### UMKM (Petani / Nelayan)
Memiliki kemampuan untuk membuat draf proyek, mengirim laporan perkembangan (*progress*), dan melaporkan insiden.
- **Username:** `budi` (Memiliki 9 proyek dengan status pengujian beragam)
- **Username:** `santo` (Memiliki 9 proyek dengan status pengujian beragam)
- **Password:** `user123`

### Koperasi (Asesor & Pengawas)
Ditugaskan untuk meninjau awal (*assessment*) proyek dari UMKM, menyetujui bukti laporan (*evidence*), dan memantau lapangan.
- **Username:** `kop_makmur` (Koperasi milik Budi)
- **Username:** `kop_jaya` (Koperasi milik Santo)
- **Password:** `user123`

### Pendana (Investor)
Akun ini digunakan untuk melihat halaman *Discover* (etalase) pendanaan, melakukan pembayaran pendanaan proyek, serta melihat portofolio (_Dashboard_).
- **Username:** `sultan`
- **Username:** `dermawan`
- **Password:** `user123`

> 💡 **Tip Pengujian:** Sangat disarankan untuk menggunakan _Incognito Mode_ (Mode Samaran) atau _Private Window_ di browser tambahan jika Anda ingin menguji dan mensimulasikan interaksi langsung antara dua peran yang berbeda (misalnya: UMKM dan Admin) di saat yang bersamaan, tanpa harus sering me-Log Out akun.
