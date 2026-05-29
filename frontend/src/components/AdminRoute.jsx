import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function AdminRoute() {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />
}

export default AdminRoute
