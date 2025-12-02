import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserType } from '../lib/supabase';
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: UserType;
}
export function ProtectedRoute({
  children,
  requiredUserType
}: ProtectedRouteProps) {
  const {
    user,
    profile,
    loading
  } = useAuth();
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>;
  }
  if (!user || !profile) {
    return <Navigate to="/" replace />;
  }
  if (requiredUserType && profile.user_type !== requiredUserType) {
    const redirectPath = profile.user_type === 'citizen' ? '/citizen/dashboard' : '/admin/dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  return <>{children}</>;
}