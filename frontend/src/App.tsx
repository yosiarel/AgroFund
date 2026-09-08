import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthLayout } from './components/layout/AuthLayout';
import { ColdStartProvider } from './components/ColdStartProvider';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, DashboardSkeleton } from './components/ProtectedRoute';

const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));

// Dashboards
const PendanaDashboard = lazy(() => import('./pages/pendana/PendanaDashboard').then(m => ({ default: m.PendanaDashboard })));
const UmkmDashboard = lazy(() => import('./pages/umkm/UmkmDashboard').then(m => ({ default: m.UmkmDashboard })));
const KoperasiDashboard = lazy(() => import('./pages/koperasi/KoperasiDashboard').then(m => ({ default: m.KoperasiDashboard })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

// Pendana Pages
const DiscoverProjectsPage = lazy(() => import('./pages/pendana/DiscoverProjectsPage').then(m => ({ default: m.DiscoverProjectsPage })));
const ProjectDetailPage = lazy(() => import('./pages/pendana/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const MyContributionsPage = lazy(() => import('./pages/pendana/MyContributionsPage').then(m => ({ default: m.MyContributionsPage })));
const ContributionDetailPage = lazy(() => import('./pages/pendana/ContributionDetailPage').then(m => ({ default: m.ContributionDetailPage })));
const PendanaProjectMonitoringPage = lazy(() => import('./pages/pendana/ProjectMonitoringPage').then(m => ({ default: m.ProjectMonitoringPage })));
const NaturaTrackingPage = lazy(() => import('./pages/pendana/NaturaTrackingPage').then(m => ({ default: m.NaturaTrackingPage })));
const ComplaintsPage = lazy(() => import('./pages/pendana/ComplaintsPage').then(m => ({ default: m.ComplaintsPage })));
const PendanaDashboardOverviewPage = lazy(() => import('./pages/pendana/PendanaDashboardOverviewPage').then(m => ({ default: m.PendanaDashboardOverviewPage })));

// UMKM Pages
const MyProjectsPage = lazy(() => import('./pages/umkm/MyProjectsPage').then(m => ({ default: m.MyProjectsPage })));
const CreateProjectPage = lazy(() => import('./pages/umkm/CreateProjectPage').then(m => ({ default: m.CreateProjectPage })));
const UmkmProjectDetailPage = lazy(() => import('./pages/umkm/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const GuaranteePaymentPage = lazy(() => import('./pages/umkm/GuaranteePaymentPage').then(m => ({ default: m.GuaranteePaymentPage })));
const ProcurementPage = lazy(() => import('./pages/umkm/ProcurementPage').then(m => ({ default: m.ProcurementPage })));
const CreateProcurementPage = lazy(() => import('./pages/umkm/CreateProcurementPage').then(m => ({ default: m.CreateProcurementPage })));
const ProjectExecutionPage = lazy(() => import('./pages/umkm/ProjectExecutionPage').then(m => ({ default: m.ProjectExecutionPage })));
const ProfilePage = lazy(() => import('./pages/umkm/ProfilePage').then(m => ({ default: m.ProfilePage })));
const UmkmDashboardOverviewPage = lazy(() => import('./pages/umkm/UmkmDashboardOverviewPage').then(m => ({ default: m.UmkmDashboardOverviewPage })));

const AssignedProjectsPage = lazy(() => import('./pages/koperasi/AssignedProjectsPage').then(m => ({ default: m.AssignedProjectsPage })));
const AssessmentPage = lazy(() => import('./pages/koperasi/AssessmentPage').then(m => ({ default: m.AssessmentPage })));
const ProcurementValidationPage = lazy(() => import('./pages/koperasi/ProcurementValidationPage').then(m => ({ default: m.ProcurementValidationPage })));
const EvidenceReviewPage = lazy(() => import('./pages/koperasi/EvidenceReviewPage').then(m => ({ default: m.EvidenceReviewPage })));
const KoperasiProjectMonitoringPage = lazy(() => import('./pages/koperasi/ProjectMonitoringPage').then(m => ({ default: m.ProjectMonitoringPage })));
const IncidentReportingPage = lazy(() => import('./pages/koperasi/IncidentReportingPage').then(m => ({ default: m.IncidentReportingPage })));

// Admin Pages
const AdminDashboardOverviewPage = lazy(() => import('./pages/admin/AdminDashboardOverviewPage').then(m => ({ default: m.AdminDashboardOverviewPage })));
const AdminProjectsPage = lazy(() => import('./pages/admin/AdminProjectsPage').then(m => ({ default: m.AdminProjectsPage })));
const PublicationReviewPage = lazy(() => import('./pages/admin/PublicationReviewPage').then(m => ({ default: m.PublicationReviewPage })));
const CooperativesPage = lazy(() => import('./pages/admin/CooperativesPage').then(m => ({ default: m.CooperativesPage })));
const IncidentsPage = lazy(() => import('./pages/admin/IncidentsPage').then(m => ({ default: m.IncidentsPage })));
const RecoveryRefundsPage = lazy(() => import('./pages/admin/RecoveryRefundsPage').then(m => ({ default: m.RecoveryRefundsPage })));
const DisputesPage = lazy(() => import('./pages/admin/DisputesPage').then(m => ({ default: m.DisputesPage })));
const AuditTrailPage = lazy(() => import('./pages/admin/AuditTrailPage').then(m => ({ default: m.AuditTrailPage })));

// Public Pages
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const FAQ = lazy(() => import('./pages/FAQ').then(m => ({ default: m.FAQ })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
import { TopBarLayout } from './components/layout/TopBarLayout';
import type { NavItem } from './components/layout/TopBarLayout';

const publicNavItems: NavItem[] = [
  { title: 'Beranda', href: '/' },
  { title: 'Proyek', href: '/projects' },
  { title: 'FAQ', href: '/faq' },
];

const PublicLayout = () => {
  return (
    <TopBarLayout navItems={publicNavItems}>
      <Outlet />
    </TopBarLayout>
  );
};

const RootLayout = () => {
  return (
    <ColdStartProvider>
      <AuthProvider>
        <Suspense fallback={<DashboardSkeleton />}>
          <Outlet />
        </Suspense>
      </AuthProvider>
    </ColdStartProvider>
  );
};

const UnauthorizedPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
    <h1 className="text-3xl font-bold text-red-600 mb-2">Akses Ditolak</h1>
    <p className="text-gray-600 mb-6">
      Anda tidak memiliki izin untuk mengakses halaman ini.
    </p>
    <a href="/" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
      Kembali ke Beranda
    </a>
  </div>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/faq', element: <FAQ /> },
      { path: '/unauthorized', element: <UnauthorizedPage /> },
      {
        element: <PublicLayout />,
        children: [
          { path: '/projects', element: <DiscoverProjectsPage /> },
          { path: '/projects/:projectId', element: <ProjectDetailPage /> },
        ]
      },
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ]
      },

      // ── Pendana Routes ──────────────────────────────────────────────
      {
        path: '/pendana',
        element: <ProtectedRoute allowedRoles={['PENDANA']} />,
        children: [
          {
            element: <PendanaDashboard />,
            children: [
              { index: true, element: <PendanaDashboardOverviewPage /> },
              { path: 'discover', element: <DiscoverProjectsPage /> },
              { path: 'discover/:projectId', element: <ProjectDetailPage /> },
              { path: 'contributions', element: <MyContributionsPage /> },
              { path: 'contributions/:contributionId', element: <ContributionDetailPage /> },
              { path: 'monitoring', element: <PendanaProjectMonitoringPage /> },
              { path: 'natura', element: <NaturaTrackingPage /> },
              { path: 'complaints', element: <ComplaintsPage /> },
              { path: 'profile', element: <ProfilePage /> },
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
              { index: true, element: <UmkmDashboardOverviewPage /> },
              { path: 'discover', element: <DiscoverProjectsPage /> },
              { path: 'discover/:projectId', element: <ProjectDetailPage /> },
              { path: 'projects', element: <MyProjectsPage /> },
              { path: 'projects/create', element: <CreateProjectPage /> },
              { path: 'projects/:projectId', element: <UmkmProjectDetailPage /> },
              { path: 'projects/:projectId/guarantee', element: <GuaranteePaymentPage /> },
              { path: 'projects/:projectId/procurement', element: <ProcurementPage /> },
              { path: 'projects/:projectId/procurement/create', element: <CreateProcurementPage /> },
              { path: 'projects/:projectId/execution', element: <ProjectExecutionPage /> },
              { path: 'profile', element: <ProfilePage /> },
              { path: 'complaints', element: <ComplaintsPage /> },
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
              { path: 'procurement', element: <ProcurementValidationPage /> },
              { path: 'evidence', element: <EvidenceReviewPage /> },
              { path: 'monitoring', element: <KoperasiProjectMonitoringPage /> },
              { path: 'incidents', element: <IncidentReportingPage /> },
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
              { index: true, element: <AdminDashboardOverviewPage /> },
              { path: 'projects', element: <AdminProjectsPage /> },
              { path: 'projects/:projectId/review', element: <PublicationReviewPage /> },
              { path: 'cooperatives', element: <CooperativesPage /> },
              { path: 'incidents', element: <IncidentsPage /> },
              { path: 'recovery', element: <RecoveryRefundsPage /> },
              { path: 'refunds', element: <RecoveryRefundsPage /> },
              { path: 'disputes', element: <DisputesPage /> },
              { path: 'audit', element: <AuditTrailPage /> },
            ]
          }
        ]
      },

      // ── Catch-all (404 Not Found) ───────────────────────────────────
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
