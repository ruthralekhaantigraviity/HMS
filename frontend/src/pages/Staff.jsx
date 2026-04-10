import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  Search, Mail, UserCheck, Shield, Brush, Coffee, 
  Loader2, Phone, MapPin, CreditCard, X, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StaffDetailModal = ({ staff, onClose }) => {
  if (!staff) return null;

  const DetailRow = ({ icon: Icon, label, value, color = "var(--primary)" }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '12px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <div style={{ padding: '8px', background: `${color}10`, color: color, borderRadius: '8px', flexShrink: 0 }}>
        <Icon size={20} />
      </div>
      <div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</p>
        <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>{value || 'Not Provided'}</p>
      </div>
    </div>
  );

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'var(--glass-overlay)', 
      backdropFilter: 'blur(20px)', 
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 9999, 
      padding: '20px' 
    }} className="animate-fade-in">
      <div 
        className="animate-scale-in" 
        style={{ 
          maxWidth: '750px', 
          width: '100%', 
          maxHeight: '90vh',
          overflowY: 'auto', 
          background: '#ffffff', 
          borderRadius: '32px', 
          border: '1px solid rgba(212, 175, 55, 0.4)', 
          boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)',
          position: 'relative'
        }}
      >
        {/* Modal Header */}
        <div style={{ padding: '40px', background: 'linear-gradient(135deg, var(--primary) 0%, #b8860b 100%)', position: 'relative' }}>
          <button 
            onClick={onClose} 
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(0,0,0,0.4)', color: 'white', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex' }}
          >
            <X size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              background: 'white', 
              color: 'var(--primary)', 
              borderRadius: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: '800', 
              fontSize: '2.5rem',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
              fontFamily: 'Outfit'
            }}>
              {staff.name.charAt(0)}
            </div>
            <div style={{ color: 'white' }}>
              <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.2)', padding: '4px 14px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '12px', display: 'inline-block' }}>{staff.role}</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: '-0.5px' }}>{staff.name}</h2>
              <p style={{ opacity: 0.8, fontSize: '15px' }}>Employee ID: #STF-{staff._id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '40px', background: 'var(--bg-main)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            
            {/* Left Column: Personal & Identity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h4 style={{ color: 'var(--primary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1.5px', fontWeight: 800 }}>Identity Verification</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <DetailRow icon={CreditCard} label="Aadhar Card" value={staff.aadhar} />
                  <DetailRow icon={CreditCard} label="PAN Card" value={staff.pan} />
                </div>
              </div>

              <div>
                <h4 style={{ color: 'var(--primary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1.5px', fontWeight: 800 }}>Location Details</h4>
                <DetailRow icon={MapPin} label="Current Address" value={staff.location} color="var(--danger)" />
              </div>
            </div>

            {/* Right Column: Contact & Work */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h4 style={{ color: 'var(--primary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1.5px', fontWeight: 800 }}>Communication</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <DetailRow icon={Phone} label="Official Contact" value={staff.phone} color="var(--success)" />
                  <DetailRow icon={Mail} label="Email Address" value={staff.email} />
                </div>
              </div>

              <div>
                <h4 style={{ color: 'var(--primary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1.5px', fontWeight: 800 }}>Employment History</h4>
                <DetailRow icon={Calendar} label="Joining Date" value={new Date(staff.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} />
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '24px 40px', background: 'var(--surface)', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
           <button 
             onClick={onClose} 
             className="btn btn-primary" 
             style={{ 
               padding: '14px 40px', 
               borderRadius: '12px', 
               fontSize: '14px', 
               fontWeight: 700, 
               boxShadow: 'var(--shadow-md)',
               fontFamily: 'Outfit'
             }}
           >
             Dismiss Details
           </button>
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
          className="view-details-btn"
          style={{ 
            padding: '10px 20px', 
            fontSize: '12px', 
            fontWeight: 700,
            fontFamily: 'Outfit',
            width: 'auto'
          }}
        >
          View Profile
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
        const res = await axios.get('/api/auth');
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
      case 'housekeeping': return { icon: Brush, color: 'var(--accent)' };
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
    <div style={{ position: 'relative' }}>
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
            style={{ padding: '12px 12px 12px 40px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', width: '280px' }} 
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
