import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Mail, UserCheck, Shield, Brush, Coffee, 
  Loader2, Phone, MapPin, CreditCard, X, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StaffDetailModal = ({ staff, onClose }) => {
  if (!staff) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
      <div className="glass-card animate-fade-in" style={{ maxWidth: '600px', width: '100%', padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, transparent 100%)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--primary)', color: 'var(--bg-dark)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
              {staff.name.charAt(0)}
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{staff.name}</h2>
              <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '12px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>{staff.role}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}><X size={28} /></button>
        </div>

        <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Identity Section */}
          <div>
            <h4 style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>Identity Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CreditCard size={18} color="var(--primary)" />
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Aadhar Card No.</p>
                  <p style={{ fontWeight: 600 }}>{staff.aadhar || 'Not Provided'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CreditCard size={18} color="var(--primary)" />
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PAN Card No.</p>
                  <p style={{ fontWeight: 600 }}>{staff.pan || 'Not Provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <h4 style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>Contact Information</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={18} color="var(--success)" />
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Phone Number</p>
                  <p style={{ fontWeight: 600 }}>{staff.phone || 'Not Provided'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={18} color="var(--primary)" />
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email Address</p>
                  <p style={{ fontWeight: 600 }}>{staff.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Misc Section */}
          <div style={{ gridColumn: '1 / -1' }}>
            <h4 style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>Location & Employment</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <MapPin size={18} color="var(--danger)" />
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Current Address</p>
                  <p style={{ fontWeight: 600 }}>{staff.location || 'Not Provided'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Calendar size={18} color="var(--primary)" />
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Joining Date</p>
                  <p style={{ fontWeight: 600 }}>{new Date(staff.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 32px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
           <button onClick={onClose} className="btn btn-primary" style={{ padding: '12px 32px' }}>Close Profile</button>
        </div>
      </div>
    </div>
  );
};

const StaffCard = ({ staff, icon: Icon, color, onView }) => (
  <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
    <div style={{ width: '48px', height: '48px', background: `${color}20`, color: color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} />
    </div>
    
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr', alignItems: 'center', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: '2px' }}>{staff.name}</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{staff.role}</p>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
        <Mail size={14} /> {staff.email}
      </div>

      <div style={{ fontSize: '13px' }}>
        <span style={{ color: 'var(--text-muted)' }}>Joined: </span>
        <span style={{ fontWeight: 600 }}>{new Date(staff.createdAt).toLocaleDateString()}</span>
      </div>

      <div style={{ textAlign: 'right' }}>
        <button 
          onClick={onView}
          style={{ 
            background: 'rgba(255,255,255,0.05)', 
            color: 'var(--primary)', 
            border: '1px solid var(--primary)', 
            padding: '8px 16px', 
            borderRadius: '8px', 
            fontSize: '12px', 
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: '0.2s'
          }}
        >
          View more details
        </button>
      </div>
    </div>
  </div>
);

const Staff = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/auth', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (err) {
        console.error('Error fetching staff:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [token]);

  const getRoleInfo = (role) => {
    switch (role) {
      case 'superadmin': return { icon: Shield, color: 'var(--danger)' };
      case 'subadmin': return { icon: Shield, color: 'var(--primary)' };
      case 'reception': return { icon: UserCheck, color: 'var(--success)' };
      case 'housekeeping': return { icon: Brush, color: '#38bdf8' };
      case 'roomservice': return { icon: Coffee, color: 'var(--accent)' };
      default: return { icon: UserCheck, color: 'var(--text-muted)' };
    }
  };

  const filteredStaff = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'all' 
      ? true 
      : activeTab === 'management' 
        ? (u.role === 'subadmin' || u.role === 'superadmin')
        : activeTab === 'reception'
          ? u.role === 'reception'
          : (u.role === 'housekeeping' || u.role === 'roomservice');

    return matchesSearch && matchesTab;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1>Staff Directory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Overview of all hotel staff categorized by role and operations.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search staff..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '12px 12px 12px 40px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white', width: '280px' }} 
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', background: 'var(--surface)', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
        {['all', 'management', 'reception', 'operations'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '8px 24px', 
              borderRadius: '8px', 
              textTransform: 'capitalize',
              background: activeTab === tab ? 'var(--primary)' : 'transparent',
              color: activeTab === tab ? 'var(--bg-dark)' : 'var(--text-muted)',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}><Loader2 size={32} className="animate-spin" /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredStaff.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No staff members found matching these criteria.</div>
          ) : filteredStaff.map(s => {
            const info = getRoleInfo(s.role);
            return <StaffCard key={s._id} staff={s} icon={info.icon} color={info.color} onView={() => setSelectedStaff(s)} />;
          })}
        </div>
      )}

      {selectedStaff && (
        <StaffDetailModal staff={selectedStaff} onClose={() => setSelectedStaff(null)} />
      )}
    </div>
  );
};

export default Staff;
