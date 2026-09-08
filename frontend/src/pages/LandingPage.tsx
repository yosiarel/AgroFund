import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Leaf, Users, ShieldCheck, ArrowRight, Sprout, Store, TrendingUp, CheckCircle2, Star } from 'lucide-react';
import CountUp from '../components/ui/CountUp';
import SpotlightCard from '../components/ui/SpotlightCard';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, NavLink } from 'react-router-dom';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

import { TopBarLayout } from '../components/layout/TopBarLayout';
import type { NavItem } from '../components/layout/TopBarLayout';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export const LandingPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-neutral-50)]">
        <LoadingSpinner size="lg" label="Memuat..." />
      </div>
    );
  }

  if (user) {
    if (user.role === 'AGROFUND') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'PENDANA') {
      return <Navigate to="/pendana/discover" replace />;
    } else if (user.role === 'UMKM') {
      return <Navigate to="/umkm" replace />;
    } else if (user.role === 'KOPERASI') {
      return <Navigate to="/koperasi/projects" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  const publicNavItems: NavItem[] = [
    { title: 'Beranda', href: '/' },
    { title: 'Proyek', href: '/projects' },
    { title: 'FAQ', href: '/faq' },
  ];

  return (
    <TopBarLayout navItems={publicNavItems} fullWidth={true}>
      <div className="w-full flex flex-col items-center -mt-8">
        <section
          className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat border-b border-[var(--color-neutral-100)] flex items-center justify-center"
          style={{ backgroundImage: 'url("https://res.cloudinary.com/dznn7frej/image/upload/hero_aaql6u")' }}
        >
          <div className="absolute inset-0 bg-white/90"></div>

          <div className="relative w-full max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center space-y-10 max-w-4xl mx-auto"
            >

              <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold text-[var(--color-neutral-900)] tracking-tight leading-[1.1]">
                Tumbuhkan Masa Depan <br />
                <span className="text-[var(--color-primary-600)]">Pertanian Bersama</span>
              </motion.h1>

              <motion.p
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="text-[var(--text-body-l)] sm:text-xl text-[var(--color-neutral-700)] max-w-2xl mx-auto leading-relaxed font-[500]"
              >
                AgroFund menghubungkan Anda dengan petani, peternak, dan pekebun lokal Nusantara. Bersama, kita wujudkan kemandirian pangan dan ekonomi desa melalui permodalan agrikultur yang aman dan transparan.
              </motion.p>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto"
              >
                <NavLink
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-primary-600)] text-white font-[500] rounded-[var(--radius-l)] hover:bg-[var(--color-primary-700)] transition-colors w-full sm:w-auto shadow-lg shadow-[var(--color-primary-600)]/30 hover:shadow-xl hover:shadow-[var(--color-primary-600)]/40 hover:-translate-y-0.5"
                >
                  Mulai Mendanai
                  <ArrowRight className="w-5 h-5" />
                </NavLink>
                <NavLink
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] font-[500] rounded-[var(--radius-l)] hover:border-[var(--color-neutral-300)] hover:bg-[var(--color-neutral-50)] transition-colors w-full sm:w-auto hover:-translate-y-0.5"
                >
                  Ajukan Modal Pertanian
                </NavLink>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="w-full bg-white border-y border-[var(--color-neutral-100)] py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-[var(--text-h1)] lg:text-4xl font-bold text-[var(--color-neutral-900)] mb-4">Lebih dari Sekadar Platform Pendanaan</h2>
              <p className="text-[var(--color-neutral-600)] max-w-2xl mx-auto text-[var(--text-body-l)]">Kami menghadirkan ekosistem terpadu yang memastikan modal Anda tersalurkan dengan tepat sasaran dan membawa dampak nyata bagi masyarakat desa.</p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <motion.div variants={fadeInUp} className="h-full">
                <SpotlightCard className="h-full p-8 rounded-[var(--radius-xl)] bg-[var(--color-neutral-50)] border border-[var(--color-neutral-100)] hover:shadow-[var(--shadow-e2)] hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 rounded-[var(--radius-l)] bg-[var(--color-accent-500)]/20 text-[var(--color-accent-600)] flex items-center justify-center mb-6">
                    <Sprout className="w-7 h-7" />
                  </div>
                  <h3 className="text-[var(--text-h3)] font-bold text-[var(--color-neutral-900)] mb-3">Patungan Modal Tani</h3>
                  <p className="text-[var(--color-neutral-600)] leading-relaxed">
                    Bantu petani dan pekebun mendapatkan modal awal. Satu aksi kecil dari Anda, wujudkan panen raya bagi kemandirian mereka.
                  </p>
                </SpotlightCard>
              </motion.div>

              <motion.div variants={fadeInUp} className="h-full">
                <SpotlightCard className="h-full p-8 rounded-[var(--radius-xl)] bg-[var(--color-neutral-50)] border border-[var(--color-neutral-100)] hover:shadow-[var(--shadow-e2)] hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 rounded-[var(--radius-l)] bg-[#8D6E63]/20 text-[#5D4037] flex items-center justify-center mb-6">
                    <Store className="w-7 h-7" />
                  </div>
                  <h3 className="text-[var(--text-h3)] font-bold text-[var(--color-neutral-900)] mb-3">Koperasi Tani Digital</h3>
                  <p className="text-[var(--color-neutral-600)] leading-relaxed">
                    Dana tidak dicairkan sembarangan. Petani menukarkan modal langsung menjadi bibit unggul, pupuk, atau traktor untuk mencegah penyalahgunaan dana.
                  </p>
                </SpotlightCard>
              </motion.div>

              <motion.div variants={fadeInUp} className="h-full">
                <SpotlightCard className="h-full p-8 rounded-[var(--radius-xl)] bg-[var(--color-neutral-50)] border border-[var(--color-neutral-100)] hover:shadow-[var(--shadow-e2)] hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 rounded-[var(--radius-l)] bg-[var(--color-primary-600)]/20 text-[var(--color-primary-700)] flex items-center justify-center mb-6">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h3 className="text-[var(--text-h3)] font-bold text-[var(--color-neutral-900)] mb-3">Proteksi Modal Berlapis</h3>
                  <p className="text-[var(--color-neutral-600)] leading-relaxed">
                    Kami menerapkan sistem jaminan (mark-up) dan validasi ketat. Jika proyek berhenti di tengah jalan, sisa dana Anda akan dikembalikan.
                  </p>
                </SpotlightCard>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mb-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="bg-[var(--color-primary-600)] rounded-[2rem] p-8 lg:p-16 flex flex-col md:flex-row justify-around items-center gap-10 text-white shadow-[var(--shadow-e3)] relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

            <motion.div variants={fadeInUp} className="text-center relative z-10">
              <div className="flex items-center justify-center gap-2 mb-3 text-[var(--color-primary-400)] bg-white/10 w-16 h-16 rounded-full mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-4xl font-bold mb-2 flex justify-center items-center text-white">
                3 Aktor Utama
              </h4>
              <p className="font-[500] text-[var(--color-primary-400)]">Petani, Investor & Koperasi Tani</p>
            </motion.div>

            <div className="hidden md:block w-px h-16 bg-white/20 relative z-10"></div>

            <motion.div variants={fadeInUp} className="text-center relative z-10">
              <div className="flex items-center justify-center gap-2 mb-3 text-[var(--color-primary-400)] bg-white/10 w-16 h-16 rounded-full mx-auto">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-4xl font-bold mb-2 flex justify-center items-center gap-2 text-white">
                <CountUp from={0} to={5} duration={2} />%
              </h4>
              <p className="font-[500] text-[var(--color-primary-400)]">Jaminan Komitmen UMKM</p>
            </motion.div>

            <div className="hidden md:block w-px h-16 bg-white/20 relative z-10"></div>

            <motion.div variants={fadeInUp} className="text-center relative z-10">
              <div className="flex items-center justify-center gap-2 mb-3 text-[var(--color-primary-400)] bg-white/10 w-16 h-16 rounded-full mx-auto">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-4xl font-bold mb-2 flex justify-center items-center text-white">
                <CountUp from={0} to={100} duration={2.5} />%
              </h4>
              <p className="font-[500] text-[var(--color-primary-400)]">Transparan & Terlacak</p>
            </motion.div>
          </motion.div>
        </section>

        <section className="w-full bg-white py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-[var(--text-h1)] lg:text-4xl font-bold text-[var(--color-neutral-900)] mb-4">Cara Kerja AgroFund</h2>
              <p className="text-[var(--color-neutral-600)] max-w-2xl mx-auto text-[var(--text-body-l)]">Hanya butuh beberapa langkah sederhana untuk mulai memberikan dampak nyata bagi roda ekonomi pedesaan.</p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-4 gap-8"
            >
              {[
                { title: "Pengajuan Modal Tani", desc: "Petani mengajukan kebutuhan nyata seperti bibit, pupuk, atau traktor.", icon: <CheckCircle2 className="w-6 h-6" /> },
                { title: "Patungan Digital", desc: "Anda memilih proyek agrikultur potensial dan mulai mendanai bersama investor lain.", icon: <TrendingUp className="w-6 h-6" /> },
                { title: "Pencairan via Sarana Tani", desc: "Modal disalurkan dalam wujud alat pertanian, mencegah penyalahgunaan dana.", icon: <Store className="w-6 h-6" /> },
                { title: "Panen Raya & Bagi Hasil", desc: "Saat panen sukses, modal kembali beserta imbal hasil Natura (hasil bumi).", icon: <Leaf className="w-6 h-6" /> }
              ].map((step, idx) => (
                <motion.div key={idx} variants={fadeInUp} className="relative">
                  {idx !== 3 && <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-[var(--color-neutral-100)] -z-10"></div>}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-primary-600)] text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md border-4 border-white">
                      {idx + 1}
                    </div>
                    <h4 className="text-[var(--text-h4)] font-bold text-[var(--color-neutral-900)] mb-2">{step.title}</h4>
                    <p className="text-[var(--text-body-s)] text-[var(--color-neutral-600)]">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="w-full bg-[var(--color-neutral-50)] border-y border-[var(--color-neutral-100)] py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-[var(--text-h1)] lg:text-4xl font-bold text-[var(--color-neutral-900)] mb-4">Kisah Sukses</h2>
              <p className="text-[var(--color-neutral-600)] max-w-2xl mx-auto text-[var(--text-body-l)]">Mendengar langsung dari mereka yang telah merasakan manfaat ekosistem kami.</p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <motion.div variants={fadeInUp} className="h-full">
                <SpotlightCard className="h-full bg-white p-8 rounded-[var(--radius-xl)] shadow-[var(--shadow-e1)] border border-[var(--color-neutral-100)]">
                  <div className="flex gap-1 text-[var(--color-accent-500)] mb-4">
                    <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
                  </div>
                  <p className="text-[var(--color-neutral-700)] italic mb-6">"Sejak bergabung dengan AgroFund, saya tak lagi bergantung pada tengkulak. Bibit langsung tersedia dari Koperasi, hasil panen pun meningkat tajam tahun ini."</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 bg-[var(--color-neutral-200)] rounded-full flex items-center justify-center font-bold text-[var(--color-neutral-500)]">PA</div>
                    <div>
                      <h5 className="font-bold text-[var(--color-neutral-900)]">Pak Anton</h5>
                      <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)]">Petani Jagung, Jawa Tengah</p>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>

              <motion.div variants={fadeInUp} className="h-full">
                <SpotlightCard className="h-full bg-white p-8 rounded-[var(--radius-xl)] shadow-[var(--shadow-e1)] border border-[var(--color-neutral-100)]">
                  <div className="flex gap-1 text-[var(--color-accent-500)] mb-4">
                    <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
                  </div>
                  <p className="text-[var(--color-neutral-700)] italic mb-6">"Transparansinya luar biasa! Fitur investasi tanpa imbal hasil membuat saya bisa murni membantu petani lokal tanpa pusing memikirkan pengembalian modal."</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 bg-[var(--color-neutral-200)] rounded-full flex items-center justify-center font-bold text-[var(--color-neutral-500)]">BU</div>
                    <div>
                      <h5 className="font-bold text-[var(--color-neutral-900)]">Budi S.</h5>
                      <p className="text-[var(--text-body-s)] text-[var(--color-neutral-500)]">Investor Terverifikasi</p>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="w-full bg-white py-20 lg:py-32">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-[var(--text-display-l)] lg:text-5xl font-bold text-[var(--color-neutral-900)] mb-6">Ambil Bagian dalam Perubahan</h2>
              <p className="text-[var(--text-body-l)] text-[var(--color-neutral-600)] mb-10">Mulai langkah pertama Anda bersama AgroFund hari ini. Pilih peran Anda dan wujudkan ketahanan pangan serta kesejahteraan petani lokal.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <NavLink
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-primary-600)] text-white font-[500] rounded-[var(--radius-l)] hover:bg-[var(--color-primary-700)] transition-colors"
                >
                  Mulai Berinvestasi
                  <ArrowRight className="w-5 h-5" />
                </NavLink>
                <NavLink
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] font-[500] rounded-[var(--radius-l)] hover:border-[var(--color-neutral-300)] hover:bg-[var(--color-neutral-50)] transition-colors"
                >
                  Ajukan Modal Pertanian
                </NavLink>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </TopBarLayout>
  );
};
