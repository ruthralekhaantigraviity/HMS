import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { UserPlus, UserCheck, CheckCircle, Search, CreditCard, BedDouble, Plus, Minus, Coffee, Droplets, Clock, Utensils, Zap, Wifi, IndianRupee, X, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Enrollment = ({ isModal = false, onClose }) => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', phone: '', alternatePhone: '', email: '',
    identityType: 'Aadhar', identityNumber: '', identityImage: '',
    location: '', roomId: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkInTime: '18:00', stayDays: 1, duration: 17,
    bookingType: 'NEW', referrerName: '', manualPrice: '',
    guestCount: 1,
    additionalGuests: [],
    vehicleType: 'None',
    vehicleNumber: '',
    isKids: false,
    kidsAge: '',
    isPets: false,
    isKitchenAllowance: false,
    hasGst: true,
    customPrice: '',
    services: [
      { name: 'Water', price: 20, quantity: 0, icon: 'Droplets' },
      { name: 'Tea', price: 20, quantity: 0, icon: 'Coffee' },
      { name: 'Coffee', price: 25, quantity: 0, icon: 'Zap' },
      { name: 'Breakfast', price: 100, quantity: 0, icon: 'Utensils' }
    ],
    paymentMethod: 'Cash',
    onlineType: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAvailableRooms();
  }, []);

  useEffect(() => {
    if (rooms.length > 0 && location.state?.roomNumber) {
      const pre = rooms.find(r => r.roomNumber === location.state.roomNumber);
      if (pre) setFormData(prev => ({ ...prev, roomId: pre._id }));
    }
  }, [rooms, location.state]);

  // Handle Shifting Data Injection
  useEffect(() => {
    if (location.state?.shiftingFrom) {
      const b = location.state.shiftingFrom;
      setFormData(prev => ({
        ...prev,
        bookingType: 'SHIFT',
        name: b.customer?.name || '',
        phone: b.customer?.phone || '',
        identityType: b.customer?.identityType || 'Aadhar',
        identityNumber: b.customer?.identityNumber || '',
        location: b.customer?.location || '',
        email: b.customer?.email || ''
      }));
      toast.success('Shifting Mode: Guest data pre-populated');
    }
  }, [location.state]);

  // Handle Stay Duration Calculation (17h for Day 1, +24h for each extra day)
  useEffect(() => {
    setFormData(prev => ({ ...prev, duration: 17 + (prev.stayDays - 1) * 24 }));
  }, [formData.stayDays]);

  const fetchAvailableRooms = async () => {
    try {
      const res = await axios.get('/api/rooms');
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
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleGuestChange = (index, field, value) => {
    const updatedGuests = [...formData.additionalGuests];
    if (!updatedGuests[index]) updatedGuests[index] = {};
    updatedGuests[index][field] = value;
    setFormData({ ...formData, additionalGuests: updatedGuests });
  };

  const updateSnackQuantity = (name, delta) => {
    const updated = formData.services.map(s => {
      if (s.name === name) {
        return { ...s, quantity: Math.max(0, s.quantity + delta) };
      }
      return s;
    });
    setFormData({ ...formData, services: updated });
  };


  const selectedRoom = rooms.find(r => r._id === formData.roomId);

  // Elite Pricing Engine
  const calculatePricing = () => {
    if (!selectedRoom) return { subTotal: 0, roomTotal: 0, gst: 0, total: 0 };
    
    // 1. Base Room Charge (1 Person)
    const baseRate = selectedRoom.category === 'AC' ? 1600 : 1200;
    
    // 2. Extra Guest Charges (2nd: 600, 3rd: 500, 4th: 400)
    let extraGuestCharge = 0;
    if (formData.guestCount >= 2) extraGuestCharge += 600;
    if (formData.guestCount >= 3) extraGuestCharge += 500;
    if (formData.guestCount >= 4) extraGuestCharge += 400;

    const dailyRoomCharge = baseRate + extraGuestCharge;
    let roomTotal = dailyRoomCharge * formData.stayDays;

    // Mode Specific Overrides
    if (formData.bookingType === 'HOURLY') {
      roomTotal = 599 * formData.guestCount;
    } else if (formData.bookingType === 'REFERRAL' && formData.manualPrice) {
      roomTotal = Number(formData.manualPrice);
    }

    // 3. Services (Quantity based) & Allowances
    const servicesTotal = formData.services.reduce((sum, s) => sum + (s.price * s.quantity), 0);
    const allowanceTotal = (formData.isPets ? 500 : 0) + (formData.isKitchenAllowance ? 300 : 0);

    const subTotal = roomTotal + servicesTotal + allowanceTotal;
    const gst = formData.hasGst ? (subTotal * 0.12) : 0;
    const total = subTotal + gst;

    return { subTotal, roomTotal, gst, total, dailyRoomCharge, servicesTotal, allowanceTotal };
  };

  const pricing = calculatePricing();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size too large (max 10MB SCANS)');
        return;
      }
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
        const res = await axios.get(`/api/bookings/customers/search?phone=${phone}`);
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




  const resetForm = () => {
    setFormData({
      name: '', phone: '', alternatePhone: '', email: '',
      identityType: 'Aadhar', identityNumber: '', identityImage: '',
      location: '', roomId: '',
      checkInDate: new Date().toISOString().split('T')[0],
      checkInTime: '18:00', stayDays: 1, duration: 17,
      guestCount: 1, additionalGuests: [],
      vehicleType: 'None', vehicleNumber: '',
      isKids: false, kidsAge: '',
      isPets: false, isKitchenAllowance: false,
      hasGst: true, customPrice: '',
      services: [], paymentMethod: 'Cash', onlineType: ''
    });
    setStep(1);
    setSuccess(false);
  };

  const handleSubmit = async (e, shouldPrint = false) => {
    if (e) e.preventDefault();
    // MANDATORY FIELD VALIDATION
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Guest Name and Phone Number are required!');
      return;
    }

    setLoading(true);
    try {
      // 1. Double check room selection
      if (!formData.roomId) {
        toast.error('Please select a room first');
        return;
      }

      // Enroll Customer
      const custRes = await axios.post('/api/bookings/enroll', {
        name: formData.name, phone: formData.phone, email: formData.email,
        identityType: formData.identityType, identityNumber: formData.identityNumber,
        identityImage: formData.identityImage, location: formData.location
      });

      // Create Booking
      await axios.post('/api/bookings/check-in', {
        customerId: custRes.data._id,
        roomId: formData.roomId,
        checkIn: `${formData.checkInDate}T${formData.checkInTime}`,
        stayDays: formData.stayDays,
        totalAmount: pricing.total,
        additionalServices: formData.services,
        gstAmount: pricing.gst,
        paymentMethod: formData.paymentMethod,
        alternatePhone: formData.alternatePhone,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
        guestCount: formData.guestCount,
        additionalGuests: formData.additionalGuests,
        isKids: formData.isKids,
        kidsAge: formData.kidsAge,
        isPets: formData.isPets,
        isKitchenAllowance: formData.isKitchenAllowance,
        hasGst: formData.hasGst,
        gstRate: 12,
        bookingType: formData.bookingType,
        referrerName: formData.referrerName,
        manualPrice: formData.manualPrice
      });

      const isExisting = custRes.data.alreadyExists;
      toast.success(isExisting 
        ? `Welcome Back! ${formData.name} confirmed` 
        : `Check-in Confirmed: ${formData.name}`
      );

      // 2. Action based on flag
      if (shouldPrint) {
        setTimeout(() => {
          window.print();
          if (isModal) {
            onClose();
          } else {
            resetForm();
            fetchAvailableRooms();
          }
        }, 500);
      } else {
        if (isModal) {
          onClose();
        } else {
          resetForm();
          fetchAvailableRooms();
        }
      }

      setTimeout(() => {}, 3000);
    } catch (err) {
      console.error('Enrollment Error:', err);
      const errorMsg = err.response?.data?.msg || err.response?.data?.message || 'Server Connectivity Error: Failed to enroll';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', height: isModal ? '100%' : 'auto', overflowY: isModal ? 'auto' : 'visible' }}>
      <div className="animate-fade-in" style={{ position: 'relative', maxWidth: isModal ? '1000px' : '1100px', width: '100%', margin: isModal ? '0' : '0 auto' }}>
        {/* react-hot-toast handles notifications globally */}

      <div style={{ padding: '24px', background: 'var(--surface)', borderRadius: '24px 24px 0 0', border: '1px solid var(--border)', borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            Room {selectedRoom?.roomNumber || '...'} Booking
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>{formData.bookingType} Mode • Step {step} of 2</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              {['NEW', 'REFERRAL', 'HOURLY'].map(type => (
                <span key={type} 
                  onClick={() => setFormData({...formData, bookingType: type})}
                  style={{ 
                    padding: '8px 24px', borderRadius: '40px', cursor: 'pointer',
                    background: formData.bookingType === type ? 'var(--primary)' : 'var(--bg-sec)', 
                    border: `1px solid ${formData.bookingType === type ? 'var(--primary)' : 'var(--border)'}`, 
                    fontSize: '11px', fontWeight: 900, 
                    color: formData.bookingType === type ? 'var(--bg-dark)' : 'var(--text-main)',
                    transition: '0.3s'
                  }}>
                  {type}
                </span>
              ))}
          </div>
        </div>
        <button onClick={() => isModal ? onClose() : navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
      </div>

      <div style={{ height: '2px', background: 'var(--border)', width: '100%', position: 'relative' }}>
        <div style={{ height: '100%', background: 'var(--primary)', width: `${(step/2)*100}%`, transition: '0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="animate-fade-in" style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 24px 24px' }}>
            {/* 1. Guest Profile Section */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="input-group">
                  <label>Number of Guests</label>
                  <input type="number" name="guestCount" value={formData.guestCount} onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })} min="1" max="4" style={{ height: '56px', fontSize: '1.25rem', fontWeight: 800 }} />
                </div>
                {formData.bookingType === 'REFERRAL' && (
                  <div className="input-group">
                    <label>Referred By</label>
                    <input name="referrerName" value={formData.referrerName} onChange={handleChange} placeholder="Enter name" style={{ height: '56px', border: '1px solid #d4af37', color: '#d4af37' }} />
                  </div>
                )}
                {formData.bookingType === 'HOURLY' && (
                   <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem' }}>
                      🔥 Hourly Slot Price: ₹599 / head
                   </div>
                )}
              </div>

              {formData.bookingType === 'REFERRAL' && (
                <div className="input-group" style={{ marginBottom: '24px' }}>
                  <label>Enter Money Manually (Room Price Override)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: '#d4af37' }}>₹</span>
                    <input type="number" name="manualPrice" value={formData.manualPrice} onChange={handleChange} placeholder="Enter total room amount" style={{ height: '56px', paddingLeft: '32px', fontSize: '1.25rem', fontWeight: 900, borderColor: '#d4af37', color: '#d4af37' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="input-group"><label>Primary Guest Name</label><input name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" required style={{ height: '56px' }} /></div>
                <div className="input-group"><label>Mobile Number</label><input name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXX" required style={{ height: '56px' }} /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Select ID Type</label>
                  <select name="identityType" value={formData.identityType} onChange={handleChange} style={{ width: '100%', padding: '16px', background: 'var(--bg-sec)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '16px', fontWeight: 700 }}>
                    <option value="Aadhar">Aadhar Card</option>
                    <option value="PAN">PAN Card</option>
                    <option value="Passport">Passport</option>
                    <option value="VoterID">Voter ID</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>{formData.identityType} Number</label>
                  <input name="identityNumber" value={formData.identityNumber} onChange={handleChange} placeholder={`Enter ${formData.identityType} number`} required style={{ height: '56px' }} />
                </div>
              </div>

              {formData.guestCount > 1 && (
                <div style={{ marginTop: '32px', display: 'grid', gap: '16px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#d4af37', textTransform: 'uppercase', marginBottom: '8px' }}>Additional Guest Members</h4>
                  {Array.from({ length: formData.guestCount - 1 }).map((_, i) => (
                    <div key={i} style={{ padding: '24px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '24px', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>GUEST #{i + 2}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div className="input-group"><label>Guest Name</label><input onChange={(e) => handleGuestChange(i, 'name', e.target.value)} placeholder="Entry name" style={{ height: '48px' }} /></div>
                        <div className="input-group">
                          <label>ID Proof Type</label>
                          <select onChange={(e) => handleGuestChange(i, 'identityType', e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '12px', fontWeight: 700 }}>
                            <option value="Aadhar">Aadhar Card</option>
                            <option value="PAN">PAN Card</option>
                            <option value="Passport">Passport</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px' }}>
                        <div className="input-group"><label>ID Number</label><input onChange={(e) => handleGuestChange(i, 'identityNumber', e.target.value)} placeholder="Enter details" style={{ height: '48px' }} /></div>
                        <div className="input-group"><label>Address / Contact</label><input onChange={(e) => handleGuestChange(i, 'address', e.target.value)} placeholder="Optional details" style={{ height: '48px' }} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Property & Selection Section */}
            <div style={{ marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
               <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '24px', textTransform: 'uppercase' }}>Property & Stay Configuration</h4>
               
               <div className="input-group" style={{ marginBottom: '32px' }}>
                 <label>Select Room</label>
                 <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px' }}>
                   {rooms.map(room => (
                     <div key={room._id} onClick={() => setFormData({ ...formData, roomId: room._id })}
                       style={{ flex: '0 0 160px', padding: '20px', borderRadius: '24px', cursor: 'pointer', border: `2px solid ${formData.roomId === room._id ? 'var(--primary)' : 'var(--border)'}`, background: formData.roomId === room._id ? 'rgba(212, 175, 55, 0.05)' : 'var(--bg-sec)', textAlign: 'center' }}>
                       <div style={{ fontSize: '1.25rem', fontWeight: 900, color: formData.roomId === room._id ? 'var(--primary)' : 'var(--text-main)' }}>{room.roomNumber}</div>
                       <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '4px' }}>{room.category} • {room.type}</div>
                     </div>
                   ))}
                 </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr', gap: '16px', marginBottom: '32px' }}>
                  <div className="input-group"><label>Duration (Days)</label><input type="number" value={formData.stayDays} onChange={(e) => setFormData({...formData, stayDays: Number(e.target.value)})} style={{ height: '56px', fontSize: '1.25rem', fontWeight: 800, background: 'var(--surface)', color: 'var(--text-main)' }} /></div>
                  <div className="input-group"><label>Check-In</label><input type="date" value={formData.checkInDate} onChange={handleChange} style={{ height: '56px', background: 'var(--surface)', color: 'var(--text-main)' }} /></div>
                  <div className="input-group"><label>Expected Check-Out</label><div style={{ height: '56px', display: 'flex', alignItems: 'center', padding: '0 16px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--success)', fontWeight: 800 }}>{new Date(new Date(formData.checkInDate).getTime() + (formData.stayDays * 86400000)).toLocaleDateString()}</div></div>
               </div>

               <div style={{ background: formData.bookingType === 'HOURLY' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(16, 185, 129, 0.05)', border: `1px solid ${formData.bookingType === 'HOURLY' ? 'var(--primary)' : 'var(--success)'}`, borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', color: formData.bookingType === 'HOURLY' ? 'var(--primary)' : 'var(--success)' }}>
                  <Clock size={20} />
                  <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {formData.bookingType === 'HOURLY' ? 'Hourly Slot Policy: 1-4 Hours Max @ ₹599/head' : 'Standard Booking Rule: 7 PM to 7 AM (12 Hour Cycle)'}
                  </span>
               </div>

               <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '20px', textTransform: 'uppercase' }}>Room Add-ons</h4>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                  <div onClick={() => setFormData({...formData, isKitchenAllowance: !formData.isKitchenAllowance})} style={{ padding: '20px', borderRadius: '24px', border: `2px solid ${formData.isKitchenAllowance ? 'var(--success)' : 'var(--border)'}`, background: formData.isKitchenAllowance ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-sec)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><div style={{ width: '40px', height: '40px', background: 'var(--success)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Utensils size={20} /></div>
                    <div><div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Kitchen Access</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>+₹200</div></div></div>
                    {formData.isKitchenAllowance && <CheckCircle size={20} color="var(--success)" />}
                  </div>
                  <div onClick={() => setFormData({...formData, isPets: !formData.isPets})} style={{ padding: '20px', borderRadius: '24px', border: `2px solid ${formData.isPets ? 'var(--success)' : 'var(--border)'}`, background: formData.isPets ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-sec)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><div style={{ width: '40px', height: '40px', background: 'var(--text-muted)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><BedDouble size={20} /></div>
                    <div><div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Pets Allowed</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>+₹500</div></div></div>
                    {formData.isPets && <CheckCircle size={20} color="var(--success)" />}
                  </div>
               </div>
            </div>

            {/* Sticky Footer */}
            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}><UserCheck size={20} /> <span style={{ fontSize: '12px', fontWeight: 600 }}>Step 1: All Registrations</span></div>
               <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>₹{pricing.total.toFixed(0)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Est. Total</div>
                  </div>
                  <button type="button" className="btn btn-primary" onClick={() => setStep(2)} style={{ padding: '16px 48px', borderRadius: '20px', fontSize: '1.1rem', background: 'var(--primary)', color: 'var(--bg-dark)', border: 'none' }}>
                    Next — Settlement <ChevronRight size={20} style={{ marginLeft: '8px' }} />
                  </button>
               </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in" style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 24px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '24px', textTransform: 'uppercase' }}>Snacks & Dining Settlement</h4>
                
                <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
                  {formData.services.map(s => {
                    const Icon = s.name === 'Water' ? Droplets : (s.name === 'Breakfast' ? Utensils : Coffee);
                    return (
                      <div key={s.name} style={{ padding: '20px', borderRadius: '24px', background: 'var(--bg-sec)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '48px', height: '48px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37' }}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{s.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>₹{s.price} / unit</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--surface)', padding: '8px 16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                           <button type="button" onClick={() => updateSnackQuantity(s.name, -1)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', opacity: s.quantity === 0 ? 0.3 : 1 }} disabled={s.quantity === 0}><Minus size={18} /></button>
                           <span style={{ fontSize: '1.1rem', fontWeight: 900, minWidth: '24px', textAlign: 'center' }}>{s.quantity}</span>
                           <button type="button" onClick={() => updateSnackQuantity(s.name, 1)} style={{ background: '#d4af37', border: 'none', color: 'black', cursor: 'pointer', borderRadius: '8px', padding: '4px' }}><Plus size={18} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '20px', textTransform: 'uppercase' }}>Tax & Payment Policy</h4>
                <div style={{ display: 'grid', gap: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button type="button" onClick={() => setFormData({...formData, hasGst: true})} style={{ flex: 1, height: '56px', borderRadius: '16px', background: formData.hasGst ? 'var(--primary)' : 'var(--bg-sec)', color: formData.hasGst ? 'var(--bg-dark)' : 'var(--text-muted)', border: `1px solid ${formData.hasGst ? 'var(--primary)' : 'var(--border)'}`, fontWeight: 800, fontSize: '0.9rem' }}>WITH GST (12%)</button>
                      <button type="button" onClick={() => setFormData({...formData, hasGst: false})} style={{ flex: 1, height: '56px', borderRadius: '16px', background: !formData.hasGst ? 'var(--danger)' : 'var(--bg-sec)', color: !formData.hasGst ? 'white' : 'var(--text-muted)', border: `1px solid ${!formData.hasGst ? 'var(--danger)' : 'var(--border)'}`, fontWeight: 800, fontSize: '0.9rem' }}>WITHOUT GST</button>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button type="button" onClick={() => setFormData({...formData, paymentMethod: 'Online'})} className="btn" style={{ flex: 1, height: '56px', borderRadius: '16px', background: formData.paymentMethod === 'Online' ? 'var(--primary)' : 'var(--bg-sec)', color: formData.paymentMethod === 'Online' ? 'var(--bg-dark)' : 'var(--text-muted)', border: `1px solid ${formData.paymentMethod === 'Online' ? 'var(--primary)' : 'var(--border)'}`, fontWeight: 800, fontSize: '0.9rem' }}>Digital UPI</button>
                      <button type="button" onClick={() => setFormData({...formData, paymentMethod: 'Cash'})} className="btn" style={{ flex: 1, height: '56px', borderRadius: '16px', background: formData.paymentMethod === 'Cash' ? 'var(--primary)' : 'var(--bg-sec)', color: formData.paymentMethod === 'Cash' ? 'var(--bg-dark)' : 'var(--text-muted)', border: `1px solid ${formData.paymentMethod === 'Cash' ? 'var(--primary)' : 'var(--border)'}`, fontWeight: 800, fontSize: '0.9rem' }}>Cash Payment</button>
                    </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '20px', textTransform: 'uppercase' }}>Final Billing Summary</h4>
                <div style={{ padding: '32px', background: 'var(--bg-sec)', borderRadius: '32px', border: '1px solid var(--border)', position: 'sticky', top: '20px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}><span style={{ fontWeight: 600 }}>Room Charge ({formData.stayDays}d)</span><span style={{ fontWeight: 800 }}>₹{pricing.roomTotal}</span></div>
                   {formData.services.filter(s => s.quantity > 0).map(s => (<div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-muted)' }}><span>{s.name} (x{s.quantity})</span><span>₹{s.price * s.quantity}</span></div>))}
                   {formData.isKitchenAllowance && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-muted)' }}><span>Kitchen Access</span><span>₹300</span></div>}
                   {formData.isPets && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-muted)' }}><span>Pet Fee</span><span>₹500</span></div>}
                   <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-muted)' }}><span>GST (12%)</span><span>₹{pricing.gst.toFixed(0)}</span></div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '24px', fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}><span>Grand Total</span><span>₹{pricing.total.toFixed(0)}</span></div>
                </div>
              </div>
            </div>

            {/* Sticky Footer (Split Actions) */}
            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}>← Back to Profiles</button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn no-print" onClick={(e) => handleSubmit(e, false)} 
                  style={{ 
                    minWidth: '180px', 
                    borderRadius: '40px', 
                    background: 'var(--bg-sec)', 
                    color: 'var(--text-main)', 
                    border: '1px solid var(--border)', 
                    fontWeight: 800, 
                    fontSize: '0.95rem'
                  }} disabled={loading}>
                   Confirm Booking
                </button>
                <button type="button" className="btn btn-primary no-print" onClick={(e) => handleSubmit(e, true)} 
                  style={{ 
                    minWidth: '240px', 
                    borderRadius: '40px', 
                    background: 'var(--primary)', 
                    color: 'var(--bg-dark)', 
                    border: '1px solid var(--primary)', 
                    fontWeight: 900, 
                    fontSize: '0.95rem'
                  }} disabled={loading}>
                   {loading ? 'Processing...' : 'Generate & Print Bill'}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* 🧾 OFFICIAL LETTERHEAD PRINT TEMPLATE */}
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
                <p>NAME: <strong>{formData.name}</strong></p>
                <p>CONTACT: <strong>{formData.phone}</strong></p>
                <p>ID: <strong>{formData.identityType} - {formData.identityNumber}</strong></p>
             </div>
             <div>
                <p style={{ fontWeight: 800, marginBottom: '8px', borderBottom: '1px solid #ddd' }}>BOOKING SUMMARY</p>
                <p>ROOM NO: <strong>{selectedRoom?.roomNumber || 'N/A'}</strong> ({selectedRoom?.category})</p>
                <p>MODE: <strong>{formData.bookingType}</strong></p>
                <p>STAY: <strong>{formData.stayDays} Day(s)</strong> (Check-in: {formData.checkInDate})</p>
             </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '32px' }}>
             <thead>
                <tr style={{ background: '#f0f0f0', borderBottom: '1px solid black' }}>
                   <th style={{ textAlign: 'left', padding: '8px' }}>Description</th>
                   <th style={{ textAlign: 'right', padding: '8px' }}>Qty</th>
                   <th style={{ textAlign: 'right', padding: '8px' }}>Unit Price</th>
                   <th style={{ textAlign: 'right', padding: '8px' }}>Total</th>
                </tr>
             </thead>
             <tbody>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                   <td style={{ padding: '8px' }}>Base Room Charge</td>
                   <td style={{ textAlign: 'right', padding: '8px' }}>{formData.stayDays}</td>
                   <td style={{ textAlign: 'right', padding: '8px' }}>₹{pricing.dailyRoomCharge}</td>
                   <td style={{ textAlign: 'right', padding: '8px' }}>₹{pricing.roomTotal}</td>
                </tr>
                {formData.services.filter(s => s.quantity > 0).map(s => (
                   <tr key={s.name} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px' }}>{s.name}</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>{s.quantity}</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>₹{s.price}</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>₹{s.price * s.quantity}</td>
                   </tr>
                ))}
                {formData.isKitchenAllowance && (
                   <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px' }}>Kitchen Access Fee</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>1</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>₹300</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>₹300</td>
                   </tr>
                )}
             </tbody>
          </table>

          <div style={{ marginLeft: 'auto', width: '250px', fontSize: '13px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Subtotal:</span><span>₹{pricing.subTotal}</span></div>
             <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>GST (12%):</span><span>₹{pricing.gst.toFixed(0)}</span></div>
             <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid black', fontWeight: 900, fontSize: '16px' }}><span>GRAND TOTAL:</span><span>₹{pricing.total.toFixed(0)}</span></div>
          </div>

          <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
             <div style={{ textAlign: 'center' }}><div style={{ borderTop: '1px solid black', width: '120px', marginTop: '40px' }}>Manager Signature</div></div>
             <div style={{ textAlign: 'center' }}><div style={{ borderTop: '1px solid black', width: '120px', marginTop: '40px' }}>Guest Signature</div></div>
          </div>
          <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '9px', color: '#666' }}>Thank you for choosing Hotel Glitz. We hope you have a pleasant stay.</p>
      </div>
      </div>
    </div>
  );
};

export default Enrollment;
