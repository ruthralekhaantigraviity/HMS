import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, User, UserPlus, Search, Coffee, LogOut, 
  CheckCircle, Star, MessageSquare, Clock, X, Brush, 
  IndianRupee, Loader2, Bell, Utensils, Zap, Wifi
} from 'lucide-react';

const Bookings = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [checkoutBooking, setCheckoutBooking] = useState(null);
  const [checkoutStage, setCheckoutStage] = useState('audit'); // audit -> completed -> review
  const [penaltyData, setPenaltyData] = useState({ amount: 0, reason: '', isKeyReturned: false, isPropertyDamaged: false });
  const [review, setReview] = useState(5);
  const [showInvoice, setShowInvoice] = useState(false);
  const [summary, setSummary] = useState({ day: 0, month: 0, year: 0 });
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(null); // stores booking object
  const [showExtendModal, setShowExtendModal] = useState(null);
  const [extensionDays, setExtensionDays] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Active Bookings
        const bookingsRes = await axios.get('http://localhost:5000/api/bookings/active', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(bookingsRes.data);

        // Fetch Summary if Super Admin
        if (user?.role === 'superadmin') {
          const summaryRes = await axios.get('http://localhost:5000/api/bookings/summary', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSummary(summaryRes.data);
        }
        // Fetch Available Services
        const servicesRes = await axios.get('http://localhost:5000/api/services', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailableServices(servicesRes.data.filter(s => s.status === 'Active'));
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, user]);

  const handleAddService = async (bookingId, service) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/add-service`, {
        name: service.name,
        price: service.price
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      // Update local state to reflect the new service (for checkout calculation)
      setBookings(prev => prev.map(b => 
        b._id === bookingId 
          ? { ...b, additionalServices: [...(b.additionalServices || []), { name: service.name, price: service.price, isPaid: false }] }
          : b
      ));
      setShowServiceModal(null);
    } catch (err) {
      alert('Error adding service');
    }
  };

  const handleExtendStay = async (bookingId, days) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/bookings/${bookingId}/extend`, { extraDays: days }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state with the returned updated booking
      setBookings(prev => prev.map(b => b._id === bookingId ? res.data : b));
      setShowExtendModal(null);
      setExtensionDays(1);
    } catch (err) {
      console.error(err);
      alert('Failed to extend stay. Please check server logs.');
    }
  };

  const getStayStatus = (expectedOut) => {
    if (!expectedOut) return { label: 'Active', color: 'var(--success)' };
    const now = new Date();
    const expiry = new Date(expectedOut);
    const diff = (expiry - now) / (1000 * 60);

    if (diff < 0) return { label: 'STAY EXPIRED', color: 'var(--danger)', pulse: true };
    if (diff < 30) return { label: 'Expires in ' + Math.round(diff) + 'm', color: 'var(--warning)', pulse: true };
    return { label: 'Active', color: 'var(--success)' };
  };

  const handleCheckout = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${id}/check-out`, {
        penaltyAmount: penaltyData.amount,
        penaltyReason: penaltyData.reason,
        isKeyReturned: penaltyData.isKeyReturned,
        isPropertyDamaged: penaltyData.isPropertyDamaged,
        paymentMethod: checkoutBooking.paymentMethod
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setBookings(prev => prev.filter(b => b._id !== id));
      setCheckoutBooking(null);
      setCheckoutStage('audit');
      setPenaltyData({ amount: 0, reason: '', isKeyReturned: false, isPropertyDamaged: false });
      setShowInvoice(true);
      setTimeout(() => setShowInvoice(false), 3000);
    } catch (err) {
      alert('Error during checkout');
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesTab = activeTab === 'active' ? b.status !== 'Completed' : b.status === 'Completed';
    const guestName = (b.customer?.name || b.guest || '').toLowerCase();
    const roomNum = (b.room?.roomNumber || '').toString();
    const bId = (b._id || '').slice(-6).toUpperCase();
    
    const matchesSearch = 
      guestName.includes(searchTerm.toLowerCase()) || 
      roomNum.includes(searchTerm) ||
      bId.includes(searchTerm.toUpperCase());

    return matchesTab && matchesSearch;
  });

  if (loading && !bookings.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* ... (Header) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Booking Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Policy: Check-out 11:00 AM daily.</p>
        </div>
        <button onClick={() => navigate('/dashboard/rooms')} className="btn btn-primary">
          <Calendar size={20} /> New Booking
        </button>
      </div>

      {/* Expiry Alerts */}
      {bookings.some(b => getStayStatus(b.expectedCheckOut).pulse) && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--danger)', fontWeight: 700 }}>
          <Bell className="animate-pulse" size={20} /> Attention: Some guest stays are expiring or have expired! Please begin Property Audits.
        </div>
      )}

      {/* Summary Cards */}
      {user?.role === 'superadmin' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
          <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Bookings Today</p>
            <h2 style={{ fontSize: '2rem' }}>{summary?.day || 0}</h2>
          </div>
          <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--success)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>This Month</p>
            <h2 style={{ fontSize: '2rem' }}>{summary?.month || 0}</h2>
          </div>
          <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--warning)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Active Rooms</p>
            <h2 style={{ fontSize: '2rem' }}>{bookings.length}</h2>
          </div>
        </div>
      )}

      {/* ... (Tabs) */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', background: 'var(--surface)', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
        {['active', 'history'].map(tab => (
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
      
      {/* Search Bar */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Guest Name, Room #, or ID..." 
            style={{ 
              paddingLeft: '48px', 
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              color: 'white',
              height: '48px',
              fontSize: '14px',
              outline: 'none',
              transition: 'var(--transition)'
            }} 
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Booking ID</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Guest</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Room</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Stay Status</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Amount</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!filteredBookings || filteredBookings.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No bookings found.</td></tr>
            ) : filteredBookings.map(b => {
              const status = getStayStatus(b.expectedCheckOut);
              return (
              <tr key={b._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '20px 24px', fontWeight: 'bold' }}>#{b._id?.slice(-6).toUpperCase()}</td>
                <td style={{ padding: '20px 24px' }}>{b.customer?.name || b.guest || 'Walk-in Guest'}</td>
                <td style={{ padding: '20px 24px' }}>{b.room?.roomNumber || 'N/A'}</td>
                <td style={{ padding: '20px 24px' }}>
                  <span className={status.pulse ? 'animate-pulse' : ''} style={{ 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '11px',
                    fontWeight: 800,
                    background: status.color + '20',
                    color: status.color,
                    border: '1px solid ' + status.color + '40'
                  }}>
                    {status.label}
                  </span>
                </td>
                <td style={{ padding: '20px 24px', fontWeight: 'bold' }}>
                  ₹{Math.round(b.totalAmount + (b.additionalServices?.filter(s => !s.isPaid).reduce((sum, s) => sum + s.price, 0) * 1.12))}
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                   {activeTab === 'active' && (
                      <>
                        <button 
                          onClick={() => {
                            const status = getStayStatus(b.expectedCheckOut);
                            if (status.label === 'STAY EXPIRED') {
                              return alert("Already expired, can't add services.");
                            }
                            console.log('Opening Service Modal for:', b._id);
                            setShowServiceModal(b);
                          }}
                          className="btn"
                          style={{ 
                            padding: '6px 14px', 
                            fontSize: '12px', 
                            border: '1px solid var(--primary)', 
                            color: 'var(--primary)', 
                            background: 'transparent', 
                            cursor: 'pointer',
                            marginRight: '8px',
                            borderRadius: '0'
                          }}
                        >
                          Add Service
                        </button>
                        <button 
                          onClick={() => setShowExtendModal(b)}
                          className="btn"
                          style={{ 
                            padding: '6px 14px', 
                            fontSize: '12px', 
                            border: '1px solid var(--accent)', 
                            color: 'var(--accent)', 
                            background: 'transparent', 
                            cursor: 'pointer',
                            marginRight: '8px',
                            borderRadius: '0'
                          }}
                        >
                          Extend
                        </button>
                        <button 
                          onClick={() => setCheckoutBooking(b)}
                          className="btn"
                          style={{ padding: '6px 14px', fontSize: '12px', background: 'var(--primary)', color: 'var(--bg-dark)', cursor: 'pointer', borderRadius: '0' }}
                        >
                          Start Checkout
                        </button>
                      </>
                    )}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* Enhanced Multi-Stage Checkout Modal */}
      {checkoutBooking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '550px', padding: '0', overflow: 'hidden', border: '1px solid var(--border)' }}>
            {/* Modal Header */}
            <div style={{ padding: '24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(251, 191, 36, 0.1)', color: 'var(--primary)', borderRadius: '8px' }}><LogOut size={20} /></div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', marginBottom: '2px' }}>Guest Checkout Formalities</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Room {checkoutBooking.room?.roomNumber} • {checkoutBooking.customer?.name}</p>
                </div>
              </div>
              <button onClick={() => { setCheckoutBooking(null); setCheckoutStage('audit'); }} style={{ background: 'none', color: 'var(--text-muted)' }}><X size={24} /></button>
            </div>

            <div style={{ padding: '24px' }}>
              {checkoutStage === 'audit' && (
                <div className="animate-fade-in">
                  <h4 style={{ marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)' }}>Stage 1: Property Inspection</h4>
                  
                  <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                    <div 
                      onClick={() => setPenaltyData({...penaltyData, isPropertyDamaged: !penaltyData.isPropertyDamaged})}
                      style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: penaltyData.isPropertyDamaged ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s' }}
                    >
                      <span>Property Damaged / Missing?</span>
                      <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid' + (penaltyData.isPropertyDamaged ? 'var(--danger)' : 'var(--border)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {penaltyData.isPropertyDamaged && <div style={{ width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '1px' }}></div>}
                      </div>
                    </div>

                    {penaltyData.isPropertyDamaged && (
                      <div className="animate-fade-in" style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--danger)' }}>Penalty Amount (₹)</label>
                        <input 
                          type="number" 
                          value={penaltyData.amount} 
                          onChange={(e) => setPenaltyData({...penaltyData, amount: Number(e.target.value)})}
                          placeholder="Enter penalty..." 
                          style={{ marginBottom: '12px' }}
                        />
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--danger)' }}>Reason for Penalty</label>
                        <input 
                          value={penaltyData.reason} 
                          onChange={(e) => setPenaltyData({...penaltyData, reason: e.target.value})}
                          placeholder="e.g. Broken Mirror" 
                        />
                      </div>
                    )}

                    <div 
                      onClick={() => setPenaltyData({...penaltyData, isKeyReturned: !penaltyData.isKeyReturned})}
                      style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: penaltyData.isKeyReturned ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s' }}
                    >
                      <span>Room Key Submitted?</span>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid' + (penaltyData.isKeyReturned ? 'var(--success)' : 'var(--border)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {penaltyData.isKeyReturned && <div style={{ width: '10px', height: '10px', background: 'var(--success)', borderRadius: '50%' }}></div>}
                      </div>
                    </div>
                  </div>

                  <button 
                  disabled={!penaltyData.isKeyReturned}
                    onClick={() => setCheckoutStage('completed')} 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '16px' }}
                  >
                    {!penaltyData.isKeyReturned ? 'Await Key Submission...' : 'Audit Formalities Done'}
                  </button>
                </div>
              )}

              {checkoutStage === 'completed' && (
                <div className="animate-fade-in">
                  <h4 style={{ marginBottom: '20px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--success)' }}>Stage 2: Final Billing</h4>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Room & Check-in Total</span>
                      <span>₹{checkoutBooking.totalAmount}</span>
                    </div>

                    {/* Pending Services Section */}
                    {checkoutBooking.additionalServices?.filter(s => !s.isPaid).length > 0 && (
                      <>
                        <div style={{ margin: '12px 0', fontSize: '11px', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>Services Added During Stay</div>
                        {checkoutBooking.additionalServices.filter(s => !s.isPaid).map((s, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{s.name}</span>
                            <span>+₹{s.price}</span>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
                          <span>Extra Services GST (12%)</span>
                          <span>+₹{(checkoutBooking.additionalServices.filter(s => !s.isPaid).reduce((sum, s) => sum + s.price, 0) * 0.12).toFixed(2)}</span>
                        </div>
                      </>
                    )}

                    {penaltyData.amount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--danger)' }}>
                        <span>Penalty ({penaltyData.reason})</span>
                        <span>+₹{penaltyData.amount + (penaltyData.amount * 0.12)} <small>(inc. GST)</small></span>
                      </div>
                    )}
                    <div style={{ height: '1px', background: 'var(--border)', margin: '12px 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                      <span>Final Total Amount</span>
                      <span>₹{Math.round(checkoutBooking.totalAmount + penaltyData.amount + (penaltyData.amount * 0.12) + 
                        (checkoutBooking.additionalServices?.filter(s => !s.isPaid).reduce((sum, s) => sum + s.price, 0) * 1.12))}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setCheckoutStage('review')}
                    className="btn" 
                    style={{ width: '100%', padding: '16px', background: 'var(--success)', color: 'var(--bg-dark)', fontWeight: 800, fontSize: '1rem' }}
                  >
                    Mark as COMPLETED
                  </button>
                </div>
              )}

              {checkoutStage === 'review' && (
                <div className="animate-fade-in">
                   <h4 style={{ marginBottom: '24px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)', textAlign: 'center' }}>Final Stage: Customer Experience</h4>
                   <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                     <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Rate the guest's behavior and stay experience</p>
                     <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} onClick={() => setReview(star)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <Star size={40} fill={review >= star ? 'var(--primary)' : 'none'} color={review >= star ? 'var(--primary)' : 'var(--text-muted)'} />
                          </button>
                        ))}
                     </div>
                   </div>
                   <button 
                    onClick={() => handleCheckout(checkoutBooking._id)}
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '18px', fontSize: '1.2rem' }}
                  >
                    Checkout & Release Room
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showServiceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(10px)' }}>
          <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '450px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem' }}>Add Service to Stay</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Room {showServiceModal.room?.roomNumber} • {showServiceModal.customer?.name}</p>
              </div>
              <button onClick={() => setShowServiceModal(null)} style={{ background: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
              {availableServices.map(s => {
                const IconComp = { Utensils, Zap, Coffee, Wifi, IndianRupee }[s.icon] || Coffee;
                return (
                  <button 
                    key={s._id}
                    onClick={() => handleAddService(showServiceModal._id, s)}
                    className="glass-card"
                    style={{ padding: '16px', textAlign: 'center', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                  >
                    <IconComp size={24} style={{ color: 'var(--primary)' }} />
                    <div style={{ fontSize: '11px', fontWeight: 700 }}>{s.name}</div>
                    <div style={{ fontSize: '13px', fontWeight: 800 }}>₹{s.price}</div>
                  </button>
                )
              })}
              {availableServices.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>No active services found.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showInvoice && (
        <div style={{ position: 'fixed', bottom: '40px', right: '40px', background: 'var(--success)', color: 'var(--bg-dark)', padding: '16px 32px', borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2000 }}>
          <CheckCircle size={20} /> Checkout Complete! Room Release Successful.
        </div>
      )}
      {/* Extend Stay Modal */}
      {showExtendModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(10px)' }}>
          <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '400px', padding: '32px', borderRadius: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Extend Stay</h2>
              <button onClick={() => setShowExtendModal(null)} style={{ background: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>HOW MANY EXTRA DAYS?</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                  onClick={() => setExtensionDays(Math.max(1, extensionDays - 1))}
                  style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', borderRadius: '0' }}
                >-</button>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', width: '40px', textAlign: 'center' }}>{extensionDays}</div>
                <button 
                  onClick={() => setExtensionDays(extensionDays + 1)}
                  style={{ width: '40px', height: '40px', background: 'var(--primary)', border: 'none', color: 'var(--bg-dark)', fontWeight: 'bold', borderRadius: '0' }}
                >+</button>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', border: '1px solid var(--border)', marginBottom: '24px', borderRadius: '0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Additional Room Cost</span>
                <span>₹{extensionDays * (showExtendModal.room?.price || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>GST (12%)</span>
                <span>₹{Math.round(extensionDays * (showExtendModal.room?.price || 0) * 0.12)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', borderTop: '1px solid var(--border)', paddingTop: '8px', color: 'var(--primary)' }}>
                <span>Total Extension Fee</span>
                <span>₹{Math.round(extensionDays * (showExtendModal.room?.price || 0) * 1.12)}</span>
              </div>
            </div>

            <button 
              onClick={() => handleExtendStay(showExtendModal._id, extensionDays)}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', borderRadius: '0' }}
            >
              Confirm Extension
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
