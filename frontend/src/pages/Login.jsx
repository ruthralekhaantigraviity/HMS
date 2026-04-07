import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Hotel } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      // If token is present, we skipped OTP (Staff)
      if (data.token) {
        toast.success(`Welcome back, ${data.user?.name || 'Staff'}`);
        navigate('/dashboard');
      } else {
        toast.success('Login successful! Please verify OTP.');
        navigate('/verify-otp', { state: { email, otp: data.otp } });
      }
    } catch (err) {
      if (!err.response) {
        toast.error('Server is unreachable. Please ensure the backend is running.');
        setError('Server reachable error');
      } else {
        toast.error(err.response?.data?.msg || 'Invalid credentials');
        setError(err.response?.data?.msg || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--primary)', borderRadius: '12px', color: 'var(--bg-dark)', marginBottom: '1rem' }}>
            <Hotel size={32} />
          </div>
          <h1>HMS Elite</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, please login</p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '10px', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@hotel.com" required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Processing...' : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
