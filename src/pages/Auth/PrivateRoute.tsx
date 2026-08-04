import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

export  function PrivateRoute({ children }: { children: React.ReactNode }) {
  // Inchangé — fonctionne pareil
const { user, loading } = useAuth();

if (loading) return <Spinner />;
if (!user)   return <Navigate to="/login" />;

  return children;
}

export function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) return null; // ou un spinner

  // ✅ Si déjà connecté → redirige vers dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
