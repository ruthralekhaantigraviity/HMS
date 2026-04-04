import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Search, Edit2, Trash2, Shield, UserCheck, Loader2, X, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('subadmins');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, title: '', message: '' });
  const [formData, setFormData] = useState({ 
    role: 'subadmin', permissions: [],
    phone: '', location: '', aadhar: '', pan: '', salary: 0
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/auth', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (perm) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm) 
        ? prev.permissions.filter(p => p !== perm) 
        : [...prev.permissions, perm]
    }));
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Leave blank unless changing
      role: user.role,
      permissions: user.permissions || [],
      phone: user.phone || '',
      location: user.location || '',
      aadhar: user.aadhar || '',
      pan: user.pan || '',
      salary: user.salary || 0
    });
    setSelectedUserId(user._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    const id = confirmModal.id;
    setConfirmModal({ ...confirmModal, show: false });
    try {
      await axios.delete(`http://localhost:5000/api/auth/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      showToast('User deleted successfully!');
    } catch (err) {
      showToast(err.response?.data?.msg || 'Error deleting user', 'error');
    }
  };

  const promptDelete = (id) => {
    setConfirmModal({
      show: true,
      id,
      title: 'Confirm Deletion',
      message: 'Are you sure you want to permanently remove this staff member? This action cannot be undone.'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/auth/${selectedUserId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast('User updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/auth/register', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast('User created successfully!');
      }
      setShowModal(false);
      setIsEditing(false);
      setSelectedUserId(null);
      setFormData({ name: '', email: '', password: '', role: 'subadmin', permissions: [], phone: '', location: '', aadhar: '', pan: '', salary: 0 });
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.msg || 'Error processing request', 'error');
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (activeTab === 'subadmins') return u.role === 'subadmin';
    if (activeTab === 'reception') return u.role === 'reception';
    if (activeTab === 'operations') return ['housekeeping', 'roomservice'].includes(u.role);
    return false;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>User Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your hotel staff, sub-admins, and permissions.</p>
        </div>
        <button onClick={() => { setIsEditing(false); setShowModal(true); }} className="btn btn-primary">
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '1px solid var(--border)' }}>
        {token && JSON.parse(atob(token.split('.')[1])).role === 'superadmin' && (
          <button 
            onClick={() => setActiveTab('subadmins')}
            style={{ padding: '12px 24px', background: 'none', color: activeTab === 'subadmins' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'subadmins' ? '2px solid var(--primary)' : 'none', fontWeight: 600 }}
          >
            Sub Admins
          </button>
        )}
        <button 
          onClick={() => setActiveTab('reception')}
          style={{ padding: '12px 24px', background: 'none', color: activeTab === 'reception' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'reception' ? '2px solid var(--primary)' : 'none', fontWeight: 600 }}
        >
          Reception Staff
        </button>
        <button 
          onClick={() => setActiveTab('operations')}
          style={{ padding: '12px 24px', background: 'none', color: activeTab === 'operations' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'operations' ? '2px solid var(--primary)' : 'none', fontWeight: 600 }}
        >
          Operations Staff
        </button>
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Name</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Email</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Password</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Permissions</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Status</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No staff found in this category.</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserCheck size={18} />
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>{user.email}</td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <code style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', color: 'var(--primary)', letterSpacing: '1px', minWidth: '100px', textAlign: 'center' }}>
                        {visiblePasswords[user._id] ? (user.plainPassword || 'password123') : '●●●●●●●●'}
                      </code>
                      <button 
                        onClick={() => togglePasswordVisibility(user._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                        title={visiblePasswords[user._id] ? "Hide Password" : "Show Password"}
                      >
                        {visiblePasswords[user._id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {user.permissions?.map(p => (
                        <span key={p} style={{ fontSize: '11px', padding: '4px 8px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', borderRadius: '4px' }}>{p}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ fontSize: '12px', color: user.isVerified ? 'var(--success)' : 'var(--danger)' }}>● {user.isVerified ? 'Active' : 'Pending'}</span>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button onClick={() => handleEdit(user)} style={{ background: 'none', color: 'var(--text-muted)', padding: '4px', cursor: 'pointer' }}><Edit2 size={16} /></button>
                    <button onClick={() => promptDelete(user._id)} style={{ background: 'none', color: 'var(--danger)', padding: '4px', marginLeft: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '40px' }}>
          <form onSubmit={handleSubmit} className="glass-card" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', scrollbarWidth: 'thin', position: 'relative' }}>
            <button 
              type="button" 
              onClick={() => setShowModal(false)} 
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '24px' }}>{isEditing ? 'Edit Existing User' : 'Add New User'}</h2>
            <div className="input-group">
              <label>Full Name</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Alex Johnson" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label>Email Address</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="alex@hms.com" required />
              </div>
              <div className="input-group">
                <label>Login Password</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={isEditing ? "(Change Password or leave blank)" : "Set Password"} required={!isEditing} />
              </div>
            </div>
            <div className="input-group">
              <label>Staff Role</label>
              <select 
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value})} 
                required
                style={{ width: '100%', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }}
              >
                <option value="subadmin">Sub Admin</option>
                <option value="reception">Receptionist</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="roomservice">Room Service</option>
              </select>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="input-group">
                <label>Phone Number</label>
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="9876543210" required />
              </div>
              <div className="input-group">
                <label>Monthly Salary</label>
                <input type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} placeholder="15000" />
              </div>
            </div>

            <div className="input-group">
              <label>Current Location / Address</label>
              <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Sector 12, New Delhi" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="input-group">
                <label>Aadhar Card No.</label>
                <input value={formData.aadhar} onChange={e => setFormData({...formData, aadhar: e.target.value})} placeholder="1234 5678 9012" />
              </div>
              <div className="input-group">
                <label>PAN Card No.</label>
                <input value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value})} placeholder="ABCDE1234F" />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>Assign Permissions</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {['Bookings', 'Rooms', 'Finance', 'Analytics', 'System Control'].map(p => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.permissions.includes(p)} onChange={() => togglePermission(p)} />
                    <span style={{ fontSize: '14px' }}>{p}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                className="btn" 
                style={{ 
                  flex: 1, 
                  background: 'var(--surface)', 
                  color: 'var(--text-main)', 
                  border: '1px solid var(--border)',
                  justifyContent: 'center'
                }}
              >
                Cancel
              </button>
              <button type="submit" disabled={creating} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                {creating ? <Loader2 className="animate-spin" size={18} /> : (isEditing ? 'Update User' : 'Create User')}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Toast Notification */}
      {toast.show && (
        <div style={{ 
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', 
          background: toast.type === 'error' ? 'var(--danger)' : 'var(--success)', 
          color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, 
          zIndex: 2000, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', display: 'flex', 
          alignItems: 'center', gap: '10px' 
        }}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {toast.message}
        </div>
      )}
      {/* Confirm Deletion Modal */}
      {confirmModal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div className="glass-card animate-scale-in" style={{ width: '400px', padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Trash2 size={32} />
            </div>
            <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>{confirmModal.title}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="btn" style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)', justifyContent: 'center' }}>Cancel</button>
              <button onClick={confirmDelete} className="btn" style={{ flex: 1, background: 'var(--danger)', color: 'white', border: 'none', justifyContent: 'center', fontWeight: 800 }}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
