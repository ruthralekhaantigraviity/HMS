import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import VerifyOTP from './pages/VerifyOTP';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#d4af37' }}>
      Handshaking with HMS Elite...
    </div>
  );
  if (!token) return <Navigate to="/login" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  if (token) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  const { token, user, loading } = useAuth();
  
  if (!loading) {
    console.log(`App Render: Route requested, User: ${user?.name}, Role: ${user?.role}, Authenticated: ${!!token}`);
  }

  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#d4af37',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'Outfit, sans-serif',
            padding: '16px 24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 999999
          },
          success: {
            iconTheme: { primary: '#d4af37', secondary: 'black' }
          },
          error: {
            style: { background: '#ef4444', color: 'white', border: 'none' },
          }
        }}
      />
      <Routes>
        {/* Default to Dashboard (which will prompt for login if needed) */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        <Route path="/verify-otp" element={
          <PublicRoute>
            <VerifyOTP />
          </PublicRoute>
        } />

        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
