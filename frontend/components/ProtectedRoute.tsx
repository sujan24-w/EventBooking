'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Unauthenticated users are redirected to login
        router.push('/login');
      } else if (requireAdmin && user.role !== 'ADMIN') {
        // Non-admin users trying to access admin pages are redirected to home
        router.push('/');
      }
    }
  }, [user, loading, requireAdmin, router]);

  if (loading) {
    return (
      <div className="text-center py-32">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-slate-500 text-sm font-medium">Verifying authorization...</p>
      </div>
    );
  }

  // Prevent rendering protected content if unauthenticated or unauthorized
  if (!user || (requireAdmin && user.role !== 'ADMIN')) {
    return null;
  }

  return <>{children}</>;
}