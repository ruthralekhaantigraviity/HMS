import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import VerifyOTP from './pages/VerifyOTP';
import LandingPage from './pages/LandingPage';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#d4af37' }}>
      Handshaking with Hotel Glitz...
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
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1a1a1a',
            color: '#d4af37',
            border: '2px solid #d4af37',
            borderRadius: '0',
            fontSize: '1.1rem',
            fontWeight: '900',
            fontFamily: 'Outfit, sans-serif',
            padding: '20px 40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            zIndex: 999999,
            textAlign: 'center',
            letterSpacing: '1px'
          },
          success: {
            iconTheme: { primary: '#d4af37', secondary: 'black' },
          },
          error: {
            style: { 
              background: '#b91c1c', 
              color: '#ffffff', 
              border: '2px solid #ef4444',
              borderRadius: '0',
              fontWeight: '900'
            },
            iconTheme: { primary: '#ffffff', secondary: '#b91c1c' }
          }
        }}
      />
      <Routes>
        {/* Main Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
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
