import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, User, Clock, Wallet, Calendar, AlertCircle } from 'lucide-react';

const StaffSummary = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Member';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, pRes, iRes] = await Promise.all([
          axios.get('/api/attendance/me', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/payouts/me', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/issues', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setAttendance(Array.isArray(aRes.data) ? aRes.data : []);
        setPayouts(Array.isArray(pRes.data) ? pRes.data : []);
        setRecentIssues(Array.isArray(iRes.data) ? iRes.data.slice(0, 3) : []);
      } catch (err) {
        console.error('Staff fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /> Fetching profile...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px' }}>Attendance Status</h3>
          <p style={{ color: 'var(--text-muted)' }}>Records for this month: {attendance.length}</p>
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '12px', fontWeight: 600 }}>SYSTEM OPERATIONAL ✅</div>
        </div>
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px' }}>Payout Records</h3>
          <p style={{ color: 'var(--text-muted)' }}>Total transactions: {payouts.length}</p>
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', borderRadius: '12px', fontWeight: 600 }}>SAFE MODE ACTIVE 🛡️</div>
        </div>
      </div>

      <div style={{ marginTop: '32px', padding: '32px', background: 'var(--bg-sec)', borderRadius: '24px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Maintenance Alerts</h3>
          <div style={{ background: 'var(--primary)', color: 'black', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 900 }}>LIVE FEED</div>
        </div>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          {recentIssues.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No active technical issues to report.</p>
          ) : (
            recentIssues.map(issue => (
              <div key={issue._id} style={{ padding: '16px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '8px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', borderRadius: '10px' }}>
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{issue.description}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{issue.category} • Reported by {issue.reporter?.name || 'Staff'}</p>
                  </div>
                </div>
                <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '4px 8px', background: 'var(--bg-sec)', borderRadius: '8px' }}>{issue.status}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffSummary;
