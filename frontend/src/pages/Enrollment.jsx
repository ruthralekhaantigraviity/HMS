import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, UserCheck, CheckCircle, Search, CreditCard, BedDouble, Plus, Minus, Coffee, Droplets, Clock, Utensils, Zap, Wifi, IndianRupee } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Enrollment = () => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    identityType: 'Aadhar',
    identityNumber: '',
    identityImage: '',
    location: '',
    roomId: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkInTime: '18:00',
    stayDays: 1,
    duration: 17, // Default from 6PM to 11AM next day is 17 hours
    customPrice: '',
    services: [],
    paymentMethod: 'Cash',
    onlineType: '' // UPI, Card, NetBanking
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAvailableRooms();
    if (location.state?.roomNumber) {
      // Find the room by number and select it
      const preselected = rooms.find(r => r.roomNumber === location.state.roomNumber);
      if (preselected) setFormData(prev => ({ ...prev, roomId: preselected._id }));
    }
  }, [rooms.length]);

  // Handle Stay Duration Calculation (17h for Day 1, +24h for each extra day)
  useEffect(() => {
    setFormData(prev => ({ ...prev, duration: 17 + (prev.stayDays - 1) * 24 }));
  }, [formData.stayDays]);

  const fetchAvailableRooms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/rooms');
      const avail = res.data.filter(r => r.status === 'Available');
      setRooms(avail);
      
      if (location.state?.roomNumber) {
        const pre = avail.find(r => r.roomNumber === location.state.roomNumber);
        if (pre) setFormData(prev => ({ ...prev, roomId: pre._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleService = (service) => {
    const exists = formData.services.find(s => s.name === service.name);
    if (exists) {
      setFormData({ ...formData, services: formData.services.filter(s => s.name !== service.name) });
    } else {
      setFormData({ ...formData, services: [...formData.services, { name: service.name, price: service.price }] });
    }
  };

  const [availableServices, setAvailableServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/services', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailableServices(res.data.filter(s => s.status === 'Active'));
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchServices();
  }, [token]);

  const selectedRoom = rooms.find(r => r._id === formData.roomId);
  const isCustomPricing = Number(formData.stayDays) > 1;
  const roomCharge = isCustomPricing ? Number(formData.customPrice) : (selectedRoom?.price || 0);
  const totalRoomCharge = roomCharge * formData.stayDays;
  const servicesTotal = formData.services.reduce((sum, s) => sum + s.price, 0);
  const subTotal = totalRoomCharge + servicesTotal;
  const gst = subTotal * 0.12;
  const total = subTotal + gst;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert('File size too large (max 2MB)');
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, identityImage: reader.result });
      reader.readAsDataURL(file);
    }
  };
  
  const [isExistingGuest, setIsExistingGuest] = useState(false);
  const [showIdentitySection, setShowIdentitySection] = useState(true);

  const handlePhoneLookup = async (phone) => {
    if (phone.length >= 10) {
      try {
        const token = localStorage.getItem('hms_token');
        const res = await axios.get(`http://localhost:5000/api/bookings/customers/search?phone=${phone}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          setFormData(prev => ({ 
            ...prev, 
            name: res.data.name,
            email: res.data.email || prev.email,
            identityType: res.data.identityType || prev.identityType,
            identityNumber: res.data.identityNumber || prev.identityNumber,
            location: res.data.location || prev.location
          }));
          setIsExistingGuest(true);
          setShowIdentitySection(false); // Auto-hide identity for existing
        }
      } catch (err) {
        setIsExistingGuest(false);
        setShowIdentitySection(true);
      }
    } else {
      setIsExistingGuest(false);
      setShowIdentitySection(true);
    }
  };

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const resetForm = () => {
    setFormData({
      name: '', phone: '', email: '',
      identityType: 'Aadhar', identityNumber: '', identityImage: '',
      location: '', roomId: '',
      checkInDate: new Date().toISOString().split('T')[0],
      checkInTime: '18:00', stayDays: 1, duration: 17,
      customPrice: '', services: [], paymentMethod: 'Cash'
    });
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Enroll Customer
      const custRes = await axios.post('http://localhost:5000/api/bookings/enroll', {
        name: formData.name, phone: formData.phone, email: formData.email,
        identityType: formData.identityType, identityNumber: formData.identityNumber,
        identityImage: formData.identityImage, location: formData.location
      });

      // Create Booking
      await axios.post('http://localhost:5000/api/bookings/check-in', {
        customerId: custRes.data._id,
        roomId: formData.roomId,
        checkIn: `${formData.checkInDate}T${formData.checkInTime}`,
        stayDays: formData.stayDays,
        totalAmount: total,
        additionalServices: formData.services,
        gstAmount: gst,
        pricingType: isCustomPricing ? 'Custom' : 'Normal',
        paymentMethod: formData.paymentMethod
      });

      const isExisting = custRes.data.alreadyExists;
      setToastMsg(isExisting 
        ? `Welcome Back! Guest ${formData.name} check-in confirmed (Room ${rooms.find(r => r._id === formData.roomId)?.roomNumber})` 
        : `Check-in Confirmed: ${formData.name} (Room ${rooms.find(r => r._id === formData.roomId)?.roomNumber})`
      );
      setShowToast(true);
      resetForm();
      fetchAvailableRooms();
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      alert(err.response?.data?.msg || 'Error in enrollment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ position: 'relative' }}>
      {showToast && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'var(--success)', color: 'var(--bg-dark)', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, zIndex: 2000, boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={20} /> {toastMsg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
            Guest Enrollment <span style={{ color: 'var(--primary)', fontSize: '1rem' }}>& Fast Check-In</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Register new guests or fast-track returning ones</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {/* Section 1: Guest & Time */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>1. Guest & Timing</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label>Phone Number</label>
                <input 
                  name="phone" 
                  value={formData.phone} 
                  onChange={(e) => {
                    handleChange(e);
                    if (e.target.value.length >= 10) handlePhoneLookup(e.target.value);
                  }} 
                  placeholder="+91 98765" 
                  required 
                />
                {isExistingGuest && (
                  <div style={{ 
                    marginTop: '8px', 
                    fontSize: '12px', 
                    color: 'white', 
                    background: '#ef4444', 
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontWeight: 900, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    animation: 'pulse 1.5s infinite'
                  }}>
                    <UserCheck size={18} /> ALREADY EXIST: RETURNING CUSTOMER
                  </div>
                )}
              </div>
              <div className="input-group">
                <label>Full Name</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
              </div>
            </div>

            {isExistingGuest && (
              <div style={{ marginBottom: '20px' }}>
                <button 
                  type="button"
                  onClick={() => setShowIdentitySection(!showIdentitySection)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  {showIdentitySection ? 'Hide Identity Details' : 'View/Update Identity Details'}
                </button>
              </div>
            )}

            {showIdentitySection && (
              <div className="animate-fade-in">
                <div className="input-group">
                  <label>Guest Location</label>
                  <input name="location" value={formData.location} onChange={handleChange} placeholder="Mumbai, MH" required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '16px' }}>
                  <div className="input-group">
                    <label>Identity Type</label>
                    <select name="identityType" value={formData.identityType} onChange={handleChange} style={{ padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white', width: '100%' }}>
                      <option value="Aadhar">Aadhar Card</option>
                      <option value="PAN">PAN Card</option>
                      <option value="Passport">Passport</option>
                      <option value="Voter ID">Voter ID</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Identity Number</label>
                    <input name="identityNumber" value={formData.identityNumber} onChange={handleChange} placeholder="1234 5678 9012" required />
                  </div>
                </div>

                <div className="input-group">
                  <label>Upload Identity Proof Image</label>
                  <div style={{ 
                    border: '2px dashed var(--border)', 
                    borderRadius: '16px', 
                    padding: '24px', 
                    textAlign: 'center',
                    position: 'relative',
                    background: formData.identityImage ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)',
                    transition: '0.3s'
                  }}>
                    {formData.identityImage ? (
                      <div style={{ position: 'relative' }}>
                        <img src={formData.identityImage} alt="ID Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '12px', filter: 'brightness(0.8)' }} />
                        <button 
                          type="button" 
                          onClick={() => setFormData({...formData, identityImage: ''})}
                          style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </button>
                        <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--success)', fontWeight: 700 }}>Image Ready for Upload</p>
                      </div>
                    ) : (
                      <>
                        <CreditCard size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Click to select or drag and drop<br/><span style={{ fontSize: '11px' }}>Max size: 2MB (JPG/PNG)</span></p>
                        <input type="file" onChange={handleImageChange} accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label>Check-in Date</label>
                <input type="date" name="checkInDate" value={formData.checkInDate} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Check-in Time (Policy: From 6 PM)</label>
                <input type="time" name="checkInTime" value={formData.checkInTime} onChange={handleChange} />
              </div>
            </div>

            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label>Stay Duration (Standard Policy: Check-out 11 AM)</label>
                <div style={{ padding: '4px 10px', background: 'rgba(251, 191, 36, 0.1)', color: 'var(--primary)', borderRadius: '20px', fontSize: '11px', fontWeight: 800, border: '1px solid var(--primary)' }}>
                  Total: {formData.duration} Hours
                </div>
              </div>
              <select 
                name="stayDays" 
                value={formData.stayDays} 
                onChange={(e) => setFormData({...formData, stayDays: Number(e.target.value)})}
                style={{ padding: '14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white', fontWeight: 700, width: '100%' }}
              >
                {[1,2,3,4,5,6,7,10,14,30].map(day => (
                  <option key={day} value={day}>{day} Day{day > 1 ? 's' : ''} (Checkout at 11:00 AM)</option>
                ))}
              </select>
              <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--primary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={12} /> Guests must vacate the room by 11:00 AM on the final day.
              </div>
            </div>
          </div>

          {/* Section 2: Room Selection */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>2. Room & Services</h3>
            <div className="input-group">
              <label>Available Rooms</label>
              <div style={{ display: 'grid', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {rooms.map(room => (
                  <div 
                    key={room._id} 
                    onClick={() => setFormData({ ...formData, roomId: room._id })}
                    style={{ 
                      padding: '12px', 
                      background: formData.roomId === room._id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)', 
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                      color: formData.roomId === room._id ? 'var(--bg-dark)' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>Room {room.roomNumber}</span>
                        <span style={{ fontSize: '10px', opacity: 0.8, textTransform: 'uppercase' }}>{room.category} • {room.type}</span>
                      </div>
                      <span>${room.price}/d</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="input-group">
              <label>Add Services (Pre-paid at Check-In)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
                {availableServices.map(s => {
                  const IconComp = { Utensils, Zap, Coffee, Wifi, IndianRupee }[s.icon] || BedDouble;
                  return (
                    <div 
                      key={s._id}
                      onClick={() => toggleService(s)}
                      style={{ 
                        padding: '12px', textAlign: 'center', borderRadius: '12px', border: '1px solid var(--border)',
                        background: formData.services.find(ser => ser.name === s.name) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
                        color: formData.services.find(ser => ser.name === s.name) ? 'var(--success)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: '0.2s'
                      }}
                    >
                      <IconComp size={20} style={{ marginBottom: '4px' }} />
                      <div style={{ fontSize: '11px', fontWeight: 700 }}>{s.name}</div>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)' }}>₹{s.price}</div>
                    </div>
                  );
                })}
              </div>
              {availableServices.length === 0 && <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No extra services currently active.</p>}
            </div>

            {isCustomPricing && (
              <div className="input-group animate-fade-in" style={{ border: '2px dashed var(--primary)', padding: '16px', borderRadius: '12px' }}>
                <label style={{ color: 'var(--primary)', fontWeight: 700 }}>Custom Duration Pricing ($)</label>
                <input type="number" name="customPrice" value={formData.customPrice} onChange={handleChange} placeholder="Enter custom amount" required />
              </div>
            )}
          </div>

          {/* Section 3: Billing & Payment */}
          <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>3. Billing Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span>Room Charge ({formData.stayDays} Day{formData.stayDays > 1 ? 's' : ''})</span>
                  <span style={{ fontWeight: 700 }}>${roomCharge * formData.stayDays}</span>
                </div>
                {formData.services.map(s => (
                  <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                    <span>{s.name}</span>
                    <span>+${s.price}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Subtotal</span>
                  <span>${subTotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--text-muted)' }}>
                  <span>GST (12%)</span>
                  <span>+${gst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                  <span>Total Amount</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setFormData({ ...formData, paymentMethod: 'Online', onlineType: 'UPI' })}
                  className="btn" 
                  style={{ 
                    background: formData.paymentMethod === 'Online' ? 'var(--primary)' : 'var(--surface)', 
                    border: '1px solid var(--border)',
                    color: formData.paymentMethod === 'Online' ? 'var(--bg-dark)' : 'white'
                  }}
                >
                  <CreditCard size={18} /> {formData.paymentMethod === 'Online' && formData.onlineType ? `Online (${formData.onlineType})` : 'UPI / Online'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormData({ ...formData, paymentMethod: 'Cash' })}
                  className="btn" 
                  style={{ 
                    background: formData.paymentMethod === 'Cash' ? 'var(--primary)' : 'var(--surface)', 
                    border: '1px solid var(--border)',
                    color: formData.paymentMethod === 'Cash' ? 'var(--bg-dark)' : 'white'
                  }}
                >
                  Cash Payment
                </button>
              </div>

              {formData.paymentMethod === 'Online' && (
                <div className="animate-fade-in" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {['UPI', 'Card', 'Bank Account'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, onlineType: type })}
                      style={{
                        padding: '6px 12px',
                        fontSize: '11px',
                        borderRadius: '20px',
                        border: '1px solid var(--border)',
                        background: formData.onlineType === type ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: formData.onlineType === type ? 'var(--bg-dark)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        transition: '0.2s'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ padding: '12px 48px' }} disabled={loading || !formData.roomId}>
                {loading ? 'Processing...' : 'Complete Check-In & Bill'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Enrollment;
