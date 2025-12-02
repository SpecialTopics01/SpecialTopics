import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CitizenAuth } from './pages/CitizenAuth';
import { AdminAuth } from './pages/AdminAuth';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
function AppRoutes() {
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
  // Redirect authenticated users to their dashboard
  if (user && profile) {
    const dashboardPath = profile.user_type === 'citizen' ? '/citizen/dashboard' : '/admin/dashboard';
    return <Routes>
        <Route path="/" element={<Navigate to={dashboardPath} replace />} />
        <Route path="/admin" element={<Navigate to={dashboardPath} replace />} />

        <Route path="/citizen/dashboard" element={<ProtectedRoute requiredUserType="citizen">
              <CitizenDashboard />
            </ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute requiredUserType="admin">
              <AdminDashboard />
            </ProtectedRoute>} />

        <Route path="*" element={<Navigate to={dashboardPath} replace />} />
      </Routes>;
  }
  // Routes for unauthenticated users
  return <Routes>
      <Route path="/" element={<CitizenAuth />} />
      <Route path="/admin" element={<AdminAuth />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>;
}
export function App() {
  return <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>;
}