import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { UserCheck, UserX, Clock, Calendar, DollarSign, Save, Loader2, Send, CheckCircle, Receipt, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('attendance');
  const [staff, setStaff] = useState([]);
  const [history, setHistory] = useState([]);
  const [attendance, setAttendance] = useState({}); // { userId: status }
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const dateInputRef = useRef(null);

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [staffRes, historyRes, attRes] = await Promise.all([
        axios.get('/api/auth', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/payouts', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/attendance/date/${selectedDate}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setStaff(staffRes.data.filter(u => u.role !== 'superadmin')); 
      setHistory(historyRes.data);
      
      const attMap = {};
      attRes.data.forEach(a => {
        attMap[a.user._id || a.user] = a.status;
      });
      setAttendance(attMap);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, selectedDate, activeTab]);

  const handleIconClick = () => {
    if (dateInputRef.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const handleMarkAttendance = async (userId, status) => {
    try {
      await axios.post('/api/attendance', 
        { userId, status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttendance(prev => ({ ...prev, [userId]: status }));
    } catch (err) {
      console.error('Attendance Error:', err);
    }
  };

  const handleRelease = async () => {
    if (!selectedStaff) return;
    try {
      setReleasing(true);
      const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      await axios.post('/api/payouts/release', {
        userId: selectedStaff._id,
        amount: selectedStaff.salary || 1500, // Fallback for demo
        month
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setSelectedStaff(null);
      fetchData();
    } catch (err) {
      console.error('Release Error:', err);
    } finally {
      setReleasing(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Salary & Attendance</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track daily staff attendance and manage payroll disbursements.</p>
        </div>

        {activeTab === 'attendance' && (
          <div 
            onClick={handleIconClick}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              background: 'var(--surface)', 
              padding: '8px 16px', 
              border: '1px solid var(--border)', 
              borderRadius: '0',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
            className="hover-card"
          >
            <Calendar size={18} color="var(--primary)" />
            <input 
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{ 
                background: 'transparent', 
                color: 'var(--text-main)', 
                border: 'none', 
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                colorScheme: 'light dark'
              }}
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', background: 'var(--surface)', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
        {['attendance', 'run payroll', 'payout history'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '8px 24px', 
              borderRadius: '8px', 
              textTransform: 'capitalize',
              background: activeTab === tab ? 'var(--primary)' : 'transparent',
              color: activeTab === tab ? 'var(--bg-dark)' : 'var(--text-muted)',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
      ) : activeTab === 'attendance' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '12px' }}><UserCheck size={24} /></div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Staff Present</p>
                  <h2 style={{ fontSize: '1.8rem' }}>
                    {Object.values(attendance).filter(s => s === 'Present').length} / {staff.length}
                  </h2>
                </div>
              </div>
            </div>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '12px' }}><UserX size={24} /></div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>On Leave</p>
                  <h2 style={{ fontSize: '1.8rem' }}>
                    {Object.values(attendance).filter(s => s === 'Leave').length}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 0 }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Attendance Registry</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Date</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Staff Name</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Role</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(s => {
                  const status = attendance[s._id] || 'Unmarked';
                  return (
                  <tr key={s._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      {new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{s.role}</td>
                     <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                       <span style={{ 
                         padding: '4px 10px', 
                         borderRadius: '20px', 
                         fontSize: '11px', 
                         background: status === 'Present' ? 'rgba(16, 185, 129, 0.1)' : status === 'Leave' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', 
                         color: status === 'Present' ? 'var(--success)' : status === 'Leave' ? 'var(--danger)' : 'var(--text-muted)',
                         fontWeight: 700
                       }}>
                         {status.toUpperCase()}
                       </span>
                     </td>
                   </tr>
                 )})}
              </tbody>
            </table>
          </div>
        </>
      ) : activeTab === 'run payroll' ? (
        <div className="glass-card" style={{ padding: 0 }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <h3>Monthly Payroll ({new Date().toLocaleString('default', { month: 'long' })})</h3>
            <button className="btn btn-primary" style={{ fontSize: '13px' }}><Send size={16} /> Release All</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Staff Member</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Base Salary</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Deductions</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{s.role}</div>
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 700 }}>₹{s.salary || 15000}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--danger)' }}>-₹0</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => setSelectedStaff(s)}
                      style={{ padding: '8px 16px', background: 'var(--primary)', color: 'var(--bg-dark)', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                    >
                      Release Salary
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0 }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}><h3>Payout History</h3></div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Staff Name</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Month</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Amount</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Status</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No payout records found.</td></tr>
              ) : history.map(h => (
                <tr key={h._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-main)' }}>{h.user?.name}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{h.month}</td>
                  <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>₹{h.amount}</td>
                  <td style={{ padding: '16px 24px' }}><span style={{ color: 'var(--success)', fontWeight: 700 }}>● PAID</span></td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}><Receipt size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Release Confirmation Modal */}
      {selectedStaff && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card animate-fade-in" style={{ maxWidth: '450px', width: '100%', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Release Salary</h2>
              <button onClick={() => setSelectedStaff(null)} style={{ background: 'none', color: 'var(--text-muted)' }}><X size={24} /></button>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', color: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 'bold', fontSize: '1.5rem' }}>
                  {selectedStaff.name.charAt(0)}
                </div>
                <h3 style={{ fontSize: '1.2rem' }}>{selectedStaff.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', textTransform: 'capitalize' }}>{selectedStaff.role}</p>
              </div>

              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Pay Cycle</span>
                  <span>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Base Salary</span>
                  <span style={{ fontWeight: 700 }}>₹{selectedStaff.salary || 15000}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '12px' }}>
                  <span style={{ fontWeight: 600 }}>Total Payout</span>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--success)' }}>₹{selectedStaff.salary || 15000}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleRelease}
              disabled={releasing}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '16px', borderRadius: '12px', height: 'auto', fontSize: '1.1rem', justifyContent: 'center' }}
            >
              {releasing ? <Loader2 className="animate-spin" /> : 'Confirm Payment Release'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>This will record the transaction in the payouts history ledger.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
