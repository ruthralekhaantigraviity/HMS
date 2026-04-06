import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, User, Phone, Mail, IdCard, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CustomerDetails = () => {
  const location = useLocation();
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(location.state?.search || '');

  useEffect(() => {
    if (location.state?.search) {
      setSearch(location.state.search);
      // Optional: Clear state after setting search to prevent stale search on manual navigation
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get('/api/bookings/customers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomers(res.data);
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [token]);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Customer Details</h1>
          <p style={{ color: 'var(--text-muted)' }}>View and manage guest registration records.</p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
          <input 
            style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)' }}
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>Guest Name</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>Contact Info</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>Identity Proof</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>Location</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No customers found.</td></tr>
              ) : filtered.map(customer => (
                <tr key={customer._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {customer.identityImage ? (
                          <img src={customer.identityImage} alt="ID" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={18} />
                        )}
                      </div>
                      <span style={{ fontWeight: 600 }}>{customer.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        <Phone size={14} /> {customer.phone}
                      </div>
                      {customer.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                          <Mail size={14} /> {customer.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
                        <IdCard size={16} color="var(--primary)" />
                        {customer.identityNumber || 'N/A'}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '24px' }}>{customer.identityType || 'Standard'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', fontSize: '14px' }}>
                    {customer.location || 'Not Specified'}
                  </td>
                  <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;
