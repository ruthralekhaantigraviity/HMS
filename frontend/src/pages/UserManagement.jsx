import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { UserPlus, Search, Edit2, Trash2, Shield, UserCheck, Loader2, X, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
  const { user, token } = useAuth();
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
      const res = await axios.get('/api/auth');
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
      await axios.delete(`/api/auth/${id}`);
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
        await axios.put(`/api/auth/${selectedUserId}`, formData);
        showToast('User updated successfully!');
      } else {
        await axios.post('/api/auth/register', formData);
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
    const r = u.role?.toLowerCase();
    if (activeTab === 'subadmins') return r === 'subadmin';
    if (activeTab === 'reception') return r === 'reception';
    if (activeTab === 'operations') return ['housekeeping', 'roomservice'].includes(r);
    return false;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '8px' }}>User Management</h1>
          <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ padding: '2px 8px', background: 'var(--primary)', color: 'white', borderRadius: '4px', fontSize: '10px', fontWeight: 900 }}>v4.1.0</span>
            Manage hotel staff, sub-admins, and granular access permissions
          </p>
        </div>
        <button 
          onClick={() => { setIsEditing(false); setShowModal(true); }} 
          style={{ height: '52px', padding: '0 24px', background: 'var(--primary)', color: 'black', borderRadius: '14px', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(211, 175, 55, 0.2)' }}
        >
          <UserPlus size={20} /> Add New User
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '1px solid var(--border)' }}>
        {['superadmin', 'admin'].includes(user?.role?.toLowerCase()) && (
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
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-sec)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                        <UserCheck size={20} />
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>{user.email}</td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <code style={{ background: 'var(--bg-sec)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', color: 'var(--primary)', letterSpacing: '1px', border: '1px solid var(--border)', fontWeight: 700 }}>
                        {visiblePasswords[user._id] ? (user.plainPassword || 'password123') : '••••••••'}
                      </code>
                      <button 
                        onClick={() => togglePasswordVisibility(user._id)}
                        style={{ background: 'var(--bg-sec)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', transition: '0.2s' }}
                        title={visiblePasswords[user._id] ? "Hide Password" : "Show Password"}
                      >
                        {visiblePasswords[user._id] ? <EyeOff size={14} /> : <Eye size={14} />}
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} className="animate-fade-in">
          <form onSubmit={handleSubmit} className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '0', scrollbarWidth: 'thin', border: '1px solid rgba(212,175,55,0.2)', background: 'var(--surface)' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to right, rgba(212,175,55,0.05), transparent)' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '4px' }}>{isEditing ? 'Update Profile' : 'Register New User'}</h2>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{isEditing ? `Modifying ID: ${selectedUserId}` : 'System Access Generation'}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-sec)', color: 'var(--text-main)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '32px' }}>
              <div className="input-group">
                <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Full Legal Name</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Alex Johnson" required style={{ background: 'var(--bg-sec)', padding: '14px', borderRadius: '12px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="alex@hms.com" required style={{ background: 'var(--bg-sec)', padding: '14px', borderRadius: '12px' }} />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Account Password</label>
                  <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={isEditing ? "Leave blank to keep" : "Set Secure Password"} required={!isEditing} style={{ background: 'var(--bg-sec)', padding: '14px', borderRadius: '12px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact Number</label>
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="9876543210" required style={{ background: 'var(--bg-sec)', padding: '14px', borderRadius: '12px' }} />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>System Access Role</label>
                  <select 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})} 
                    required
                    style={{ width: '100%', padding: '14px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none', appearance: 'none' }}
                  >
                    <option value="subadmin">Sub Admin</option>
                    <option value="reception">Receptionist</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="roomservice">Room Service</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Permanent Address</label>
                <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Sector 12, New Delhi" style={{ background: 'var(--bg-sec)', padding: '14px', borderRadius: '12px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Salary (₹)</label>
                  <input type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} placeholder="15000" style={{ background: 'var(--bg-sec)', padding: '14px', borderRadius: '12px' }} />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Aadhar / PAN Ref</label>
                  <input value={formData.aadhar} onChange={e => setFormData({...formData, aadhar: e.target.value})} placeholder="ID Number" style={{ background: 'var(--bg-sec)', padding: '14px', borderRadius: '12px' }} />
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '16px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Administrative Privileges</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-sec)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  {['Bookings', 'Rooms', 'Finance', 'Analytics', 'System Control'].map(p => (
                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                      <input type="checkbox" checked={formData.permissions.includes(p)} onChange={() => togglePermission(p)} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  style={{ flex: 1, padding: '16px', borderRadius: '14px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={creating} 
                  style={{ flex: 2, padding: '16px', borderRadius: '14px', background: 'var(--primary)', border: 'none', color: 'black', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 15px rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {creating ? <Loader2 className="animate-spin" size={20} /> : (isEditing ? 'Update Records' : 'Register Member')}
                </button>
              </div>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }} className="animate-fade-in">
          <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '400px', padding: '40px', textAlign: 'center', background: 'var(--surface)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.1)' }}>
              <Trash2 size={40} />
            </div>
            <h3 style={{ marginBottom: '12px', fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{confirmModal.title}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '36px', lineHeight: 1.6, fontSize: '14px', fontWeight: 500 }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, show: false })} 
                style={{ flex: 1, padding: '16px', borderRadius: '14px', background: 'var(--bg-sec)', border: '1px solid var(--border)', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                style={{ flex: 1, padding: '14px', borderRadius: '14px', background: 'var(--danger)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 900, boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
