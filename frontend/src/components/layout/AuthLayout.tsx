import React from 'react';
import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheck, Users, Sprout } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const { user } = useAuth();

  if (user) {
    if (user.role === 'AGROFUND') {
      return <Navigate to="/admin/projects" replace />;
    } else if (user.role === 'PENDANA') {
      return <Navigate to="/pendana/discover" replace />;
    } else if (user.role === 'UMKM') {
      return <Navigate to="/umkm/projects" replace />;
    } else if (user.role === 'KOPERASI') {
      return <Navigate to="/koperasi/projects" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex bg-[var(--color-neutral-50)] font-sans">
      <div className="w-full lg:w-1/2 flex flex-col relative min-h-screen bg-white">
        <div className="absolute top-0 left-0 w-full p-6 sm:p-10 flex justify-between items-center z-10">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-primary-600)] rounded-[var(--radius-m)] flex items-center justify-center shadow-[var(--shadow-e1)]">
               <span className="text-white font-bold text-sm">AF</span>
            </div>
            <span className="text-[var(--text-h4)] font-bold text-[var(--color-primary-700)] tracking-tight">AgroFund</span>
          </NavLink>
        </div>
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 xl:px-28 py-24">
          <Outlet />
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 relative bg-[var(--color-neutral-50)] pl-2">
        <div className="w-full h-full relative rounded-l-[2.5rem] overflow-hidden bg-[var(--color-primary-900)] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay"
            style={{
              backgroundImage: "url('https://res.cloudinary.com/dznn7frej/image/upload/v1785231138/bg_3d_ipeb2c.png')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-700)]/80 via-[var(--color-primary-900)]/90 to-black/90 pointer-events-none" />
          
          <div className="absolute bottom-0 left-0 right-0 p-12 xl:p-16 text-white z-10 flex flex-col gap-6">
            {/* Ecosystem Trust Badge */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-[var(--radius-full)] w-fit border border-white/15">
              <Sprout className="w-4 h-4 text-[var(--color-accent-500)]" />
              <span className="text-[var(--text-caption)] font-[600] text-white">
                P2P Lending Syariah Agrikultur Indonesia
              </span>
            </div>

            <div>
              <h2 className="text-[var(--text-display-l)] leading-tight font-bold mb-3 text-white">
                Membangun Kemandirian <br /> Pangan Nasional
              </h2>
              <p className="text-[var(--color-neutral-200)] text-[var(--text-body-m)] max-w-md leading-relaxed">
                Platform kolaboratif yang menghubungkan Pendana dengan UMKM sektor pertanian, perkebunan, dan peternakan dengan pendampingan langsung dari Koperasi.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/15 text-[var(--text-caption)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--color-accent-500)] flex-shrink-0" />
                <span>Akad Syariah Transparan</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--color-accent-500)] flex-shrink-0" />
                <span>Pendampingan Koperasi Faktual</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

