import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { AuthLayout } from './components/layout/AuthLayout';
import { ColdStartProvider } from './components/ColdStartProvider';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PendanaDashboard } from './pages/pendana/PendanaDashboard';
import { UmkmDashboard } from './pages/umkm/UmkmDashboard';
import { KoperasiDashboard } from './pages/koperasi/KoperasiDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Pendana Pages
import { DiscoverProjectsPage } from './pages/pendana/DiscoverProjectsPage';
import { ProjectDetailPage } from './pages/pendana/ProjectDetailPage';
import { MyContributionsPage } from './pages/pendana/MyContributionsPage';
import { ContributionDetailPage } from './pages/pendana/ContributionDetailPage';
import { ProjectMonitoringPage as PendanaProjectMonitoringPage } from './pages/pendana/ProjectMonitoringPage';
import { NaturaTrackingPage } from './pages/pendana/NaturaTrackingPage';
import { ComplaintsPage } from './pages/pendana/ComplaintsPage';
import { PendanaDashboardOverviewPage } from './pages/pendana/PendanaDashboardOverviewPage';

// UMKM Pages
import { MyProjectsPage } from './pages/umkm/MyProjectsPage';
import { CreateProjectPage } from './pages/umkm/CreateProjectPage';
import { ProjectDetailPage as UmkmProjectDetailPage } from './pages/umkm/ProjectDetailPage';
import { GuaranteePaymentPage } from './pages/umkm/GuaranteePaymentPage';
import { ProcurementPage } from './pages/umkm/ProcurementPage';
import { CreateProcurementPage } from './pages/umkm/CreateProcurementPage';
import { ProjectExecutionPage } from './pages/umkm/ProjectExecutionPage';
import { ProfilePage } from './pages/umkm/ProfilePage';
import { UmkmDashboardOverviewPage } from './pages/umkm/UmkmDashboardOverviewPage';

// Koperasi Pages
import { AssignedProjectsPage } from './pages/koperasi/AssignedProjectsPage';
import { AssessmentPage } from './pages/koperasi/AssessmentPage';
import { ProcurementValidationPage } from './pages/koperasi/ProcurementValidationPage';
import { EvidenceReviewPage } from './pages/koperasi/EvidenceReviewPage';
import { ProjectMonitoringPage as KoperasiProjectMonitoringPage } from './pages/koperasi/ProjectMonitoringPage';
import { IncidentReportingPage } from './pages/koperasi/IncidentReportingPage';

// Admin Pages
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { PublicationReviewPage } from './pages/admin/PublicationReviewPage';
import { CooperativesPage } from './pages/admin/CooperativesPage';
import { IncidentsPage } from './pages/admin/IncidentsPage';
import { RecoveryRefundsPage } from './pages/admin/RecoveryRefundsPage';
import { DisputesPage } from './pages/admin/DisputesPage';
import { AuditTrailPage } from './pages/admin/AuditTrailPage';

import { LandingPage } from './pages/LandingPage';
import { FAQ } from './pages/FAQ';

const RootLayout = () => {
  return (
    <ColdStartProvider>
      <AuthProvider>
        <Outlet />
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
              { index: true, element: <Navigate to="/admin/projects" replace /> },
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
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
