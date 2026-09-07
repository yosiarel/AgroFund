import React from 'react';
import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
    <div className="min-h-screen flex bg-white font-sans">
      <div className="w-full lg:w-1/2 flex flex-col relative min-h-screen">
        <div className="absolute top-0 left-0 w-full p-6 sm:p-10 flex justify-between items-center z-10">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
               <span className="text-white font-bold text-sm">AF</span>
            </div>
            <span className="text-xl font-bold text-green-700 tracking-tight">AgroFund</span>
          </NavLink>
        </div>
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-24 xl:px-32 py-24">
          <Outlet />
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 relative bg-white pl-2">
        <div className="w-full h-full relative rounded-l-[3rem] overflow-hidden bg-green-700/5 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://res.cloudinary.com/dznn7frej/image/upload/v1785231138/bg_3d_ipeb2c.png')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-700/10 via-transparent to-black/20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-green-950/90 via-green-900/30 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-12 xl:p-16 text-white z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-[#1B5E20]/50 object-cover" src="https://i.pravatar.cc/150?img=32" alt="Investor" />
                <img className="w-10 h-10 rounded-full border-2 border-[#1B5E20]/50 object-cover" src="https://i.pravatar.cc/150?img=11" alt="Petani" />
                <img className="w-10 h-10 rounded-full border-2 border-[#1B5E20]/50 object-cover" src="https://i.pravatar.cc/150?img=47" alt="Petani" />
                <div className="w-10 h-10 rounded-full border-2 border-[#1B5E20]/50 bg-green-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  10k+
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">Dipercaya oleh</span>
                <span className="text-xs text-green-100">10.000+ Investor & Petani</span>
              </div>
            </div>

            <h2 className="text-3xl xl:text-4xl font-bold leading-tight mb-3 text-white">
              Bersama Membangun <br /> Ketahanan Pangan
            </h2>
            <p className="text-gray-200 text-sm xl:text-base max-w-md leading-relaxed">
              Platform urun dana dan koperasi digital pertama yang menghubungkan investor langsung dengan para pahlawan pangan Indonesia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
