import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BedDouble, Plus, Edit2, Trash2, Filter, Wifi, Snowflake, 
  Tv, GlassWater, Utensils, ShieldCheck, X, MapPin, Coffee, Wind, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Rooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [confirmRoom, setConfirmRoom] = useState(null);
  const [selectedFacilities, setSelectedFacilities] = useState(null); // Re-using for guest info
  const [activeBookings, setActiveBookings] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [checkoutBooking, setCheckoutBooking] = useState(null);
  const [checkoutStage, setCheckoutStage] = useState('audit');
  const { user, token } = useAuth();
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomData, setNewRoomData] = useState({ roomNumber: '', floor: '', type: 'Double', category: 'AC', price: '' });

  useEffect(() => {
    console.log('Rooms Status Page - Current Rooms:', rooms.length, rooms);
  }, [rooms]);

  useEffect(() => {
    if (token) fetchRooms();
  }, [token]);

  const fetchRooms = async () => {
    try {
      if (!token) return;
      const results = await Promise.allSettled([
        axios.get('http://localhost:5000/api/rooms', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/bookings/active', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const rData = results[0].status === 'fulfilled' ? results[0].value.data : [];
      const bData = results[1].status === 'fulfilled' ? results[1].value.data : [];
      
      setRooms(Array.isArray(rData) ? rData : []);
      setActiveBookings(Array.isArray(bData) ? bData : []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAvailable = async () => {
    if (!confirmRoom) return;
    try {
      setIsUpdating(true);
      await axios.put(`http://localhost:5000/api/rooms/${confirmRoom._id}`, { status: 'Available' });
      setRooms(prev => prev.map(r => r._id === confirmRoom._id ? { ...r, status: 'Available' } : r));
      setConfirmRoom(null);
    } catch (err) {
      alert('Error updating room status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    const { roomNumber, floor, price } = newRoomData;
    
    if (!roomNumber || !floor || !price) {
      return toast.error('Please fill all required fields (Room #, Floor, and Price)');
    }

    try {
      setIsUpdating(true);
      const payload = {
        ...newRoomData,
        floor: Number(floor),
        price: Number(price)
      };

      await axios.post('http://localhost:5000/api/rooms', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Room Registered Successfully!');
      setShowAddRoomModal(false);
      setNewRoomData({ roomNumber: '', floor: '', type: 'Double', category: 'AC', price: '' });
      fetchRooms(); 
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to add room');
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = Array.isArray(rooms) ? rooms.filter(r => 
    (filterType === 'All' || r?.type === filterType) &&
    (filterCategory === 'All' || r?.category === filterCategory)
  ) : [];

  const roomsByFloor = filtered.reduce((acc, room) => {
    (acc[room.floor] = acc[room.floor] || []).push(room);
    return acc;
  }, {});

  useEffect(() => {
    console.log('Rooms Mounted. Active Bookings Count:', activeBookings.length);
    if (activeBookings.length > 0) {
      console.log('Sample Booking Room Reference:', activeBookings[0].room);
    }
  }, [activeBookings]);

  const floors = Object.keys(roomsByFloor).sort();

  const getRoomCardStyle = (status) => {
    switch (status) {
      case 'Available': return { bg: 'rgba(16, 185, 129, 0.1)', dot: 'var(--success)', text: 'var(--success)', border: 'rgba(16, 185, 129, 0.2)' };
      case 'Maintenance': return { bg: 'var(--bg-sec)', dot: 'var(--text-muted)', text: 'var(--text-muted)', border: 'var(--border)' };
      case 'Cleaning': return { bg: 'rgba(234, 179, 8, 0.1)', dot: '#eab308', text: '#ca8a04', border: 'rgba(234, 179, 8, 0.2)' };
      case 'Occupied': return { bg: 'rgba(239, 68, 68, 0.1)', dot: 'var(--danger)', text: 'var(--danger)', border: 'rgba(239, 68, 68, 0.2)' };
      default: return { bg: 'var(--bg-sec)', dot: 'var(--text-muted)', text: 'var(--text-muted)', border: 'var(--border)' };
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '8px' }}>Room Status</h1>
          <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ padding: '2px 8px', background: 'var(--primary)', color: 'white', borderRadius: '4px', fontSize: '10px', fontWeight: 900 }}>v2.2.0</span>
            Monitor and manage all hotel rooms in real-time
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={fetchRooms}
            disabled={loading}
            style={{ padding: '12px 24px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', borderRadius: '12px', border: '1px solid var(--primary)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Syncing...' : 'Refresh Status'}
          </button>
          {['superadmin', 'subadmin'].includes(user?.role) && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Plus size={20} />
              <span>Register Room</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '32px', alignItems: 'center', background: 'var(--glass)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Filter size={18} style={{ color: 'var(--primary)' }} />
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="glass-card" 
            style={{ padding: '12px 20px', background: 'var(--surface)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '16px', fontSize: '14px', cursor: 'pointer', outline: 'none' }}
          >
            <option value="All">All Types</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Suite">Suite</option>
            <option value="Deluxe">Deluxe</option>
          </select>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)} 
            className="glass-card" 
            style={{ padding: '12px 20px', background: 'var(--surface)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '16px', fontSize: '14px', cursor: 'pointer', outline: 'none' }}
          >
            <option value="All">All Categories</option>
            <option value="AC">AC</option>
            <option value="NON-AC">Non-AC</option>
          </select>
        </div>
        <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
        <button 
          onClick={() => setShowAddRoomModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', background: 'var(--primary)', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: '13px', transition: '0.2s', boxShadow: '0 4px 12px rgba(212,175,55,0.2)' }}
        >
          <Plus size={18} />
          ADD ROOM
        </button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '40px' }}>Syncing rooms...</div> : (
        <>
          {floors.map(floor => (
            <div key={floor} style={{ marginBottom: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>Floor {floor}</h3>
                <div style={{ flex: 1, height: '1px', background: 'rgba(212, 175, 55, 0.1)' }}></div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                {roomsByFloor[floor].map(room => {
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
                        borderRadius: '16px',
                        transition: '0.3s ease'
                      }}
                      onClick={() => {
                        if (room.status === 'Available') navigate('/dashboard/enroll', { state: { roomNumber: room.roomNumber } });
                        else if (room.status === 'Cleaning' || room.status === 'Maintenance') setConfirmRoom(room);
                        else if (room.status === 'Occupied') {
                          // Standardize matching by checking both ID and roomNumber strings
                          const booking = activeBookings.find(b => 
                            (b.room?._id === room._id) || 
                            (String(b.room) === String(room._id)) ||
                            (b.room?.roomNumber === room.roomNumber)
                          );
                          setSelectedFacilities(booking || { room, isMissingData: true });
                        }
                      }}
                    >
                      {/* Top Section */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: style.dot, boxShadow: `0 0 10px ${style.dot}50` }}></div>
                        <BedDouble size={18} color="rgba(59, 130, 246, 0.4)" />
                      </div>

                      {/* Number Section */}
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', opacity: 0.6, letterSpacing: '1px', marginBottom: '2px' }}>NO</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, marginBottom: '4px' }}>{room.roomNumber}</div>
                        <div style={{ fontSize: '9px', color: '#06b6d4', fontWeight: 800, textDecoration: 'none', cursor: 'pointer', letterSpacing: '1px' }}>HISTORY</div>
                      </div>

                      {/* Info Label */}
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.5px' }}>
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
                        display: 'inline-block', 
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
              </div>
            </div>
          ))}
          {floors.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No rooms found matching filters.</p>}
        </>
      )}

      {confirmRoom && (
        <ConfirmationModal 
          room={confirmRoom} 
          loading={isUpdating} 
          onConfirm={handleMarkAvailable} 
          onCancel={() => setConfirmRoom(null)} 
        />
      )}

      {selectedFacilities && (
        <GuestInformationModal 
          booking={selectedFacilities} 
          onClose={() => setSelectedFacilities(null)} 
          navigate={navigate}
        />
      )}

      {showAddRoomModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(10px)' }}>
          <form onSubmit={handleCreateRoom} className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '450px', padding: '32px', border: '1px solid rgba(212,175,55,0.2)' }}>
             <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '24px', color: 'var(--text-main)', letterSpacing: '1px' }}>REGISTER NEW ROOM</h3>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
               <div style={{ textAlign: 'left' }}>
                 <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', display: 'block', letterSpacing: '1px' }}>ROOM NUMBER</label>
                 <input value={newRoomData.roomNumber} onChange={e => setNewRoomData({...newRoomData, roomNumber: e.target.value})} placeholder="e.g. 101" style={{ width: '100%', padding: '14px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }} required />
               </div>
               <div style={{ textAlign: 'left' }}>
                 <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', display: 'block', letterSpacing: '1px' }}>FLOOR</label>
                 <input value={newRoomData.floor} onChange={e => setNewRoomData({...newRoomData, floor: e.target.value})} placeholder="e.g. 1" style={{ width: '100%', padding: '14px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }} required />
               </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
               <div style={{ textAlign: 'left' }}>
                 <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', display: 'block', letterSpacing: '1px' }}>CATEGORY</label>
                 <select value={newRoomData.category} onChange={e => setNewRoomData({...newRoomData, category: e.target.value})} style={{ width: '100%', padding: '14px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}>
                   <option value="AC">AC</option>
                   <option value="NON-AC">NON-AC</option>
                 </select>
               </div>
               <div style={{ textAlign: 'left' }}>
                 <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', display: 'block', letterSpacing: '1px' }}>ROOM TYPE</label>
                 <select value={newRoomData.type} onChange={e => setNewRoomData({...newRoomData, type: e.target.value})} style={{ width: '100%', padding: '14px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}>
                   <option value="Single">Single</option>
                   <option value="Double">Double</option>
                   <option value="Suite">Suite</option>
                   <option value="Deluxe">Deluxe</option>
                 </select>
               </div>
             </div>

             <div style={{ textAlign: 'left', marginBottom: '32px' }}>
               <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px', display: 'block', letterSpacing: '1px' }}>BASE PRICE (₹)</label>
               <input type="number" value={newRoomData.price} onChange={e => setNewRoomData({...newRoomData, price: e.target.value})} placeholder="e.g. 2500" style={{ width: '100%', padding: '14px', background: 'var(--bg-sec)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }} required />
             </div>

             <button type="submit" disabled={isUpdating} style={{ width: '100%', background: 'var(--primary)', border: 'none', padding: '16px', borderRadius: '12px', color: 'black', fontWeight: 900, cursor: 'pointer', marginBottom: '12px', boxShadow: '0 4px 12px rgba(212,175,55,0.3)', transition: '0.2s' }}>
               {isUpdating ? 'Adding Room...' : 'Register Room'}
             </button>
             <button type="button" onClick={() => setShowAddRoomModal(false)} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', padding: '14px', borderRadius: '12px', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

const GuestInformationModal = ({ booking, onClose, navigate }) => {
  if (!booking.customer) return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(10px)', padding: '20px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '32px', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '16px' }}>Room {booking.room?.roomNumber || booking.roomNumber} Details</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          {booking.isMissingData 
            ? "Syncing guest records... If this persists, the booking may have been completed or cancelled."
            : "No active guest information found for this room."}
        </p>
        <button onClick={onClose} className="btn-primary" style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px' }}>Close</button>
      </div>
    </div>
  );

  return (
  <div style={{ position: 'fixed', inset: 0, background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(10px)', padding: '20px' }}>
      <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '450px', padding: '0', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)', position: 'relative' }}>
        <div style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(212,175,55,0.1), transparent)', borderBottom: '1px solid var(--border)', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '24px', fontWeight: 900 }}>{booking.customer.name.charAt(0)}</div>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '4px' }}>{booking.customer.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Room {booking.room?.roomNumber}</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border)' }}></span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Occupied</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div><p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>Contact Number</p><p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{booking.customer.phone}</p></div>
            <div><p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>Government ID</p><p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{booking.customer.identityType}: {booking.customer.identityNumber}</p></div>
            <div><p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>Check-in Date</p><p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{new Date(booking.createdAt).toLocaleDateString()}</p></div>
            <div><p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>Expected Checkout</p><p style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>{new Date(booking.expectedCheckOut).toLocaleDateString()}</p></div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(212,175,55,0.05)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.1)', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px', textTransform: 'uppercase' }}>Current Billing</p><p style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>₹{booking.totalAmount}</p></div>
              <div style={{ textAlign: 'right' }}><p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px', textTransform: 'uppercase' }}>Status</p><span style={{ padding: '4px 10px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '20px', fontSize: '10px', fontWeight: 900 }}>PAID</span></div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button onClick={onClose} style={{ padding: '14px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>Close View</button>
            <button onClick={() => { navigate('/dashboard', { state: { openCheckout: booking } }); onClose(); }} style={{ padding: '14px', borderRadius: '12px', background: 'var(--primary)', border: 'none', color: 'black', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.3)', transition: '0.2s' }}>Go to Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
};
const ConfirmationModal = ({ room, onConfirm, onCancel, loading }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(10px)', padding: '20px' }}>
    <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '400px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-main)' }}>
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: room.status === 'Cleaning' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(156, 163, 175, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 24px',
          color: room.status === 'Cleaning' ? '#3b82f6' : '#9ca3af'
        }}>
          <BedDouble size={32} />
        </div>
        
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-main)' }}>Room {room.roomNumber} Readiness</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px', lineHeight: '1.6' }}>
          Is this room fully inspected, cleaned, and ready for new guest check-in?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={onConfirm}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--success)', border: 'none', color: 'white', fontWeight: 'bold' }}
          >
            {loading ? 'Updating...' : 'Yes, Room is Ready'}
          </button>
          <button 
            onClick={onCancel}
            disabled={loading}
            className="btn"
            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--bg-sec)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
          >
            No, Stay in {room.status}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default Rooms;
