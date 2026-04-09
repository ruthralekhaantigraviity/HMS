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

  useEffect(() => {
    console.log("!!! HMS USER MANAGEMENT UI v4.2.1 INITIALIZED !!!");
  }, []);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, title: '', message: '' });
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', role: 'subadmin', permissions: [],
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
      setUsers(Array.isArray(res.data) ? res.data : []);
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
      name: user.name || '',
      email: user.email || '',
      password: '', 
      role: user.role || 'subadmin',
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
    <div style={{ padding: '0 10px', position: 'relative' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '8px', letterSpacing: '-1px' }}>User Management</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ padding: '4px 12px', background: 'var(--primary)', color: 'black', borderRadius: '6px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>Secure Access v4.3.0-SYNC</span>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Configure administrative roles and granular staff permissions</p>
          </div>
        </div>
        <button 
          onClick={() => { 
            setIsEditing(false); 
            setFormData({ name: '', email: '', password: '', role: 'subadmin', permissions: [], phone: '', location: '', aadhar: '', pan: '', salary: 0 });
            setShowModal(true); 
          }} 
          style={{ height: '56px', padding: '0 32px', background: 'var(--primary)', color: 'black', borderRadius: '16px', fontWeight: 900, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 8px 25px rgba(212, 175, 55, 0.3)', border: 'none', cursor: 'pointer', transition: '0.3s' }}
        >
          <UserPlus size={22} /> Register Member
        </button>
      </div>

      {/* Tabs Section */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'var(--surface)', padding: '6px', borderRadius: '16px', width: 'fit-content', border: '1px solid var(--border)' }}>
        {[
          { id: 'subadmins', label: 'Sub-Admins', roles: ['subadmin'] },
          { id: 'reception', label: 'Reception', roles: ['reception'] },
          { id: 'operations', label: 'Operations', roles: ['housekeeping', 'roomservice'] }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              padding: '12px 24px', 
              borderRadius: '12px', 
              background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? 'black' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              transition: '0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-sec)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 900 }}>Staff Profile</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 900 }}>Credentials</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 900 }}>System Privileges</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 900 }}>Status</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 900, textAlign: 'right' }}>Management</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center' }}><Loader2 className="animate-spin" size={32} color="var(--primary)" /></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>No active members found in this cluster.</td></tr>
              ) : filteredUsers.map(member => (
                <tr key={member._id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--bg-sec)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', fontWeight: 900, fontSize: '1.2rem' }}>
                        {member.name?.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '15px' }}>{member.name}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{member.role}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 600, marginBottom: '6px' }}>{member.email}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <code style={{ background: 'var(--bg-sec)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', color: 'var(--primary)', border: '1px solid var(--border)', fontWeight: 700 }}>
                        {visiblePasswords[member._id] ? (member.plainPassword || '••••••••') : '••••••••'}
                      </code>
                      <button onClick={() => togglePasswordVisibility(member._id)} style={{ padding: '4px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        {visiblePasswords[member._id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {member.permissions?.map(p => (
                        <span key={p} style={{ fontSize: '10px', padding: '4px 10px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', borderRadius: '6px', fontWeight: 800, border: '1px solid rgba(212, 175, 55, 0.2)' }}>{p}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: member.isVerified ? 'var(--success)' : 'var(--danger)' }}></div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: member.isVerified ? 'var(--success)' : 'var(--danger)' }}>{member.isVerified ? 'Verified' : 'Pending'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button onClick={() => handleEdit(member)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-sec)', color: 'var(--text-main)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit2 size={16} /></button>
                      <button onClick={() => promptDelete(member._id)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Registration Modal */}
      {showModal && (
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
            onSubmit={handleSubmit} 
            className="animate-scale-in" 
            style={{ 
              width: '100%', 
              maxWidth: '640px', 
              maxHeight: '90vh', 
              overflowY: 'auto', 
              background: '#ffffff', 
              borderRadius: '32px', 
              border: '1px solid rgba(212, 175, 55, 0.4)', 
              boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)',
              position: 'relative',
              padding: '0'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(to right, rgba(212,175,55,0.08), transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '4px' }}>{isEditing ? 'Update Credentials' : 'Member Registration'}</h2>
                <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Global Access Identifier</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--bg-sec)', color: 'var(--text-main)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '40px' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#d4af37', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Full Legal Name</label>
                <input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Alex Johnson" 
                  required 
                  style={{ width: '100%', padding: '16px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-main)', fontSize: '15px', fontWeight: 600 }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#d4af37', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Professional Email</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    placeholder="alex@glitz.com" 
                    required 
                    style={{ width: '100%', padding: '16px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-main)', fontSize: '15px', fontWeight: 600 }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#d4af37', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Access Password</label>
                  <input 
                    type="password" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    placeholder={isEditing ? "••••••••" : "Set Password"} 
                    required={!isEditing} 
                    style={{ width: '100%', padding: '16px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-main)', fontSize: '15px', fontWeight: 600 }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#d4af37', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Primary Contact</label>
                  <input 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    placeholder="91XXXXXXXX" 
                    required 
                    style={{ width: '100%', padding: '16px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-main)', fontSize: '15px', fontWeight: 600 }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#d4af37', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Department Role</label>
                  <select 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})} 
                    required
                    style={{ width: '100%', padding: '16px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-main)', fontSize: '15px', fontWeight: 700, outline: 'none' }}
                  >
                    <option value="subadmin">Sub Admin</option>
                    <option value="reception">Receptionist</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="roomservice">Room Service</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#d4af37', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Assigned Operations Permissions</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-sec)', padding: '24px', borderRadius: '18px', border: '1px solid var(--border)' }}>
                  {['Bookings', 'Rooms', 'Finance', 'Analytics', 'System Control'].map(p => (
                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                      <input type="checkbox" checked={formData.permissions.includes(p)} onChange={() => togglePermission(p)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#d4af37', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Monthly Salary (₹)</label>
                  <input type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} placeholder="Salary Amount" style={{ width: '100%', padding: '16px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-main)', fontSize: '15px', fontWeight: 600 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#d4af37', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Verification Ref (UID)</label>
                  <input value={formData.aadhar} onChange={e => setFormData({...formData, aadhar: e.target.value})} placeholder="Aadhar/PAN Card" style={{ width: '100%', padding: '16px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-main)', fontSize: '15px', fontWeight: 600 }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  style={{ flex: 1, padding: '18px', borderRadius: '16px', background: 'var(--bg-sec)', border: '1px solid var(--border)', color: 'var(--text-main)', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={creating} 
                  style={{ flex: 2, padding: '18px', borderRadius: '16px', background: 'var(--primary)', border: 'none', color: 'black', fontWeight: 900, fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 25px rgba(212, 175, 55, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {creating ? <Loader2 className="animate-spin" size={24} /> : (isEditing ? 'Commit Changes' : 'Finalize Registration')}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(255, 255, 255, 0.4)', 
          backdropFilter: 'blur(20px)', 
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 99999, 
          padding: '20px' 
        }}>
          <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '420px', padding: '48px', textAlign: 'center', background: 'var(--surface)', borderRadius: '28px' }}>
            <div style={{ width: '84px', height: '84px', borderRadius: '24px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
              <Trash2 size={42} />
            </div>
            <h3 style={{ marginBottom: '12px', fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>Final Deletion</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6, fontWeight: 500 }}>This will permanently terminate the system access for this member. Are you absolutely certain?</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'var(--bg-sec)', border: '1px solid var(--border)', color: 'var(--text-main)', fontWeight: 800, cursor: 'pointer' }}>Hold Back</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'var(--danger)', color: 'white', border: 'none', fontWeight: 900, cursor: 'pointer', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast System */}
      {toast.show && (
        <div style={{ 
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', 
          background: toast.type === 'error' ? 'var(--danger)' : 'var(--text-main)', 
          color: toast.type === 'error' ? 'white' : 'var(--bg-main)', 
          padding: '16px 32px', borderRadius: '20px', fontWeight: 900, 
          zIndex: 4000, boxShadow: '0 20px 50px rgba(0,0,0,0.5)', display: 'flex', 
          alignItems: 'center', gap: '14px', border: '1px solid rgba(255,255,255,0.1)' 
        }} className="animate-fade-in">
          {toast.type === 'error' ? <AlertCircle size={22} /> : <CheckCircle size={22} color="var(--primary)" />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
