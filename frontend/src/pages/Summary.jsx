import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

import { useAuth } from '../context/AuthContext';
import { 
  DollarSign, TrendingUp, Users, Calendar, Wallet, BedDouble, 
  UserCheck, UserX, Loader2, Wifi, Zap, Coffee, MapPin, 
  Wind, Star, Crown, History, X, CheckCircle, Snowflake,
  Tv, GlassWater, Utensils, ShieldCheck, Bell, Search,
  Clock, LogOut, MessageSquare, IndianRupee,
  UtensilsCrossed, Plus, AlertTriangle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const amenityMap = {
  'WiFi': { icon: Wifi, label: 'High Speed WiFi' },
  'Air Conditioning': { icon: Snowflake, label: 'Climate Control AC' },
  'Smart TV': { icon: Tv, label: 'Smart 4K TV' },
  'Mini Bar': { icon: GlassWater, label: 'Stocked Mini Bar' },
  'Safe': { icon: ShieldCheck, label: 'Secure Safe Box' },
  'Room Service': { icon: Utensils, label: '24/7 Room Service' }
};

const StatCard = ({ title, value, subtext, icon: Icon }) => (
  <div className="glass-card" style={{ padding: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>{title}</p>
        <h2 style={{ fontSize: '1.8rem', margin: '4px 0', fontWeight: '800' }}>{value}</h2>
      </div>
      <div style={{ padding: '10px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', borderRadius: '10px' }}>
        <Icon size={20} />
      </div>
    </div>
    <p style={{ color: 'var(--success)', fontSize: '12px', fontWeight: '600' }}>{subtext}</p>
  </div>
);

const Summary = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    bookings: { day: 0, month: 0, year: 0 },
    rooms: { total: 0, available: 0 },
    users: 0,
    attendance: { present: 0, leave: 0 }
  });
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [confirmRoom, setConfirmRoom] = useState(null);
  const [selectedFacilities, setSelectedFacilities] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeBookings, setActiveBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkoutBooking, setCheckoutBooking] = useState(null);
  const [checkoutStage, setCheckoutStage] = useState('audit'); 
  const [penaltyData, setPenaltyData] = useState({ amount: 0, reason: '', isKeyReturned: false, isPropertyDamaged: false });
  const [review, setReview] = useState(5);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(null);
  const [showExtendModal, setShowExtendModal] = useState(null);
  const [extensionDays, setExtensionDays] = useState(1);
  const [availableServices, setAvailableServices] = useState([]);
  const [billingData, setBillingData] = useState({ amount: '', method: '' });
  
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomData, setNewRoomData] = useState({ roomNumber: '', floor: '', type: 'Double', category: 'AC', price: '' });
  
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueData, setIssueData] = useState({ description: '' });

  const fetchStats = async () => {
    try {
      const results = await Promise.allSettled([
        axios.get('/api/bookings/summary'),
        axios.get('/api/rooms'),
        axios.get('/api/auth'),
        axios.get('/api/attendance/today'),
        axios.get('/api/bookings/active'),
        axios.get('/api/services')
      ]);
      
      const getData = (idx, defaultVal = {}) => 
        results[idx].status === 'fulfilled' ? results[idx].value.data : defaultVal;

      const bData = getData(0, { day: 0, month: 0, year: 0 });
      const rData = getData(1, []);
      const uData = getData(2, []);
      const aData = getData(3, []);
      const activeBData = getData(4, []);
      const sData = getData(5, []);

      setStats({
        bookings: bData,
        rooms: { 
          total: Array.isArray(rData) ? rData.length : 0, 
          available: Array.isArray(rData) ? rData.filter(r => r.status === 'Available').length : 0
        },
        users: uData.length,
        attendance: { 
          present: Array.isArray(aData) ? aData.filter(a => a.status === 'Present').length : 0, 
          leave: Array.isArray(aData) ? aData.filter(a => a.status === 'Leave').length : 0 
        }
      });
      
      setRooms(Array.isArray(rData) ? rData : []);
      setActiveBookings(activeBData || []);
      setAvailableServices(Array.isArray(sData) ? sData.filter(s => s.status === 'Active') : []);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Critical Stats fetch failed', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
      const interval = setInterval(fetchStats, 15000); // Poll every 15s to sync all dashboards
      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    if (location.state?.openCheckout) {
      setCheckoutBooking(location.state.openCheckout);
      setCheckoutStage('audit');
      // Clear location state to prevent re-opening on manual refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    const { roomNumber, floor, price } = newRoomData;
    
    // Strict field validation
    if (!roomNumber?.trim() || floor === '' || price === '') {
      return toast.error('Required fields: Room Number, Floor, and Price');
    }

    try {
      setIsUpdating(true);
      const payload = {
        ...newRoomData,
        roomNumber: roomNumber.trim(),
        floor: Number(floor),
        price: Number(price)
      };
      
      await axios.post('/api/rooms', payload);

      setShowAddRoomModal(false);
      setNewRoomData({ roomNumber: '', floor: '', type: 'Double', category: 'AC', price: '' });
      fetchStats();
      toast.success(`Room ${payload.roomNumber} added to inventory`);
    } catch (err) {
      console.error('Room Creation Error:', err);
      const errorMessage = err.response?.data?.msg || 'Error connecting to room management';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();
    if (!issueData.description) return toast.error('Please enter description');
    try {
      setIsUpdating(true);
      await axios.post('/api/issues', { ...issueData, category: 'Other', priority: 'Medium' });
      setShowIssueModal(false);
      setIssueData({ description: '' });
      toast.success('Reported successfully to Management');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error reporting');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddService = async (bookingId, service) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/add-service`, {
        name: service.name,
        price: service.price
      });
      fetchStats();
      setShowServiceModal(null);
    } catch (err) {
      alert('Error adding service');
    }
  };

  const handleExtendStay = async (bookingId, days) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/extend`, { extraDays: days });
      fetchStats();
      setShowExtendModal(null);
    } catch (err) {
      alert('Failed extension');
    }
  };

  const handleCheckout = async (id) => {
    try {
      setIsUpdating(true);
      await axios.put(`/api/bookings/${id}/check-out`, {
        penaltyAmount: penaltyData.amount,
        penaltyReason: penaltyData.reason,
        isKeyReturned: penaltyData.isKeyReturned,
        isPropertyDamaged: penaltyData.isPropertyDamaged,
        paymentMethod: billingData.method,
        finalSettlementAmount: billingData.amount || (checkoutBooking.totalAmount + (penaltyData.amount || 0))
      });
      fetchStats();
      setCheckoutStage('success');
    } catch (err) {
      alert('Error checkout');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAvailable = async () => {
    if (!confirmRoom) return;
    try {
      setIsUpdating(true);
      await axios.put(`/api/rooms/${confirmRoom._id}`, { status: 'Available' });
      fetchStats();
      setConfirmRoom(null);
    } catch (err) {
      alert('Error room status');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredRooms = rooms.filter(r => filter === 'ALL' ? true : r.category === filter);

  const getRoomCardStyle = (status) => {
    switch (status) {
      case 'Available': return { bg: 'rgba(16, 185, 129, 0.1)', dot: '#10b981', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)' };
      case 'Maintenance': return { bg: 'rgba(100, 116, 139, 0.1)', dot: '#64748b', text: '#64748b', border: 'rgba(100, 116, 139, 0.2)' };
      case 'Cleaning': return { bg: 'rgba(59, 130, 246, 0.1)', dot: '#3b82f6', text: '#2563eb', border: 'rgba(59, 130, 246, 0.2)' };
      case 'Occupied': return { bg: 'rgba(239, 68, 68, 0.1)', dot: '#ef4444', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' };
      default: return { bg: 'rgba(100, 116, 139, 0.1)', dot: '#64748b', text: '#64748b', border: 'rgba(100, 116, 139, 0.2)' };
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /> Syncing Global Data...</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <StatCard title="Today's Bookings" value={stats.bookings.day} subtext="New Check-ins" icon={Calendar} />
        <StatCard title="Available Rooms" value={stats.rooms.available} subtext={`of ${stats.rooms.total} total`} icon={BedDouble} />
        <StatCard title="Staff Active" value={stats.attendance.present} subtext="On duty now" icon={UserCheck} />
        <StatCard title="Global Users" value={stats.users} subtext="System accounts" icon={Users} />
      </div>

      <div style={{ marginTop: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>AVAILABLE ROOMS</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage guest lifecycle and room operations.</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['ALL', 'AC', 'NON-AC'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: filter === f ? 'var(--bg-sec)' : 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                  {f}
                </button>
              ))}
            </div>
            <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
            <button 
              onClick={() => setShowAddRoomModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', background: 'var(--primary)', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: '12px', transition: '0.2s', boxShadow: '0 4px 12px rgba(212,175,55,0.2)' }}
            >
              <Plus size={16} />
              ADD ROOM
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
          {filteredRooms.map(room => {
            const style = getRoomCardStyle(room.status);
            return (
              <div 
                key={room._id} 
                className="glass-card clickable-card" 
                style={{ 
                  padding: '16px', 
                  textAlign: 'center', 
                  position: 'relative', 
                  background: style.bg, 
                  border: `1px solid ${style.border}`,
                  transition: '0.3s ease',
                  borderRadius: '16px'
                }} 
                onClick={() => {
                  const lookupRoom = (room.roomNumber || '').toString();
                  const booking = activeBookings.find(b => 
                    (b.room?.roomNumber?.toString() === lookupRoom) || 
                    (b.room === room._id)
                  );
                  setSelectedFacilities(booking ? { ...booking, room } : room);
                }}
              >
                {/* Top Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: style.dot, boxShadow: `0 0 10px ${style.dot}50` }}></div>
                  <BedDouble size={20} color="rgba(59, 130, 246, 0.4)" />
                </div>

                {/* Number Section */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', opacity: 0.6, letterSpacing: '1px', marginBottom: '2px' }}>NO</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, marginBottom: '4px' }}>{room.roomNumber}</div>
                  <div style={{ fontSize: '10px', color: '#06b6d4', fontWeight: 800, textDecoration: 'none', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase' }}>HISTORY</div>
                </div>

                {/* Type Label */}
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.5px' }}>
                  {room.category} • {room.type?.toUpperCase()}
                </div>

                {/* Facility Icons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '16px', opacity: 0.4 }}>
                  {(room.amenities?.length > 0 ? room.amenities : ['WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Safe', 'Room Service']).slice(0, 5).map((name, i) => {
                    const Icon = amenityMap[name]?.icon || Snowflake;
                    return <Icon key={i} size={12} />;
                  })}
                </div>

                {/* Status Pill */}
                <div style={{ 
                  padding: '4px 14px', 
                  borderRadius: '20px', 
                  fontSize: '10px', 
                  fontWeight: 900, 
                  background: 'var(--surface)', 
                  color: style.dot,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                  textTransform: 'uppercase'
                }}>
                  {room.status}
                </div>
              </div>
            );
          })}

          {filteredRooms.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              No rooms found matching your filters.
            </div>
          )}
        </div>
      </div>



      {/* Modals */}
      {confirmRoom && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(10px)' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '32px', textAlign: 'center' }}>
             <h3>Room {confirmRoom.roomNumber} Ready?</h3>
             <button onClick={handleMarkAvailable} className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }}>Yes, Set Available</button>
             <button onClick={() => setConfirmRoom(null)} className="btn" style={{ width: '100%', marginTop: '12px' }}>Cancel</button>
          </div>
        </div>
      )}

      {showIssueModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001, backdropFilter: 'blur(15px)', padding: '20px' }}>
          <form onSubmit={handleReportIssue} className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '500px', padding: '32px', border: '1px solid var(--border)', background: 'var(--bg-main)' }}>
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
                onChange={e => setIssueData({ ...issueData, description: e.target.value })} 
                placeholder="Describe the issue here..." 
                style={{ width: '100%', minHeight: '180px', padding: '24px', borderRadius: '16px', background: 'var(--bg-sec)', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '16px', lineHeight: '1.6', resize: 'none' }} 
                required 
              />
            </div>
            <button type="submit" disabled={isUpdating} style={{ width: '100%', height: '56px', background: '#d4af37', border: 'none', borderRadius: '16px', color: 'black', fontWeight: 900, fontSize: '16px', cursor: 'pointer', transition: '0.2s' }}>
              {isUpdating ? 'Sending...' : 'Submit to Management'}
            </button>
          </form>
        </div>
      )}

      {showAddRoomModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(10px)' }}>
          <form onSubmit={handleCreateRoom} className="glass-card" style={{ position: 'relative', width: '100%', maxWidth: '400px', padding: '32px', overflow: 'hidden' }}>
            {isUpdating && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100, gap: '16px' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                <span style={{ color: 'var(--primary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>Processing Room...</span>
              </div>
            )}
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '24px', color: 'var(--text-main)' }}>Register New Room</h3>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
               <div style={{ textAlign: 'left' }}>
                 <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', display: 'block' }}>ROOM NUMBER</label>
                 <input value={newRoomData.roomNumber} onChange={e => setNewRoomData({...newRoomData, roomNumber: e.target.value})} placeholder="e.g. 101" style={{ width: '100%', padding: '12px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }} required />
               </div>
               <div style={{ textAlign: 'left' }}>
                 <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', display: 'block' }}>FLOOR</label>
                 <input value={newRoomData.floor} onChange={e => setNewRoomData({...newRoomData, floor: e.target.value})} placeholder="e.g. 1" style={{ width: '100%', padding: '12px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }} required />
               </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
               <div style={{ textAlign: 'left' }}>
                 <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', display: 'block' }}>CATEGORY</label>
                 <select value={newRoomData.category} onChange={e => setNewRoomData({...newRoomData, category: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}>
                   <option value="AC">AC</option>
                   <option value="NON-AC">NON-AC</option>
                 </select>
               </div>
               <div style={{ textAlign: 'left' }}>
                 <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', display: 'block' }}>ROOM TYPE</label>
                 <select value={newRoomData.type} onChange={e => setNewRoomData({...newRoomData, type: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}>
                   <option value="Single">Single</option>
                   <option value="Double">Double</option>
                   <option value="Suite">Suite</option>
                   <option value="Deluxe">Deluxe</option>
                 </select>
               </div>
             </div>

             <div style={{ textAlign: 'left', marginBottom: '24px' }}>
               <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', display: 'block' }}>BASE PRICE (₹)</label>
               <input type="number" value={newRoomData.price} onChange={e => setNewRoomData({...newRoomData, price: e.target.value})} placeholder="e.g. 2500" style={{ width: '100%', padding: '12px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }} required />
             </div>

             <button type="submit" disabled={isUpdating} style={{ width: '100%', background: 'var(--primary)', border: 'none', padding: '16px', borderRadius: '12px', color: 'black', fontWeight: 900, cursor: 'pointer', marginBottom: '12px', transition: '0.2s' }}>
               {isUpdating ? 'Adding Room...' : 'Register Room'}
             </button>
             <button type="button" onClick={() => setShowAddRoomModal(false)} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', padding: '12px', borderRadius: '12px', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          </form>
        </div>
      )}
      {/* Guest Information / Room QuickView Modal */}
      {selectedFacilities && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000, backdropFilter: 'blur(10px)', padding: '20px' }}>
          <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '550px', padding: '0', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)', position: 'relative', background: 'var(--surface)', minHeight: '400px' }}>
            {/* Header section */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(212,175,55,0.1), transparent)', borderBottom: '1px solid var(--border)', position: 'relative' }}>
              <button 
                onClick={() => setSelectedFacilities(null)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '24px', fontWeight: 900 }}>
                  {selectedFacilities.customer ? selectedFacilities.customer.name.charAt(0) : <BedDouble size={28} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {selectedFacilities.customer ? selectedFacilities.customer.name : `Room ${selectedFacilities.room?.roomNumber || selectedFacilities.roomNumber}`}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Room {selectedFacilities.room?.roomNumber || selectedFacilities.roomNumber}
                    </span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border)' }}></span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {selectedFacilities.customer ? 'Occupied' : (selectedFacilities.status || 'Available')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content section */}
            <div style={{ padding: '32px' }}>
              {/* 1. ROOM FACILITIES (Always shown) */}
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '10px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '2px', marginBottom: '16px', textTransform: 'uppercase' }}>Room Facilities & Perks</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {( (selectedFacilities.customer ? selectedFacilities.room?.amenities : selectedFacilities.amenities)?.length > 0 
                     ? (selectedFacilities.customer ? selectedFacilities.room.amenities : selectedFacilities.amenities) 
                     : ['WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Safe', 'Room Service']
                  ).slice(0, 6).map(name => {
                    const item = amenityMap[name] || { icon: ShieldCheck, label: name };
                    const Icon = item.icon;
                    return (
                      <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <div style={{ color: 'var(--primary)' }}><Icon size={14} /></div>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-main)' }}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. GUEST INFORMATION (If occupied) */}
              {selectedFacilities.customer && (
                <div style={{ padding: '20px', background: 'rgba(212,175,55,0.05)', borderRadius: '16px', border: '1px solid rgba(212,175,55,0.1)', marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '16px', textTransform: 'uppercase' }}>In-House Guest Details</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Contact</p>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{selectedFacilities.customer.phone}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Identity</p>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{selectedFacilities.customer.identityType}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
                    <div>
                      <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Total Due</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>₹{selectedFacilities.totalAmount}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '9px', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Checkout Date</p>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--danger)' }}>{new Date(selectedFacilities.expectedCheckOut).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. ACTION BUTTONS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button 
                  onClick={() => setSelectedFacilities(null)}
                  style={{ padding: '14px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}
                >
                  Close View
                </button>
                {selectedFacilities.customer ? (
                  <button 
                    onClick={() => {
                      setCheckoutBooking(selectedFacilities);
                      setCheckoutStage('audit');
                      setSelectedFacilities(null);
                    }}
                    style={{ padding: '14px', borderRadius: '12px', background: 'var(--primary)', border: 'none', color: 'black', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.3)', transition: '0.2s' }}
                  >
                    Checkout Audit
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      if (selectedFacilities.status === 'Available') {
                        navigate('/dashboard/enroll', { state: { roomNumber: selectedFacilities.roomNumber || selectedFacilities.room?.roomNumber } });
                      } else {
                        handleMarkAvailable(selectedFacilities);
                      }
                      setSelectedFacilities(null);
                    }}
                    style={{ padding: '14px', borderRadius: '12px', background: 'var(--primary)', border: 'none', color: 'black', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.3)', transition: '0.2s' }}
                  >
                    {selectedFacilities.status === 'Available' ? 'Book Room' : 'Mark Ready'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 ENHANCED MULTI-STAGE CHECKOUT MODAL */}
      {checkoutBooking && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '550px', padding: '0', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-main)' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', borderRadius: '8px' }}><LogOut size={20} /></div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '2px', color: 'var(--text-main)' }}>Room {checkoutBooking.room?.roomNumber} Checkout</h2>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Guest: {checkoutBooking.customer?.name} • ID: #{checkoutBooking._id.slice(-6).toUpperCase()}</p>
                </div>
              </div>
              <button 
                onClick={() => { setCheckoutBooking(null); setCheckoutStage('audit'); setBillingData({ amount: '', method: '' }); }} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '32px' }}>
              {/* STAGE 1: AUDIT & SHIFTING */}
              {checkoutStage === 'audit' && (
                <div className="animate-fade-in">
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '1px', marginBottom: '16px', textTransform: 'uppercase' }}>Stage 1: Property Verification</h4>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Please confirm room formalities and key return status before settling the final bill.</p>
                    
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div 
                        onClick={() => setPenaltyData({...penaltyData, isKeyReturned: !penaltyData.isKeyReturned})}
                        style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: penaltyData.isKeyReturned ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-sec)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s' }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>Room Keys Returned?</span>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid ' + (penaltyData.isKeyReturned ? '#10b981' : 'var(--border)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {penaltyData.isKeyReturned && <CheckCircle size={14} color="#10b981" />}
                        </div>
                      </div>

                      <div 
                        onClick={() => setPenaltyData({...penaltyData, isPropertyDamaged: !penaltyData.isPropertyDamaged})}
                        style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: penaltyData.isPropertyDamaged ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-sec)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s' }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>Property Damage Noted?</span>
                        <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid ' + (penaltyData.isPropertyDamaged ? '#ef4444' : 'var(--border)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {penaltyData.isPropertyDamaged && <div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '2px' }}></div>}
                        </div>
                      </div>

                      {penaltyData.isPropertyDamaged && (
                        <div className="input-group animate-slide-down">
                          <label style={{ color: '#ef4444', fontWeight: 900 }}>Penalty Amount (₹)</label>
                          <input 
                            type="number" 
                            value={penaltyData.amount} 
                            onChange={e => setPenaltyData({...penaltyData, amount: Number(e.target.value)})} 
                            placeholder="Enter damage cost..."
                            style={{ borderColor: '#ef4444' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '32px' }}>
                    <button 
                      onClick={() => navigate('/dashboard/enroll', { state: { shiftingFrom: checkoutBooking } })}
                      style={{ padding: '16px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <History size={18} /> Room Shifting
                    </button>
                    <button 
                      disabled={!penaltyData.isKeyReturned}
                      onClick={() => setCheckoutStage('billing')}
                      style={{ padding: '16px', borderRadius: '12px', background: 'var(--primary)', border: 'none', color: 'black', fontWeight: 900, cursor: 'pointer', opacity: penaltyData.isKeyReturned ? 1 : 0.5 }}
                    >
                      Proceed to Billing
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 2: FINAL BILLING & PAYMENT */}
              {checkoutStage === 'billing' && (
                <div className="animate-fade-in">
                  <h4 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '1px', marginBottom: '16px', textTransform: 'uppercase' }}>Stage 2: settlement</h4>
                  
                  <div style={{ background: 'var(--bg-sec)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Original Stay Cost</span>
                      <span style={{ fontWeight: 700 }}>₹{checkoutBooking.totalAmount}</span>
                    </div>
                    {penaltyData.amount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#ef4444' }}>
                        <span style={{ fontSize: '14px' }}>Penalty / Damages</span>
                        <span style={{ fontWeight: 700 }}>+₹{penaltyData.amount}</span>
                      </div>
                    )}
                    <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 900 }}>Grand Total</span>
                      <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)' }}>₹{checkoutBooking.totalAmount + (penaltyData.amount || 0)}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '32px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Set Settlement Amount (₹)</label>
                    <div style={{ position: 'relative' }}>
                       <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: 'var(--text-muted)' }}>₹</span>
                       <input 
                         type="number" 
                         value={billingData.amount || (checkoutBooking.totalAmount + (penaltyData.amount || 0))} 
                         onChange={e => setBillingData({...billingData, amount: e.target.value})}
                         style={{ paddingLeft: '32px', height: '56px', fontSize: '1.2rem', fontWeight: 900, background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--text-main)', width: '100%' }}
                       />
                    </div>
                  </div>

                  <div style={{ marginBottom: '40px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '12px', display: 'block', textTransform: 'uppercase' }}>Select Payment Method</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <button 
                        onClick={() => setBillingData({...billingData, method: 'Cash'})}
                        style={{ padding: '16px', borderRadius: '16px', border: '2px solid ' + (billingData.method === 'Cash' ? 'var(--primary)' : 'var(--border)'), background: billingData.method === 'Cash' ? 'rgba(212, 175, 55, 0.1)' : 'var(--bg-sec)', color: billingData.method === 'Cash' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 900, cursor: 'pointer', transition: '0.2s' }}
                      >
                        CASH PAYMENT
                      </button>
                      <button 
                        onClick={() => setBillingData({...billingData, method: 'UPI'})}
                        style={{ padding: '16px', borderRadius: '16px', border: '2px solid ' + (billingData.method === 'UPI' ? 'var(--primary)' : 'var(--border)'), background: billingData.method === 'UPI' ? 'rgba(212, 175, 55, 0.1)' : 'var(--bg-sec)', color: billingData.method === 'UPI' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 900, cursor: 'pointer', transition: '0.2s' }}
                      >
                        UPI / ONLINE
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '12px' }}>
                    <button 
                      disabled={!billingData.method || isUpdating}
                      onClick={() => handleCheckout(checkoutBooking._id)}
                      style={{ width: '100%', padding: '18px', borderRadius: '16px', background: 'var(--primary)', color: 'black', fontWeight: 900, border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: billingData.method ? 1 : 0.5 }}
                    >
                      {isUpdating ? 'Processing...' : 'Confirm Checkout & Stay'}
                    </button>
                    <button 
                      onClick={() => window.print()}
                      style={{ width: '100%', padding: '14px', borderRadius: '16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 800, cursor: 'pointer' }}
                    >
                      Generate Provisional Bill
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 3: SUCCESS */}
              {checkoutStage === 'success' && (
                <div className="animate-fade-in" style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CheckCircle size={48} />
                  </div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '8px' }}>Checkout Complete!</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>The guest record has been archived and the room is now marked for cleaning.</p>
                  
                  <button 
                    onClick={() => { setCheckoutBooking(null); setCheckoutStage('audit'); fetchStats(); }}
                    style={{ width: '100%', padding: '18px', borderRadius: '16px', background: 'var(--primary)', color: 'black', fontWeight: 900, border: 'none', cursor: 'pointer' }}
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🧾 OFFICIAL LETTERHEAD PRINT TEMPLATE */}
        <div id="printable-bill" style={{ display: 'none' }}>
           {/* Simple static template for window.print() */}
           <div style={{ padding: '40px', color: 'black' }}>
             <h1 style={{ textAlign: 'center' }}>HOTEL SHUBHA SAI - FINAL BILL</h1>
             <hr />
             <p>Guest: {checkoutBooking.customer?.name}</p>
             <p>Room: {checkoutBooking.room?.roomNumber}</p>
             <p>Amount Settled: ₹{billingData.amount}</p>
             <p>Method: {billingData.method}</p>
             <p>Date: {new Date().toLocaleDateString()}</p>
           </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Summary;
