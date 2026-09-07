import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { ColdStartProvider } from './components/ColdStartProvider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { PendanaDashboard } from './pages/pendana/PendanaDashboard';
import { UmkmDashboard } from './pages/umkm/UmkmDashboard';
import { KoperasiDashboard } from './pages/koperasi/KoperasiDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
// Pendana Pages
import { DiscoverProjectsPage } from './pages/pendana/DiscoverProjectsPage';
import { ProjectDetailPage } from './pages/pendana/ProjectDetailPage';
import { MyContributionsPage } from './pages/pendana/MyContributionsPage';
// UMKM Pages
import { MyProjectsPage } from './pages/umkm/MyProjectsPage';
import { CreateProjectPage } from './pages/umkm/CreateProjectPage';
// Koperasi Pages
import { AssignedProjectsPage } from './pages/koperasi/AssignedProjectsPage';
import { AssessmentPage } from './pages/koperasi/AssessmentPage';
// Admin Pages
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { PublicationReviewPage } from './pages/admin/PublicationReviewPage';

const RootLayout = () => {
  return (
    <ColdStartProvider>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </ColdStartProvider>
  );
};

const HomeOrRedirect = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-neutral-50)]">
        <LoadingSpinner size="lg" label="Memuat..." />
      </div>
    );
  }
  if (user) {
    switch (user.role) {
      case "PENDANA": return <Navigate to="/pendana/discover" replace />;
      case "UMKM": return <Navigate to="/umkm/projects" replace />;
      case "KOPERASI": return <Navigate to="/koperasi/projects" replace />;
      case "AGROFUND": return <Navigate to="/admin/projects" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-neutral-50)] p-4 text-center">
      <div className="w-16 h-16 bg-[var(--color-primary-600)] rounded-[var(--radius-m)] flex items-center justify-center mb-6">
        <span className="text-white font-bold text-2xl">AF</span>
      </div>
      <h1 className="text-[var(--text-h2)] leading-[var(--text-h2--line-height)] font-[700] text-[var(--color-neutral-900)] mb-3">
        AgroFund
      </h1>
      <p className="text-[var(--text-body-l)] text-[var(--color-neutral-600)] mb-8 max-w-md mx-auto">
        Platform Peer-to-Peer Lending Syariah Agrikultur.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mx-auto">
        <a href="/login" className="w-full text-center px-4 py-2.5 bg-[var(--color-primary-600)] text-white font-[500] rounded-[var(--radius-m)] hover:bg-[var(--color-primary-700)] transition-colors">
          Masuk
        </a>
        <a href="/register" className="w-full text-center px-4 py-2.5 bg-white text-[var(--color-primary-600)] border border-[var(--color-primary-200)] font-[500] rounded-[var(--radius-m)] hover:bg-[var(--color-primary-50)] transition-colors">
          Daftar Baru
        </a>
      </div>
    </div>
  );
};

const UnauthorizedPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-neutral-50)] p-4 text-center">
    <h1 className="text-[var(--text-h2)] font-[700] text-[var(--color-error-600)] mb-2">Akses Ditolak</h1>
    <p className="text-[var(--text-body-m)] text-[var(--color-neutral-600)] mb-6">
      Anda tidak memiliki izin untuk mengakses halaman ini.
    </p>
    <a href="/" className="px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-[var(--radius-m)] hover:bg-[var(--color-primary-700)] transition-colors">
      Kembali ke Beranda
    </a>
  </div>
);

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col gap-2">
    <h1 className="text-[var(--text-h2)] font-[700] text-[var(--color-neutral-900)]">{title}</h1>
    <p className="text-[var(--text-body-m)] text-[var(--color-neutral-500)]">Halaman ini sedang dalam pengembangan.</p>
  </div>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomeOrRedirect /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/unauthorized', element: <UnauthorizedPage /> },

      // ── Pendana Routes ──────────────────────────────────────────────
      {
        path: '/pendana',
        element: <ProtectedRoute allowedRoles={['PENDANA']} />,
        children: [
          {
            element: <PendanaDashboard />,
            children: [
              { index: true, element: <Navigate to="/pendana/discover" replace /> },
              { path: 'discover', element: <DiscoverProjectsPage /> },
              { path: 'discover/:projectId', element: <ProjectDetailPage /> },
              { path: 'contributions', element: <MyContributionsPage /> },
              { path: 'monitoring', element: <Placeholder title="Project Monitoring" /> },
              { path: 'natura', element: <Placeholder title="Natura" /> },
              { path: 'complaints', element: <Placeholder title="Complaints / Cases" /> },
            ]
          }
        ]
      },

      // ── UMKM Routes ─────────────────────────────────────────────────
      {
        path: '/umkm',
        element: <ProtectedRoute allowedRoles={['UMKM']} />,
        children: [
          {
            element: <UmkmDashboard />,
            children: [
              { index: true, element: <Navigate to="/umkm/projects" replace /> },
              { path: 'projects', element: <MyProjectsPage /> },
              { path: 'projects/create', element: <CreateProjectPage /> },
              { path: 'projects/:projectId', element: <Placeholder title="Detail Proyek UMKM" /> },
              { path: 'projects/:projectId/guarantee', element: <Placeholder title="Pembayaran Guarantee" /> },
              { path: 'projects/:projectId/procurement', element: <Placeholder title="Pengadaan Proyek" /> },
              { path: 'projects/:projectId/procurement/create', element: <Placeholder title="Buat Procurement Request" /> },
              { path: 'projects/:projectId/execution', element: <Placeholder title="Eksekusi Proyek" /> },
              { path: 'profile', element: <Placeholder title="Profile / Payment Information" /> },
            ]
          }
        ]
      },

      // ── Koperasi Routes ──────────────────────────────────────────────
      {
        path: '/koperasi',
        element: <ProtectedRoute allowedRoles={['KOPERASI']} />,
        children: [
          {
            element: <KoperasiDashboard />,
            children: [
              { index: true, element: <Navigate to="/koperasi/projects" replace /> },
              { path: 'projects', element: <AssignedProjectsPage /> },
              { path: 'assessment/:projectId', element: <AssessmentPage /> },
              { path: 'projects/:projectId', element: <Placeholder title="Detail Proyek Koperasi" /> },
              { path: 'procurement', element: <Placeholder title="Procurement Validation" /> },
              { path: 'evidence', element: <Placeholder title="Evidence" /> },
              { path: 'monitoring', element: <Placeholder title="Monitoring" /> },
              { path: 'incidents', element: <Placeholder title="Incident / Cases" /> },
            ]
          }
        ]
      },

      // ── AgroFund Admin Routes ─────────────────────────────────────────
      {
        path: '/admin',
        element: <ProtectedRoute allowedRoles={['AGROFUND']} />,
        children: [
          {
            element: <AdminDashboard />,
            children: [
              { index: true, element: <Navigate to="/admin/projects" replace /> },
              { path: 'projects', element: <AdminProjectsPage /> },
              { path: 'projects/:projectId/review', element: <PublicationReviewPage /> },
              { path: 'projects/:projectId', element: <Placeholder title="Detail Proyek Admin" /> },
              { path: 'cooperatives', element: <Placeholder title="Cooperatives" /> },
              { path: 'incidents', element: <Placeholder title="Incidents" /> },
              { path: 'recovery', element: <Placeholder title="Recovery" /> },
              { path: 'refunds', element: <Placeholder title="Refunds" /> },
              { path: 'disputes', element: <Placeholder title="Disputes" /> },
              { path: 'audit', element: <Placeholder title="Audit / Activity" /> },
            ]
          }
        ]
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
