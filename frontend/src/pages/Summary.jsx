import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomData, setNewRoomData] = useState({ roomNumber: '', floor: '', type: 'Double', category: 'AC', price: '' });
  
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueData, setIssueData] = useState({ description: '' });

  const fetchStats = async () => {
    try {
      const results = await Promise.allSettled([
        axios.get('http://localhost:5000/api/bookings/summary', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/rooms', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/auth', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/attendance/today', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/bookings/active', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/services', { headers: { Authorization: `Bearer ${token}` } })
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
      console.error('Critical Stats fetch failed', err);
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
    
    if (!roomNumber || !floor || !price) {
      console.warn('Room Registration Failed: Missing required fields', newRoomData);
      return toast.error('Please fill all required fields (Room #, Floor, and Price)');
    }

    try {
      setIsUpdating(true);
      const payload = {
        ...newRoomData,
        floor: Number(floor),
        price: Number(price)
      };

      console.log('Sending Room Registration Request:', payload);
      
      const res = await axios.post('http://localhost:5000/api/rooms', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Room Registration Success:', res.data);
      setShowAddRoomModal(false);
      setNewRoomData({ roomNumber: '', floor: '', type: 'Double', category: 'AC', price: '' });
      fetchStats();
      toast.success(`Room ${roomNumber} registered successfully`);
    } catch (err) {
      console.error('Room Registration Error:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.msg || err.response?.data || 'Failed to create room. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();
    if (!issueData.description) return toast.error('Please enter description');
    try {
      setIsUpdating(true);
      await axios.post('http://localhost:5000/api/issues', { ...issueData, category: 'Other', priority: 'Medium' }, { headers: { Authorization: `Bearer ${token}` } });
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
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/add-service`, {
        name: service.name,
        price: service.price
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchStats();
      setShowServiceModal(null);
    } catch (err) {
      alert('Error adding service');
    }
  };

  const handleExtendStay = async (bookingId, days) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/extend`, { extraDays: days }, { headers: { Authorization: `Bearer ${token}` } });
      fetchStats();
      setShowExtendModal(null);
    } catch (err) {
      alert('Failed extension');
    }
  };

  const handleCheckout = async (id) => {
    try {
      setIsUpdating(true);
      await axios.put(`http://localhost:5000/api/bookings/${id}/check-out`, {
        penaltyAmount: penaltyData.amount,
        penaltyReason: penaltyData.reason,
        isKeyReturned: penaltyData.isKeyReturned,
        isPropertyDamaged: penaltyData.isPropertyDamaged,
        paymentMethod: checkoutBooking.paymentMethod
      }, { headers: { Authorization: `Bearer ${token}` } });
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
      await axios.put(`http://localhost:5000/api/rooms/${confirmRoom._id}`, { status: 'Available' }, { headers: { Authorization: `Bearer ${token}` } });
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
      case 'Available': return { bg: 'rgba(16, 185, 129, 0.05)', dot: '#10b981', text: '#059669', border: 'rgba(16, 185, 129, 0.1)' };
      case 'Maintenance': return { bg: 'rgba(107, 114, 128, 0.05)', dot: '#6b7280', text: '#4b5563', border: 'rgba(107, 114, 128, 0.1)' };
      case 'Cleaning': return { bg: 'rgba(234, 179, 8, 0.05)', dot: '#eab308', text: '#ca8a04', border: 'rgba(234, 179, 8, 0.1)' };
      case 'Occupied': return { bg: 'rgba(239, 68, 68, 0.05)', dot: '#ef4444', text: '#dc2626', border: 'rgba(239, 68, 68, 0.1)' };
      default: return { bg: 'var(--bg-sec)', dot: '#9ca3af', text: '#4b5563', border: 'var(--border)' };
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /> Syncing Global Data...</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '4px' }}>HMS Performance Overview</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Real-time operational metrics for {user?.name}.</p>
      </div>

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
                  if (room.status === 'Available') navigate('/dashboard/enroll', { state: { roomNumber: room.roomNumber } });
                  else if (room.status === 'Cleaning' || room.status === 'Maintenance') setConfirmRoom(room);
                  else if (room.status === 'Occupied') {
                    const booking = activeBookings.find(b => b.room?.roomNumber === room.roomNumber);
                    setSelectedFacilities(booking || { room }); // Re-using state for quickview
                  }
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
                  <Snowflake size={12} />
                  <Wifi size={12} />
                  <MapPin size={12} />
                  <Coffee size={12} />
                  <Wind size={12} />
                </div>

                {/* Status Pill */}
                <div style={{ 
                  padding: '4px 14px', 
                  borderRadius: '20px', 
                  fontSize: '10px', 
                  fontWeight: 900, 
                  background: 'white', 
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(10px)' }}>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(10px)' }}>
          <form onSubmit={handleCreateRoom} className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
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
      {/* Guest Information QuickView Modal */}
      {selectedFacilities && selectedFacilities.customer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(10px)' }}>
          <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '450px', padding: '0', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)', position: 'relative' }}>
            {/* Header section */}
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(212,175,55,0.1), transparent)', borderBottom: '1px solid var(--border)', position: 'relative' }}>
              <button 
                onClick={() => setSelectedFacilities(null)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '24px', fontWeight: 900 }}>
                  {selectedFacilities.customer.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '4px' }}>{selectedFacilities.customer.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Room {selectedFacilities.room?.roomNumber}</span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border)' }}></span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Occupied</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content section */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>Contact Number</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{selectedFacilities.customer.phone}</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>Government ID (Aadhaar)</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{selectedFacilities.customer.aadhar || 'Not Provided'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>Check-in Date</p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{new Date(selectedFacilities.createdAt).toLocaleDateString()} {new Date(selectedFacilities.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>Expected Checkout</p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>{new Date(selectedFacilities.expectedCheckOut).toLocaleDateString()}</p>
                </div>
              </div>

              <div style={{ padding: '16px', background: 'rgba(212,175,55,0.05)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.1)', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px', textTransform: 'uppercase' }}>Current Billing</p>
                    <p style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>₹{selectedFacilities.totalAmount}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px', textTransform: 'uppercase' }}>Status</p>
                    <span style={{ padding: '4px 10px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '20px', fontSize: '10px', fontWeight: 900 }}>PAID</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button 
                  onClick={() => setSelectedFacilities(null)}
                  style={{ padding: '14px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}
                >
                  Close View
                </button>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary;
