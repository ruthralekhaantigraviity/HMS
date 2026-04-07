import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyOTP } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  if (!email) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await verifyOTP(email, otp);
      toast.success('Identity verified! Welcome to HMS Elite.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Invalid or expired OTP');
      setError(err.response?.data?.msg || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <button onClick={() => navigate('/login')} style={{ background: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '1.5rem', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Back to login
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--success)', borderRadius: '12px', color: 'var(--bg-dark)', marginBottom: '1rem' }}>
            <Shield size={32} />
          </div>
          <h1>Verify OTP</h1>
          <p style={{ color: 'var(--text-muted)' }}>We sent a code to {email}</p>
        </div>

        {location.state?.otp && (
          <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px dashed var(--primary)', color: 'var(--primary)', padding: '15px', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Testing Code</p>
            <h2 style={{ fontSize: '24px', letterSpacing: '4px' }}>{location.state.otp}</h2>
          </div>
        )}

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '10px', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>6-Digit Code</label>
            <input 
              type="text" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              placeholder="000000" 
              maxLength="6"
              style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: '700' }}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Enter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
