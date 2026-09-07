import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { customAlert } from '../../utils/alert';
import { Footer } from './Footer';
import { Navbar, NavBody, NavItems, MobileNav, MobileNavHeader, MobileNavMenu, MobileNavToggle } from '../ui/resizable-navbar';
import logoAgroFund from '../../assets/logo-agrofund.jpeg';

export interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  end?: boolean;
}

interface TopBarLayoutProps {
  navItems: NavItem[];
  profileItems?: NavItem[];
  children?: React.ReactNode;
  fullWidth?: boolean;
}

export const TopBarLayout: React.FC<TopBarLayoutProps> = ({ navItems, profileItems = [], children, fullWidth = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    customAlert({
      type: 'warning',
      title: 'Konfirmasi Keluar',
      text: 'Apakah Anda yakin ingin keluar dari akun?',
      showCancelButton: true,
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#EF4444',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoggingOut(true);
        try {
          await logout();
          navigate('/login');
        } finally {
          setIsLoggingOut(false);
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] flex flex-col">
      {!user ? (
        <Navbar>
          <NavBody>
            <NavLink to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity mr-8">
              <img
                src={logoAgroFund}
                alt="AgroFund Logo"
                className="h-8 w-auto object-contain rounded-[var(--radius-m)]"
              />
              <span className="text-2xl font-bold text-[var(--color-primary-700)] tracking-tight">AgroFund</span>
            </NavLink>
            <NavItems items={navItems} onItemClick={() => setIsMobileMenuOpen(false)} />
            <div className="flex items-center gap-2 ml-8">
              <NavLink to="/login" className="px-4 py-2 text-[var(--text-label)] font-[600] text-[var(--color-neutral-600)] hover:text-[var(--color-primary-600)] transition-colors">
                Masuk
              </NavLink>
              <NavLink to="/register" className="px-6 py-2 bg-[var(--color-primary-600)] text-white text-[var(--text-label)] font-[600] rounded-full hover:bg-[var(--color-primary-700)] transition-colors shadow-[var(--shadow-e1)] hover:-translate-y-0.5">
                Daftar
              </NavLink>
            </div>
          </NavBody>
          <MobileNav>
            <MobileNavHeader className="px-4">
              <NavLink to="/" className="flex items-center gap-2">
                <img
                  src={logoAgroFund}
                  alt="AgroFund Logo"
                  className="h-8 w-auto object-contain rounded-[var(--radius-m)]"
                />
              </NavLink>
              <MobileNavToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
            </MobileNavHeader>
            <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
              <div className="flex flex-col w-full gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.href}
                    end={item.end}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 text-base font-[600] rounded-[var(--radius-m)] transition-colors ${isActive && item.href !== '/'
                        ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                        : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)] hover:text-[var(--color-neutral-900)]'
                      }`
                    }
                  >
                    {item.title}
                  </NavLink>
                ))}
                <div className="flex flex-col gap-3 mt-4 border-t border-[var(--color-neutral-100)] pt-4 px-2">
                  <NavLink
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-[var(--color-primary-600)] font-[600] border border-[var(--color-primary-600)] rounded-[var(--radius-m)]"
                  >
                    Masuk
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 bg-[var(--color-primary-600)] text-white font-[600] rounded-[var(--radius-m)] shadow-sm"
                  >
                    Daftar
                  </NavLink>
                </div>
              </div>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>
      ) : (
        <header className="bg-white border-b border-[var(--color-neutral-200)] sticky top-0 z-50">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <NavLink to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                  <img
                    src={logoAgroFund}
                    alt="AgroFund Logo"
                    className="h-8 w-auto object-contain rounded-[var(--radius-m)]"
                  />
                  <span className="text-2xl font-bold text-[var(--color-primary-700)] tracking-tight">AgroFund</span>
                </NavLink>
              </div>

              <nav className="hidden md:flex space-x-8 h-16 ml-8">
                {navItems.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.href}
                    end={item.end}
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 border-b-2 text-[var(--text-label)] font-[600] transition-colors ${isActive
                        ? 'border-[var(--color-primary-600)] text-[var(--color-primary-600)]'
                        : 'border-transparent text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)] hover:border-[var(--color-neutral-300)]'
                      }`
                    }
                  >
                    {item.title}
                  </NavLink>
                ))}
              </nav>

              <div className="flex-1"></div>

              <div className="hidden md:flex items-center space-x-4">
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-full py-1 pl-1 pr-3 hover:bg-[var(--color-primary-50)] hover:border-[var(--color-primary-500)]/30 hover:text-[var(--color-primary-600)] transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-[var(--color-primary-100)] rounded-full flex items-center justify-center text-[var(--color-primary-700)] font-bold uppercase shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-[var(--text-caption)] font-[600] text-[var(--color-neutral-700)]">{user.username}</span>
                    <ChevronDown className="w-4 h-4 text-[var(--color-neutral-400)]" />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[var(--color-neutral-100)] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {profileItems.map(item => (
                        <NavLink key={item.title} to={item.href} onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[var(--text-label)] font-[500] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)] hover:text-[var(--color-primary-600)] transition-colors">
                          {item.icon} {item.title}
                        </NavLink>
                      ))}
                      {profileItems.length > 0 && <div className="h-px bg-[var(--color-neutral-100)] my-1"></div>}
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-[var(--text-label)] font-[500] text-[var(--color-error-500)] hover:bg-[var(--color-error-100)] transition-colors">
                        <LogOut className="w-4 h-4" /> {isLoggingOut ? 'Keluar...' : 'Keluar Akun'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center md:hidden gap-3">
                <div className="flex items-center gap-2 bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-full py-1 pl-1 pr-3">
                  <div className="w-7 h-7 bg-[var(--color-primary-100)] rounded-full flex items-center justify-center text-[var(--color-primary-700)] font-bold uppercase text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-[var(--text-caption)] font-[600] text-[var(--color-neutral-700)]">{user.username}</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-100)] focus:outline-none"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-[var(--color-neutral-200)] bg-white absolute w-full shadow-lg">
              <div className="pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.href}
                    end={item.end}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block pl-4 pr-4 py-3 border-l-4 text-base font-[600] ${isActive
                        ? 'bg-[var(--color-primary-50)] border-[var(--color-primary-600)] text-[var(--color-primary-600)]'
                        : 'border-transparent text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)] hover:border-[var(--color-neutral-300)] hover:text-[var(--color-neutral-900)]'
                      }`
                    }
                  >
                    {item.title}
                  </NavLink>
                ))}

                <div className="px-2 pt-2 pb-3 space-y-1 mt-2 border-t border-[var(--color-neutral-100)]">
                  {profileItems.map(item => (
                    <NavLink key={item.title} to={item.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-base font-[500] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)] rounded-[var(--radius-m)]">
                      {item.icon} {item.title}
                    </NavLink>
                  ))}
                </div>

                <div className="px-4 py-4 mt-2 border-t border-[var(--color-neutral-100)]">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-center gap-2 py-3 text-[var(--color-error-500)] font-[600] border border-[var(--color-error-100)] rounded-[var(--radius-m)] hover:bg-[var(--color-error-100)] transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    {isLoggingOut ? 'Keluar...' : 'Keluar Akun'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>
      )}

      <main className={`flex-1 w-full flex flex-col ${fullWidth ? '' : 'py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'}`}>
        {children || <Outlet />}
      </main>

      <Footer />
    </div>
  );
};
