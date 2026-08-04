import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default AdminRoute