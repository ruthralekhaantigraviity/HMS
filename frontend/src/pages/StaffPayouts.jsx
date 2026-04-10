import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { IndianRupee, CheckCircle, Loader2, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StaffPayouts = () => {
  const { user, token } = useAuth();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState(null);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const res = await axios.get('/api/payouts/me');
        setPayouts(res.data);
      } catch (err) {
        console.error('Error fetching payouts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayouts();
  }, [token]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={48} color="var(--primary)" /></div>;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '8px' }}>Salary & Payout Records</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>View your monthly earnings and download official payslips.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '40px' }}>
         <div className="glass-card" style={{ padding: '32px', borderLeft: '4px solid var(--success)' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '16px' }}>
                   <IndianRupee size={32} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Current Monthly Base</p>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>₹{user?.salary || 0}</h2>
                </div>
            </div>
         </div>
         <div className="glass-card" style={{ padding: '32px', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', borderRadius: '16px' }}>
                   <Calendar size={32} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total Months Paid</p>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{payouts.length}</h2>
                </div>
            </div>
         </div>
      </div>

      <div className="glass-card" style={{ padding: '32px' }}>
        {payouts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.2 }} />
            <p style={{ color: 'var(--text-muted)' }}>No salary payouts recorded yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Month</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Document</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '18px 16px', fontWeight: 700 }}>{p.month}</td>
                    <td style={{ padding: '18px 16px', fontWeight: 800, color: 'var(--success)' }}>₹{p.amount.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '18px 16px', fontSize: '14px', color: 'var(--text-muted)' }}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td style={{ padding: '18px 16px' }}>
                       <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '4px 10px', borderRadius: '20px' }}>{p.status.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '18px 16px', textAlign: 'right' }}>
                       <button 
                        onClick={() => setSelectedPayout(p)}
                        className="hover-glow" 
                        style={{ background: 'var(--primary)', color: 'var(--bg-dark)', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                       >
                         VIEW PAYSLIP
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payslip Modal (Re-using the same high-fidelity design) */}
      {selectedPayout && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--glass-overlay)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setSelectedPayout(null)}>
           <div 
             className="animate-slide-up" 
             style={{ background: '#fff', color: '#1a1a1a', width: '100%', maxWidth: '700px', padding: '60px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} 
             onClick={e => e.stopPropagation()}
           >
              <button onClick={() => setSelectedPayout(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' }}>&times;</button>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #f0f0f0', paddingBottom: '30px', marginBottom: '40px' }}>
                 <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '5px', color: '#1a1a1a' }}>HOTEL GLITZ</h2>
                    <p style={{ fontSize: '13px', color: '#666' }}>LUXURY HOSPITALITY & MANAGEMENT</p>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#1a1a1a' }}>PAYSLIP</h1>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#444' }}>{selectedPayout.month.toUpperCase()}</p>
                 </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                 <div><label style={{ fontSize: '11px', color: '#888', fontWeight: 800 }}>EMPLOYEE NAME</label><p style={{ fontSize: '16px', fontWeight: 700 }}>{user?.name}</p></div>
                 <div><label style={{ fontSize: '11px', color: '#888', fontWeight: 800 }}>DESIGNATION</label><p style={{ fontSize: '16px', fontWeight: 700, textTransform: 'capitalize' }}>{user?.role}</p></div>
              </div>

              <div style={{ marginBottom: '40px' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: '#f8f9fa' }}><th style={{ padding: '12px', textAlign: 'left', fontSize: '12px' }}>DESCRIPTION</th><th style={{ padding: '12px', textAlign: 'right', fontSize: '12px' }}>AMOUNT (INR)</th></tr></thead>
                    <tbody>
                       <tr><td style={{ padding: '15px', fontSize: '14px', borderBottom: '1px solid #f0f0f0' }}>Basic Salary (80%)</td><td style={{ padding: '15px', textAlign: 'right', fontSize: '14px', fontWeight: 700 }}>₹{(selectedPayout.amount * 0.8).toLocaleString('en-IN')}</td></tr>
                       <tr><td style={{ padding: '15px', fontSize: '14px', borderBottom: '1px solid #f0f0f0' }}>Allowances (20%)</td><td style={{ padding: '15px', textAlign: 'right', fontSize: '14px', fontWeight: 700 }}>₹{(selectedPayout.amount * 0.2).toLocaleString('en-IN')}</td></tr>
                       <tr style={{ background: '#f8f9fa' }}><td style={{ padding: '15px', fontSize: '16px', fontWeight: 900 }}>TOTAL NET PAID</td><td style={{ padding: '15px', textAlign: 'right', fontSize: '18px', fontWeight: 900 }}>₹{selectedPayout.amount.toLocaleString('en-IN')}</td></tr>
                    </tbody>
                 </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '60px' }}>
                 <p style={{ fontSize: '12px', color: '#888' }}>Generated on: {new Date().toLocaleDateString()}</p>
                 <div style={{ textAlign: 'right' }}>
                    <CheckCircle size={40} color="#10b981" style={{ marginBottom: '5px' }} />
                    <p style={{ fontSize: '14px', fontWeight: 900, color: '#10b981' }}>VERIFIED</p>
                 </div>
              </div>

              <div style={{ marginTop: '40px', textAlign: 'center' }}>
                 <button onClick={() => window.print()} style={{ padding: '14px 40px', background: '#1a1a1a', color: '#fff', border: 'none', fontWeight: 900, cursor: 'pointer' }}>PRINT / EXPORT</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StaffPayouts;
