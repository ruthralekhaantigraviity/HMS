import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('hms_token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Logic to fetch user profile could go here
      const savedUser = JSON.parse(localStorage.getItem('hms_user'));
      if (savedUser) setUser(savedUser);
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
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
    setToken(null);
    setUser(null);
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, verifyOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
