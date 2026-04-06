import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('hms_token'));
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('hms_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    // Add interceptor for 401 errors
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn('Unauthorized request detected. Clearing session.');
          toast.error('Session expired. Please login again.', { id: 'session-expiry' });
          logout();
        }
        return Promise.reject(error);
      }
    );

    setLoading(false);
    console.log('AuthContext Ready: Token present:', !!token, 'Role:', user?.role);

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token, user]);

  const login = async (email, password) => {
    const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    
    // If token returned (Staff Bypass), set user/token now
    if (res.data.token) {
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('hms_token', newToken);
      localStorage.setItem('hms_user', JSON.stringify(userData));
    }
    
    return res.data;
  };


  const verifyOTP = async (email, otp) => {
    const res = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
    const { token: newToken, user: userData } = res.data;
    
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('hms_token', newToken);
    localStorage.setItem('hms_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    console.log('AuthContext: Logging out, clearing storage.');
    setToken(null);
    setUser(null);
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
  };

  const debugReset = () => {
    console.log('AuthContext: EMERGENCY RESET TRIGGERED.');
    logout();
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, verifyOTP, logout, debugReset }}>
      {children}
    </AuthContext.Provider>
  );
};
