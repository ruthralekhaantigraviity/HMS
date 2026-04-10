import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  AlertCircle, Plus, Filter, CheckCircle, Clock, 
  Trash2, Mail, Settings, X, Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const TechnicalIssues = () => {
  const { user, token } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueData, setIssueData] = useState({ description: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchIssues = async () => {
    try {
      const res = await axios.get('/api/issues');
      setIssues(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch issues', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchIssues();
  }, [token]);

  const handleReportIssue = async (e) => {
    e.preventDefault();
    if (!issueData.description) return toast.error('Please enter description');
    
    setIsUpdating(true);
    const reportPromise = axios.post('/api/issues', {
      description: issueData.description,
      category: 'IT',
      priority: 'High'
    }, {});

    toast.promise(reportPromise, {
      loading: 'Sending report to Management...',
      success: 'Issue reported successfully!',
      error: (err) => err.response?.data?.msg || 'Failed to report issue'
    });

    try {
      await reportPromise;
      setShowIssueModal(false);
      setIssueData({ description: '' });
      fetchIssues();
    } catch (err) {
      console.error('Report error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Urgent': case 'Critical': return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      case 'High': return { background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' };
      case 'Medium': return { background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' };
      default: return { background: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af' };
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Open': return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
      case 'In Progress': return { background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' };
      case 'Resolved': return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      default: return { background: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af' };
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /> Fetching technical reports...</div>;

  return (
    <div style={{ position: 'relative', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>Technical Issues</h1>
          <p style={{ color: 'var(--text-muted)' }}>Report and track system-wide technical problems and maintenance tasks.</p>
        </div>
        <button 
          onClick={() => setShowIssueModal(true)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '12px 28px', borderRadius: '30px', 
            fontSize: '14px', fontWeight: 900, 
            background: '#d4af37', color: 'white', 
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
          }}
        >
          <Plus size={20} /> Report Issue
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button className="btn" style={{ padding: '8px 20px', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700 }}>
          <Filter size={14} /> Filter Status
        </button>
        <button className="btn" style={{ padding: '8px 20px', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700 }}>
          <Filter size={14} /> Filter Priority
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {issues.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'var(--bg-sec)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
            <AlertCircle size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No technical issues reported yet.</p>
          </div>
        ) : (
          issues.map(issue => (
            <div key={issue._id} className="glass-card" style={{ padding: '24px', position: 'relative', borderLeft: `6px solid ${getPriorityStyle(issue.priority).color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', ...getPriorityStyle(issue.priority) }}>
                  {issue.priority} Priority
                </span>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', ...getStatusStyle(issue.status) }}>
                  {issue.status}
                </span>
              </div>
              
              <p style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '24px', lineHeight: '1.6', fontWeight: 500 }}>{issue.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#d4af37', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>
                       {issue.reporter?.name?.charAt(0) || 'S'}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{issue.reporter?.name || 'Staff'}</span>
                 </div>
                 <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(issue.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showIssueModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(255, 255, 255, 0.3)', 
          backdropFilter: 'blur(15px)', 
          WebkitBackdropFilter: 'blur(15px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999, 
          padding: '20px' 
        }} className="animate-fade-in">
          <form 
            onSubmit={handleReportIssue} 
            className="animate-scale-in" 
            style={{ 
              width: '100%', 
              maxWidth: '500px', 
              padding: '40px', 
              background: '#ffffff', 
              borderRadius: '32px', 
              border: '1px solid rgba(212, 175, 55, 0.4)', 
              boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Plus size={24} color="#d4af37" />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>Post Issue</h2>
               </div>
               <X onClick={() => setShowIssueModal(false)} style={{ cursor: 'pointer', color: 'var(--text-main)' }} />
            </div>
            <div style={{ marginBottom: '32px' }}>
               <label style={{ fontSize: '11px', fontWeight: 900, color: '#d4af37', marginBottom: '12px', display: 'block', letterSpacing: '1px' }}>COMMENT BOX</label>
               <textarea 
                  value={issueData.description} 
                  onChange={e => setIssueData({ description: e.target.value })} 
                  placeholder="Describe the issue in detail here..." 
                  style={{ width: '100%', minHeight: '180px', padding: '24px', borderRadius: '16px', background: 'var(--bg-sec)', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '16px', lineHeight: '1.6', resize: 'none' }} 
                  required 
               />
            </div>
            <button type="submit" disabled={isUpdating} style={{ width: '100%', height: '56px', background: '#d4af37', border: 'none', borderRadius: '16px', color: 'black', fontWeight: 900, fontSize: '16px', cursor: 'pointer', transition: '0.2s' }}>
               {isUpdating ? 'Submitting...' : 'Submit to Management'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TechnicalIssues;
