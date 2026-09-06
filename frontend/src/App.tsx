import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { ColdStartProvider } from './components/ColdStartProvider';

// Placeholder Auth Context & Protected Route Gate
const RootLayout = () => {
  return (
    <ColdStartProvider>
      <Outlet />
    </ColdStartProvider>
  );
};

// Placeholder Role Gate Component
const RoleGate = ({ allowedRoles }: { allowedRoles: string[] }) => {
  // TODO: Replace with actual auth context check
  const userRole = 'guest'; // For now, simulating unauthenticated
  
  if (userRole === 'guest') {
    return <Navigate to="/auth/login" replace />;
  }
  
  if (!allowedRoles.includes(userRole)) {
    return <div>Unauthorized Access</div>;
  }
  
  return <Outlet />;
};

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h1 className="text-4xl font-bold text-primary-700 mb-4">AgroFund</h1>
              <p className="text-gray-600 mb-8">Platform Peer-to-Peer Lending Syariah Agrikultur</p>
              <div className="flex gap-4 justify-center">
                <a href="/auth/login" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                  Masuk
                </a>
                <a href="/auth/register" className="px-6 py-2 bg-white text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition">
                  Daftar
                </a>
              </div>
            </div>
          </div>
        ),
      },
      {
        path: '/auth/login',
        element: <div className="p-8">Halaman Login (Placeholder)</div>,
      },
      {
        path: '/auth/register',
        element: <div className="p-8">Halaman Registrasi (Placeholder)</div>,
      },
      
      // Protected Routes based on Role
      {
        path: '/pendana',
        element: <RoleGate allowedRoles={['PENDANA']} />,
        children: [
          { index: true, element: <div className="p-8">Dashboard Pendana</div> }
        ]
      },
      {
        path: '/umkm',
        element: <RoleGate allowedRoles={['UMKM']} />,
        children: [
          { index: true, element: <div className="p-8">Dashboard UMKM</div> }
        ]
      },
      {
        path: '/koperasi',
        element: <RoleGate allowedRoles={['KOPERASI']} />,
        children: [
          { index: true, element: <div className="p-8">Dashboard Koperasi</div> }
        ]
      },
      {
        path: '/admin',
        element: <RoleGate allowedRoles={['ADMIN']} />,
        children: [
          { index: true, element: <div className="p-8">Dashboard AgroFund Admin</div> }
        ]
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
