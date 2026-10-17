'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboardContent from '@/components/admin/AdminDashboardContent';

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}