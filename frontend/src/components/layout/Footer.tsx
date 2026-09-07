import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[var(--color-neutral-100)] pt-16 pb-24 md:pb-8 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[var(--color-primary-600)] rounded-[var(--radius-m)] flex items-center justify-center shadow-[var(--shadow-e1)]">
                 <span className="text-white font-bold text-sm">AF</span>
              </div>
              <span className="text-xl font-bold text-[var(--color-primary-700)] tracking-tight">AgroFund</span>
            </div>
            <p className="text-[var(--color-neutral-500)] text-[var(--text-body-s)] leading-relaxed mb-6">
              Platform crowdfunding dan koperasi digital terintegrasi untuk memajukan sektor pertanian, petani, dan peternak Indonesia secara transparan.
            </p>
            <div className="flex gap-4 text-[var(--color-neutral-400)] font-bold text-sm">
              <a href="#" className="hover:text-[var(--color-primary-600)] transition-colors">FB</a>
              <a href="#" className="hover:text-[var(--color-primary-600)] transition-colors">X</a>
              <a href="#" className="hover:text-[var(--color-primary-600)] transition-colors">IG</a>
              <a href="#" className="hover:text-[var(--color-primary-600)] transition-colors">IN</a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[var(--color-neutral-900)] mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-[var(--color-neutral-500)]">
              <li><NavLink to="/projects" className="hover:text-[var(--color-primary-600)] transition-colors">Telusuri Proyek</NavLink></li>
              <li><NavLink to="/koperasi" className="hover:text-[var(--color-primary-600)] transition-colors">Koperasi Digital</NavLink></li>
              <li><NavLink to="/cara-kerja" className="hover:text-[var(--color-primary-600)] transition-colors">Cara Kerja</NavLink></li>
              <li><NavLink to="/faq" className="hover:text-[var(--color-primary-600)] transition-colors">Tanya Jawab</NavLink></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[var(--color-neutral-900)] mb-4">Perusahaan</h4>
            <ul className="space-y-3 text-sm text-[var(--color-neutral-500)]">
              <li><NavLink to="/about" className="hover:text-[var(--color-primary-600)] transition-colors">Tentang Kami</NavLink></li>
              <li><NavLink to="/contact" className="hover:text-[var(--color-primary-600)] transition-colors">Hubungi Kami</NavLink></li>
              <li><NavLink to="/terms" className="hover:text-[var(--color-primary-600)] transition-colors">Syarat & Ketentuan</NavLink></li>
              <li><NavLink to="/privacy" className="hover:text-[var(--color-primary-600)] transition-colors">Kebijakan Privasi</NavLink></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[var(--color-neutral-900)] mb-4">Kontak</h4>
            <ul className="space-y-3 text-sm text-[var(--color-neutral-500)]">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[var(--color-neutral-400)]" />
                <span>support@agrofund.id</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[var(--color-neutral-400)]" />
                <span>+62 811 2233 4455</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[var(--color-neutral-400)]" />
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--color-neutral-100)] flex flex-col md:flex-row justify-between items-center gap-4 text-[var(--text-body-s)] text-[var(--color-neutral-400)]">
          <p>© {new Date().getFullYear()} AgroFund. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-2">
            <span>Dibuat dengan</span>
            <span className="text-[var(--color-error-500)]">♥</span>
            <span>untuk Petani Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
