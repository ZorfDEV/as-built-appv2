import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'  // adapte selon ton contexte auth

type ProtectedRouteProps = {
  children: React.ReactNode
  requiredRole?: 'admin' | 'user'
  redirectTo?: string
}

function ProtectedRoute({ 
  children, 
  requiredRole = 'admin',
  redirectTo = '/dashboard' 
}: ProtectedRouteProps) {
  const { user } = useAuth()

  // ✅ Si le rôle ne correspond pas → redirection
  if (requiredRole === 'admin' && user?.role !== 'admin') {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute