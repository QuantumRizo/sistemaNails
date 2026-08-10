import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from './components/Common/Toast'
import ErrorBoundary from './components/Common/ErrorBoundary'
import Sidebar from './components/Layout/Sidebar'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import { SucursalProvider } from './context/SucursalContext'
import { RefreshCw } from 'lucide-react'
import SucursalGuard from './components/Common/SucursalGuard'
import type { Cliente } from './types/database'

const AgendaPage = lazy(() => import('./pages/AgendaPage'))
const ClientesPage = lazy(() => import('./pages/ClientesPage'))
const InventarioPage = lazy(() => import('./pages/InventarioPage'))
const AdministracionPage = lazy(() => import('./pages/AdministracionPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
const BookingPage = lazy(() => import('./pages/BookingPage'))
const ServiceFamilyPage = lazy(() => import('./pages/ServiceFamilyPage'))
const InicioPage = lazy(() => import('./pages/InicioPage'))
const AnalisisPage = lazy(() => import('./pages/AnalisisPage'))
const CajaPage = lazy(() => import('./pages/CajaPage'))
const VentaDirectaPage = lazy(() => import('./pages/VentaDirectaPage'))
const MarketingPage = lazy(() => import('./pages/MarketingPage'))
const AsistenciaPage = lazy(() => import('./pages/AsistenciaPage'))
const VacacionesPage = lazy(() => import('./pages/VacacionesPage'))
const AccesosPage = lazy(() => import('./pages/AccesosPage'))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } }, // 1 min — evita refetch innecesario al navegar entre páginas
})

function AppLoading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--accent)' }} aria-label="Cargando" />
    </div>
  )
}

// ─── ADMIN LAYOUT SHELL ──────────────────────────────────────────
// Wraps all /admin/* routes — handles auth checks and renders Sidebar + Outlet
function AdminShell() {
  const { session, loading, profile } = useAuthContext()
  const location = useLocation()

  // 1. Auth state still loading
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )

  // 2. No session → Login
  if (!session) return <Navigate to="/login" replace />

  // 3. Session active but profile still loading
  if (profile === undefined) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )

  // 4. Redirect /admin exactly → default section by role
  if (location.pathname === '/admin' || location.pathname === '/admin/') {
    const defaultPath = profile?.rol === 'empleado' ? '/admin/agenda' : '/admin/inicio'
    return <Navigate to={defaultPath} replace />
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Outlet />
      </div>
    </div>
  )
}

// ClientesPage needs to navigate to Agenda with a pre-selected client.
// We use router location.state for this.
function ClientesWrapper() {
  const navigate = useNavigate()
  return (
    <ClientesPage
      onGoToAgenda={(c: Cliente) => navigate('/admin/agenda', { state: { preselectedCliente: c } })}
    />
  )
}

// AgendaPage reads preselectedCliente from location.state and clears it after use
function AgendaWrapper() {
  const location = useLocation()
  const navigate = useNavigate()
  const preselectedCliente = (location.state as { preselectedCliente?: Cliente } | null)?.preselectedCliente ?? null

  // Clear the state from history so refresh doesn't re-apply it
  useEffect(() => {
    if (preselectedCliente) {
      navigate('/admin/agenda', { replace: true, state: {} })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AgendaPage
      preselectedCliente={preselectedCliente}
      onClearPreselected={() => navigate('/admin/agenda', { replace: true, state: {} })}
    />
  )
}

function AuthWrapper() {
  const { session, loading } = useAuthContext()
  if (loading) return null
  if (session) return <Navigate to="/admin" replace />
  return <LoginPage />
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider queryClient={queryClient}>
          <SucursalProvider>
            <ToastProvider>
              <BrowserRouter>
                <Suspense fallback={<AppLoading />}>
                  <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/servicios/:slug" element={<ServiceFamilyPage />} />
                  <Route path="/reservar" element={<BookingPage />} />
                  <Route path="/login" element={<AuthWrapper />} />

                  {/* Admin Routes — nested under AdminShell layout */}
                  <Route path="/admin" element={<AdminShell />}>
                    <Route path="inicio"        element={<InicioPage />} />
                    <Route path="agenda"        element={<AgendaWrapper />} />
                    <Route path="asistencia"    element={<SucursalGuard><AsistenciaPage /></SucursalGuard>} />
                    <Route path="clientes"      element={<ClientesWrapper />} />
                    <Route path="inventario"    element={<InventarioPage />} />
                    <Route path="caja"          element={<SucursalGuard><CajaPage /></SucursalGuard>} />
                    <Route path="venta-directa" element={<SucursalGuard><VentaDirectaPage /></SucursalGuard>} />
                    <Route path="marketing"     element={<MarketingPage />} />
                    <Route path="analisis"      element={<AnalisisPage />} />
                    <Route path="administracion" element={<AdministracionPage />} />
                    <Route path="vacaciones"    element={<SucursalGuard><VacacionesPage /></SucursalGuard>} />
                    <Route path="accesos"       element={<AccesosPage />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </ToastProvider>
          </SucursalProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
