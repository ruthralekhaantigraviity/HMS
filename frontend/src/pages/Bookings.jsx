import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, User, UserPlus, Search, Coffee, LogOut, 
  CheckCircle, Star, MessageSquare, Clock, X, Brush, 
  IndianRupee, Loader2, Bell, Utensils, Zap, Wifi
} from 'lucide-react';
import Enrollment from './Enrollment';

const Bookings = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [checkoutBooking, setCheckoutBooking] = useState(null);
  const [checkoutStage, setCheckoutStage] = useState('audit'); // audit -> completed -> review
  const [penaltyData, setPenaltyData] = useState({ amount: 0, reason: '', isKeyReturned: false, isPropertyDamaged: false });
  const [review, setReview] = useState(5);
  const [showInvoice, setShowInvoice] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [summary, setSummary] = useState({ day: 0, month: 0, year: 0 });
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(null); // stores booking object
  const [showExtendModal, setShowExtendModal] = useState(null);
  const [extensionDays, setExtensionDays] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Active Bookings
      const bookingsRes = await axios.get('/api/bookings/active');
      setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);

      // Fetch Summary if Admin/SuperAdmin/SubAdmin
      const currentRole = user?.role?.toLowerCase();
      if (['superadmin', 'admin', 'subadmin'].includes(currentRole)) {
        const summaryRes = await axios.get('/api/bookings/summary');
        setSummary(summaryRes.data || { day: 0, month: 0, year: 0 });
      }
      // Fetch Available Services
      const servicesRes = await axios.get('/api/services');
      setAvailableServices(Array.isArray(servicesRes.data) ? servicesRes.data.filter(s => s.status === 'Active') : []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, user]);

  const handleAddService = async (bookingId, service) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/add-service`, {
        name: service.name,
        price: service.price
      });
      
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
      const res = await axios.put(`/api/bookings/${bookingId}/extend`, { extraDays: days });
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
      const res = await axios.put(`/api/bookings/${id}/check-out`, {
        penaltyAmount: penaltyData.amount,
        penaltyReason: penaltyData.reason,
        isKeyReturned: penaltyData.isKeyReturned,
        isPropertyDamaged: penaltyData.isPropertyDamaged,
        paymentMethod: checkoutBooking.paymentMethod
      });
      
      setCheckoutResult(res.data);
      setCheckoutStage('success');
      setBookings(prev => prev.filter(b => b._id !== id));
      setPenaltyData({ amount: 0, reason: '', isKeyReturned: false, isPropertyDamaged: false });
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
    <div style={{ position: 'relative' }}>
      {/* Header Row: Title on Left, Button on Right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>Booking Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Policy: Check-out 11:00 AM daily.</p>
        </div>
        <button 
          onClick={() => setShowEnrollModal(true)} 
          style={{ 
            background: '#d4af37', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: '12px', 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            border: 'none',
            cursor: 'pointer',
            transition: '0.2s',
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Calendar size={20} /> New Booking
        </button>
      </div>

      {/* Attention Alert */}
      {bookings.some(b => getStayStatus(b.expectedCheckOut).pulse) && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid var(--danger)', 
          padding: '20px 24px', 
          borderRadius: '12px', 
          marginBottom: '32px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          color: '#ef4444', 
          fontWeight: 600,
          fontSize: '15px',
          marginTop: '24px'
        }}>
          <Bell size={24} /> Attention: Some guest stays are expiring or have expired! Please begin Property Audits.
        </div>
      )}

      {/* Navigation Tabs - Pill Style */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', marginTop: '24px' }}>
        {['active', 'history'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '10px 32px', 
              borderRadius: '20px', 
              textTransform: 'capitalize',
              background: activeTab === tab ? 'var(--primary)' : 'var(--surface)',
              color: activeTab === tab ? 'var(--bg-main)' : 'var(--text-muted)',
              fontWeight: 700,
              border: activeTab === tab ? 'none' : '1px solid var(--border)',
              cursor: 'pointer',
              fontSize: '14px',
              transition: '0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Search Bar - Full Width Pill */}
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <Search size={20} style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Guest Name, Room #, or ID..." 
          style={{ 
            paddingLeft: '60px', 
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            color: 'var(--text-main)',
            height: '60px',
            fontSize: '15px',
            outline: 'none',
            transition: '0.2s'
          }} 
          onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-sec)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '20px 24px', color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>Booking ID</th>
              <th style={{ padding: '20px 24px', color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>Guest</th>
              <th style={{ padding: '20px 24px', color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>Room</th>
              <th style={{ padding: '20px 24px', color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>Stay Status</th>
              <th style={{ padding: '20px 24px', color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>Amount</th>
              <th style={{ padding: '20px 24px', color: '#6b7280', fontSize: '13px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!filteredBookings || filteredBookings.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No bookings found.</td></tr>
            ) : filteredBookings.map(b => {
              const status = getStayStatus(b.expectedCheckOut);
              return (
              <tr key={b._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '20px 24px', color: 'var(--text-main)', fontWeight: 700 }}>#{b._id?.slice(-6).toUpperCase()}</td>
                <td style={{ padding: '20px 24px', color: 'var(--text-main)', fontWeight: 600 }}>{b.customer?.name || b.guest || 'Walk-in Guest'}</td>
                <td style={{ padding: '20px 24px', color: 'var(--text-main)', fontWeight: 600 }}>{b.room?.roomNumber || 'N/A'}</td>
                <td style={{ padding: '20px 24px' }}>
                  {status.label === 'STAY EXPIRED' ? (
                    <span style={{ color: 'var(--danger)', fontWeight: 800, fontSize: '12px' }}>STAY EXPIRED</span>
                  ) : (
                    <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '12px' }}>{status.label}</span>
                  )}
                </td>
                <td style={{ padding: '20px 24px', color: 'var(--text-main)', fontWeight: 800 }}>
                  ₹{Math.round(b.totalAmount + (b.additionalServices?.filter(s => !s.isPaid).reduce((sum, s) => sum + s.price, 0) * 1.12))}
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => {
                            if (getStayStatus(b.expectedCheckOut).label === 'STAY EXPIRED') {
                              return alert("Stay expired, can't add services.");
                            }
                            setShowServiceModal(b);
                          }}
                          style={{ 
                            padding: '8px 16px', 
                            fontSize: '12px', 
                            fontWeight: 700,
                            border: '1px solid var(--primary)', 
                            color: 'var(--primary)', 
                            background: 'var(--surface)', 
                            cursor: 'pointer',
                            borderRadius: '4px'
                          }}
                        >
                          Add Service
                        </button>
                        <button 
                          onClick={() => setShowExtendModal(b)}
                          style={{ 
                            padding: '8px 16px', 
                            fontSize: '12px', 
                            fontWeight: 700,
                            border: '1px solid var(--accent)', 
                            color: 'var(--accent)', 
                            background: 'var(--surface)', 
                            cursor: 'pointer',
                            borderRadius: '4px'
                          }}
                        >
                          Extend
                        </button>
                        <button 
                          onClick={() => setCheckoutBooking(b)}
                          style={{ 
                            padding: '8px 16px', 
                            fontSize: '12px', 
                            fontWeight: 700,
                            background: 'var(--primary)', 
                            color: 'var(--bg-dark)', 
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '4px'
                          }}
                        >
                          Start Checkout
                        </button>
                    </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* Enhanced Multi-Stage Checkout Modal */}
      {checkoutBooking && (
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
              width: '100%', 
              maxWidth: '550px', 
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
            <div style={{ padding: '24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', borderRadius: '8px' }}><LogOut size={20} /></div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', marginBottom: '2px', color: 'var(--text-main)' }}>Guest Checkout Formalities</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Room {checkoutBooking.room?.roomNumber} • {checkoutBooking.customer?.name}</p>
                </div>
              </div>
              <button onClick={() => { setCheckoutBooking(null); setCheckoutStage('audit'); }} style={{ background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ padding: '24px', background: 'var(--bg-main)' }}>
              {checkoutStage === 'audit' && (
                <div className="animate-fade-in">
                  <h4 style={{ marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)' }}>STAGE 1: PROPERTY INSPECTION</h4>
                  
                  <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                    <div 
                      onClick={() => setPenaltyData({...penaltyData, isPropertyDamaged: !penaltyData.isPropertyDamaged})}
                      style={{ 
                        padding: '16px', 
                        borderRadius: '12px', 
                        border: '1px solid var(--border)', 
                        background: penaltyData.isPropertyDamaged ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-sec)', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        transition: '0.2s',
                        color: 'var(--text-main)'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Property Damaged / Missing?</span>
                      <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid ' + (penaltyData.isPropertyDamaged ? 'var(--danger)' : 'var(--border)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {penaltyData.isPropertyDamaged && <div style={{ width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '1px' }}></div>}
                      </div>
                    </div>

                    {penaltyData.isPropertyDamaged && (
                      <div className="animate-fade-in" style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '16px', border: '1px solid var(--danger)', marginTop: '8px' }}>
                        <div className="input-group" style={{ marginBottom: '16px' }}>
                          <label style={{ color: 'var(--danger)', fontWeight: 800, fontSize: '12px', marginBottom: '8px' }}>PENALTY AMOUNT (REQUIRED) *</label>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: 'var(--text-muted)' }}>₹</span>
                            <input 
                              type="number" 
                              value={penaltyData.amount || ''} 
                              onChange={(e) => setPenaltyData({...penaltyData, amount: e.target.value === '' ? '' : Number(e.target.value)})}
                              placeholder="Enter manual amount..." 
                              style={{ paddingLeft: '36px', height: '52px', fontSize: '1.1rem', fontWeight: 700, borderColor: 'var(--danger)' }}
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <label style={{ color: 'var(--danger)', fontWeight: 800, fontSize: '12px', marginBottom: '8px' }}>REASON FOR DAMAGE / MISSING ITEM</label>
                          <input 
                            value={penaltyData.reason} 
                            onChange={(e) => setPenaltyData({...penaltyData, reason: e.target.value})}
                            placeholder="e.g. Broken AC Remote, Wall Stains..." 
                            style={{ height: '50px', fontSize: '14px' }}
                          />
                        </div>
                      </div>
                    )}

                    <div 
                      onClick={() => setPenaltyData({...penaltyData, isKeyReturned: !penaltyData.isKeyReturned})}
                      style={{ 
                        padding: '16px', 
                        borderRadius: '12px', 
                        border: '1px solid var(--border)', 
                        background: penaltyData.isKeyReturned ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-sec)', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        transition: '0.2s',
                        color: 'var(--text-main)'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Room Key Submitted?</span>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid ' + (penaltyData.isKeyReturned ? 'var(--success)' : 'var(--border)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  <h4 style={{ marginBottom: '20px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--success)' }}>STAGE 2: FINAL BILLING</h4>
                  <div style={{ background: 'var(--bg-sec)', padding: '20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--border)' }}>
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
                    Finalize Billing
                  </button>
                </div>
              )}
              {checkoutStage === 'review' && (
                <div className="animate-fade-in">
                   <h4 style={{ marginBottom: '24px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)', textAlign: 'center' }}>FINAL STAGE: CUSTOMER EXPERIENCE</h4>
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
                    style={{ width: '100%', padding: '18px', fontSize: '1.2rem', color: 'var(--bg-dark)' }}
                  >
                    Checkout & Generate Bill
                  </button>
                </div>
              )}

              {checkoutStage === 'success' && checkoutResult && (
                <div className="animate-fade-in" style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: '80px', height: '80px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--success)' }}>
                    <CheckCircle size={48} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-main)' }}>Checkout Successful!</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                    Reference ID: <span style={{ color: 'var(--primary)', fontWeight: 800 }}>#{checkoutResult._id.slice(-6).toUpperCase()}</span>
                  </p>
                  
                  <div style={{ background: 'var(--bg-sec)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '32px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Room Number</span>
                      <span style={{ fontWeight: 700 }}>{checkoutResult.room?.roomNumber}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Guest Name</span>
                      <span style={{ fontWeight: 700 }}>{checkoutResult.customer?.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--primary)', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                      <span>Total Paid</span>
                      <span>₹{Math.round(checkoutResult.totalAmount)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => window.print()}
                      className="btn btn-primary" 
                      style={{ flex: 2, padding: '16px', borderRadius: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                      <Zap size={20} /> Print Official Receipt
                    </button>
                    <button 
                      onClick={() => {
                        setCheckoutBooking(null);
                        setCheckoutStage('audit');
                        setCheckoutResult(null);
                        setShowInvoice(true);
                        setTimeout(() => setShowInvoice(false), 3000);
                      }}
                      className="btn" 
                      style={{ flex: 1, padding: '16px', borderRadius: '12px', background: 'var(--bg-sec)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showServiceModal && (
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
              width: '100%', 
              maxWidth: '450px', 
              background: '#ffffff', 
              borderRadius: '32px', 
              border: '1px solid rgba(212, 175, 55, 0.4)', 
              boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Add Service to Stay</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Room {showServiceModal.room?.roomNumber} • {showServiceModal.customer?.name}</p>
              </div>
              <button onClick={() => setShowServiceModal(null)} style={{ background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px' }}>
              {availableServices.map(s => {
                const IconComp = { Utensils, Zap, Coffee, Wifi, IndianRupee }[s.icon] || Coffee;
                return (
                  <button 
                    key={s._id}
                    onClick={() => handleAddService(showServiceModal._id, s)}
                    style={{ 
                      padding: '20px', 
                      textAlign: 'center', 
                      background: 'var(--bg-sec)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '16px',
                      cursor: 'pointer', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '12px',
                      transition: 'var(--transition)'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--surface-hover)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-sec)'; }}
                  >
                    <div style={{ padding: '10px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                      <IconComp size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>{s.name}</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>₹{s.price}</div>
                    </div>
                  </button>
                )
              })}
              {availableServices.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No active services found.</p>}
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
              width: '100%', 
              maxWidth: '400px', 
              background: '#ffffff', 
              borderRadius: '32px', 
              border: '1px solid rgba(212, 175, 55, 0.4)', 
              boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Extend Stay</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Room {showExtendModal.room?.roomNumber} • {showExtendModal.customer?.name}</p>
              </div>
              <button onClick={() => setShowExtendModal(null)} style={{ background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 800, letterSpacing: '1px' }}>HOW MANY EXTRA DAYS?</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-sec)', padding: '8px', borderRadius: '16px', border: '1px solid var(--border)', width: 'fit-content' }}>
                  <button 
                    onClick={() => setExtensionDays(Math.max(1, extensionDays - 1))}
                    style={{ width: '40px', height: '40px', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '10px', fontSize: '1.2rem' }}
                  >-</button>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', width: '40px', textAlign: 'center', color: 'var(--text-main)' }}>{extensionDays}</div>
                  <button 
                    onClick={() => setExtensionDays(extensionDays + 1)}
                    style={{ width: '40px', height: '40px', background: 'var(--primary)', border: 'none', color: 'var(--bg-dark)', fontWeight: 'bold', borderRadius: '10px', fontSize: '1.2rem' }}
                  >+</button>
                </div>
              </div>

              <div style={{ background: 'var(--bg-sec)', padding: '20px', border: '1px solid var(--border)', marginBottom: '28px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Additional Room Cost</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{extensionDays * (showExtendModal.room?.price || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST (12%)</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{Math.round(extensionDays * (showExtendModal.room?.price || 0) * 0.12)}</span>
                </div>
                <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: 'var(--primary)', fontSize: '1.2rem' }}>
                  <span>Total Extension Fee</span>
                  <span>₹{Math.round(extensionDays * (showExtendModal.room?.price || 0) * 1.12)}</span>
                </div>
              </div>

              <button 
                onClick={() => handleExtendStay(showExtendModal._id, extensionDays)}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '18px', borderRadius: '12px', fontSize: '1.1rem' }}
              >
                Confirm Extension
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 🧾 OFFICIAL LETTERHEAD PRINT TEMPLATE */}
      {checkoutResult && (
        <div id="printable-bill" style={{ color: 'black', fontFamily: 'sans-serif' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px', borderBottom: '2px solid black', paddingBottom: '20px' }}>
               <h1 style={{ fontSize: '32px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>HOTEL GLITZ</h1>
               <p style={{ fontSize: '12px', fontWeight: 600 }}>Luxury Redefined • Stay in Style</p>
               <p style={{ fontSize: '10px', marginTop: '4px' }}>GSTIN: 33AAAAA0000A1Z5</p>
               <p style={{ fontSize: '10px' }}>Address: 123 Elite Circle, Metropolitan City • Ph: +91 98888 77777</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '32px', fontSize: '12px' }}>
               <div>
                  <p style={{ fontWeight: 800, marginBottom: '8px', borderBottom: '1px solid #ddd' }}>GUEST DETAILS</p>
                  <p>NAME: <strong>{checkoutResult.customer?.name}</strong></p>
                  <p>CONTACT: <strong>{checkoutResult.customer?.phone}</strong></p>
                  <p>ID: <strong>{checkoutResult.customer?.identityType} - {checkoutResult.customer?.identityNumber}</strong></p>
               </div>
               <div>
                  <p style={{ fontWeight: 800, marginBottom: '8px', borderBottom: '1px solid #ddd' }}>BILLING SUMMARY</p>
                  <p>ROOM NO: <strong>{checkoutResult.room?.roomNumber}</strong></p>
                  <p>CHECK-IN: <strong>{new Date(checkoutResult.checkIn).toLocaleDateString()}</strong></p>
                  <p>CHECK-OUT: <strong>{new Date(checkoutResult.checkOut).toLocaleDateString()}</strong></p>
               </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '32px' }}>
               <thead>
                  <tr style={{ background: '#f0f0f0', borderBottom: '1px solid black' }}>
                     <th style={{ textAlign: 'left', padding: '8px' }}>Description</th>
                     <th style={{ textAlign: 'right', padding: '8px' }}>Amount</th>
                  </tr>
               </thead>
               <tbody>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                     <td style={{ padding: '8px' }}>Room Stay Charges (Total)</td>
                     <td style={{ textAlign: 'right', padding: '8px' }}>₹{Math.round(checkoutResult.totalAmount - (checkoutResult.gstAmount || 0) - (checkoutResult.penaltyAmount || 0))}</td>
                  </tr>
                  {(checkoutResult.additionalServices || []).filter(s => s.isPaid).map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                       <td style={{ padding: '8px' }}>{s.name}</td>
                       <td style={{ textAlign: 'right', padding: '8px' }}>₹{s.price}</td>
                    </tr>
                  ))}
                  {checkoutResult.penaltyAmount > 0 && (
                    <tr style={{ borderBottom: '1px solid #eee', color: 'red' }}>
                       <td style={{ padding: '8px' }}>Penalty: {checkoutResult.penaltyReason}</td>
                       <td style={{ textAlign: 'right', padding: '8px' }}>₹{checkoutResult.penaltyAmount}</td>
                    </tr>
                  )}
               </tbody>
            </table>

            <div style={{ marginLeft: 'auto', width: '250px', fontSize: '13px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Subtotal:</span><span>₹{Math.round(checkoutResult.totalAmount - (checkoutResult.gstAmount || 0))}</span></div>
               <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>GST (12%):</span><span>₹{Math.round(checkoutResult.gstAmount || 0)}</span></div>
               <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid black', fontWeight: 900, fontSize: '16px' }}><span>GRAND TOTAL:</span><span>₹{Math.round(checkoutResult.totalAmount)}</span></div>
            </div>

            <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
               <div style={{ textAlign: 'center' }}><div style={{ borderTop: '1px solid black', width: '120px', marginTop: '40px' }}>Front Desk Signature</div></div>
               <div style={{ textAlign: 'center' }}><div style={{ borderTop: '1px solid black', width: '120px', marginTop: '40px' }}>Guest Signature</div></div>
            </div>
            <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '9px', color: '#666' }}>Computer Generated Invoice • No Signature Required for Validity</p>
        </div>
      )}
      {showEnrollModal && (
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
          padding: '40px' 
        }} className="animate-fade-in">
          <div 
            className="animate-scale-in" 
            style={{ 
              width: '100%', 
              maxWidth: '1100px', 
              height: '90vh', 
              overflow: 'hidden', 
              background: '#ffffff', 
              borderRadius: '32px', 
              border: '1px solid rgba(212, 175, 55, 0.4)', 
              boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
             <Enrollment isModal={true} onClose={() => { setShowEnrollModal(false); fetchData(); }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
