import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, CheckCircle, Clock, Trash2, Loader2, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Queries = () => {
  const { token } = useAuth();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/queries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQueries(res.data);
    } catch (err) {
      console.error('Error fetching queries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [token]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/queries/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQueries();
    } catch (err) {
      console.error('Error updating query status:', err);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'New': return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
      case 'In Progress': return { background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' };
      case 'Resolved': return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      default: return { background: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af' };
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1>Guest Queries</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage inquiries and feedback submitted via the landing page.</p>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}><Loader2 size={32} className="animate-spin" /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {queries.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No guest queries found.
            </div>
          ) : (
            queries.map(q => (
              <div key={q._id} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'var(--surface)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <User size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '2px' }}>{q.subject}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>From: <strong>{q.name}</strong> ({q.email})</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '11px', 
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      ...getStatusStyle(q.status)
                    }}>
                      {q.status}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border)', fontSize: '14px', lineHeight: '1.6' }}>
                  {q.message}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {q.status !== 'Resolved' && (
                    <button 
                      onClick={() => updateStatus(q._id, 'Resolved')}
                      className="btn"
                      style={{ padding: '8px 16px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <CheckCircle size={16} /> Mark Resolved
                    </button>
                  )}
                  {q.status === 'New' && (
                    <button 
                      onClick={() => updateStatus(q._id, 'In Progress')}
                      className="btn"
                      style={{ padding: '8px 16px', background: 'var(--primary)', color: 'var(--bg-dark)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Clock size={16} /> Start Review
                    </button>
                  )}
                  <a 
                    href={`mailto:${q.email}`}
                    className="btn"
                    style={{ padding: '8px 16px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                  >
                    <Mail size={16} /> Reply via Email
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Queries;
