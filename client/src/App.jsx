import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';

import Login        from './pages/Login';
import Signup       from './pages/Signup';
import Dashboard    from './pages/Dashboard';
import Projects     from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks        from './pages/Tasks';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <Layout><Projects /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/projects/:id" element={
            <ProtectedRoute>
              <Layout><ProjectDetail /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute>
              <Layout><Tasks /></Layout>
            </ProtectedRoute>
          } />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
              <h1 className="text-6xl font-bold text-gradient mb-2">404</h1>
              <p className="text-gray-500 mb-6">Page not found</p>
              <a href="/dashboard" className="btn-primary">Go to Dashboard</a>
            </div>
          } />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#ffffff', color: '#1f2937', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
            success: { iconTheme: { primary: '#059669', secondary: '#ffffff' } },
            error:   { iconTheme: { primary: '#dc2626', secondary: '#ffffff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
