// ─────────────────────────────────────────────────────────────
// App — Router + protection des routes
// ─────────────────────────────────────────────────────────────
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Admin from './pages/Admin'

/** Spinner plein écran pendant la résolution de l'état d'auth. */
function Chargement() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div
        className="h-8 w-8 animate-spin-slow rounded-full border-2 border-transparent"
        style={{ borderTopColor: 'var(--or)', borderRightColor: 'var(--or)' }}
      />
    </div>
  )
}

/** Route protégée : redirige vers /login si non authentifié. */
function PrivateRoute({ children }) {
  const { user, chargement } = useAuth()
  if (chargement) return <Chargement />
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <Admin />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
