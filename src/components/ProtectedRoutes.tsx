import { Navigate } from 'react-router-dom'
import { useAuth } from '../App'

export const Loader = () => (
  <div className="flex items-center justify-center min-h-screen">Loading...</div>
)

export const UserProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth()

  if (loading) return <Loader />

  return user ? children : <Navigate to="/login" replace />
}

export const AdminProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading, role, roleLoading } = useAuth()

  // Wait while auth or role are resolving
  if (loading || roleLoading) return <Loader />

  if (!user) return <Navigate to="/login" replace />

  if (role !== 'admin') return <Navigate to="/dashboard" replace />

  return children
}

export default AdminProtectedRoute
