import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  BedDouble, Plus, Edit2, Trash2, Filter, Wifi, Snowflake, 
  Tv, GlassWater, Utensils, ShieldCheck, X, MapPin, Coffee, Wind, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const amenityMap = {
  'WiFi': { icon: Wifi, label: 'High Speed WiFi' },
  'Air Conditioning': { icon: Snowflake, label: 'Climate Control AC' },
  'Smart TV': { icon: Tv, label: 'Smart 4K TV' },
  'Mini Bar': { icon: GlassWater, label: 'Stocked Mini Bar' },
  'Safe': { icon: ShieldCheck, label: 'Secure Safe Box' },
  'Room Service': { icon: Utensils, label: '24/7 Room Service' }
};

const Rooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [confirmRoom, setConfirmRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null); // Updated state for room details
  const [activeBookings, setActiveBookings] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, token } = useAuth();
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomData, setNewRoomData] = useState({ roomNumber: '', floor: '', type: 'Double', category: 'AC', price: '' });

  useEffect(() => {
    if (token) fetchRooms();
  }, [token]);

  const fetchRooms = async () => {
    try {
      if (!token) return;
      const results = await Promise.allSettled([
        axios.get('/api/rooms'),
        axios.get('/api/bookings/active')
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
    const targetRoom = confirmRoom || selectedRoom;
    if (!targetRoom) return;
    try {
      setIsUpdating(true);
      await axios.put(`/api/rooms/${targetRoom._id}`, { status: 'Available' });
      setRooms(prev => prev.map(r => r._id === targetRoom._id ? { ...r, status: 'Available' } : r));
      setConfirmRoom(null);
      setSelectedRoom(null);
      toast.success(`Room ${targetRoom.roomNumber} is now Available`);
    } catch (err) {
      toast.error('Error updating room status');
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

      await axios.post('/api/rooms', payload);

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

  const floors = Object.keys(roomsByFloor).sort();

  const getRoomCardStyle = (status) => {
    switch (status) {
      case 'Available': return { bg: 'rgba(16, 185, 129, 0.1)', dot: '#10b981', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)' };
      case 'Maintenance': return { bg: 'rgba(100, 116, 139, 0.1)', dot: '#64748b', text: '#64748b', border: 'rgba(100, 116, 139, 0.2)' };
      case 'Cleaning': return { bg: 'rgba(59, 130, 246, 0.1)', dot: '#3b82f6', text: '#2563eb', border: 'rgba(59, 130, 246, 0.2)' };
      case 'Occupied': return { bg: 'rgba(239, 68, 68, 0.1)', dot: '#ef4444', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' };
      default: return { bg: 'rgba(100, 116, 139, 0.1)', dot: '#64748b', text: '#64748b', border: 'rgba(100, 116, 139, 0.2)' };
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
          {['superadmin', 'admin', 'subadmin'].includes(user?.role?.toLowerCase()) && (
            <button onClick={() => setShowAddRoomModal(true)} className="btn-primary" style={{ padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: style.dot, boxShadow: `0 0 10px ${style.dot}50` }}></div>
                        <BedDouble size={18} color="rgba(59, 130, 246, 0.4)" />
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', opacity: 0.6, letterSpacing: '1px', marginBottom: '2px' }}>NO</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, marginBottom: '4px' }}>{room.roomNumber}</div>
                        <div style={{ fontSize: '9px', color: '#06b6d4', fontWeight: 800, textDecoration: 'none', cursor: 'pointer', letterSpacing: '1px' }}>CLICK FOR INFO</div>
                      </div>

                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.5px' }}>
                        {room.category} • {room.type?.toUpperCase()}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '16px', opacity: 0.4 }}>
                        {(room.amenities?.length > 0 ? room.amenities : ['WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Safe', 'Room Service']).slice(0, 5).map((name, i) => {
                          const Icon = amenityMap[name]?.icon || Snowflake;
                          return <Icon key={i} size={12} />;
                        })}
                      </div>

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

      {selectedRoom && (
        <RoomDetailModal 
          room={selectedRoom} 
          booking={activeBookings.find(b => 
            (String(b.room?._id || b.room) === String(selectedRoom._id)) ||
            (b.room?.roomNumber?.toString() === selectedRoom.roomNumber.toString())
          )}
          onClose={() => setSelectedRoom(null)} 
          onMarkAvailable={handleMarkAvailable}
          navigate={navigate}
          loading={isUpdating}
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

const RoomDetailModal = ({ room, booking, onClose, onMarkAvailable, navigate, loading }) => {
  const amenities = (room.amenities && room.amenities.length > 0) ? room.amenities : ['WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Safe', 'Room Service'];
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return '#10b981';
      case 'Occupied': return '#ef4444';
      case 'Cleaning': return '#3b82f6';
      case 'Maintenance': return '#64748b';
      default: return '#d4af37';
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000, backdropFilter: 'blur(10px)', padding: '20px' }} className="animate-fade-in">
      <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '600px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)', background: 'var(--surface)', minHeight: '400px' }}>
        {/* Header Section */}
        <div style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(212,175,55,0.1), transparent)', borderBottom: '1px solid var(--border)', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 0.8 }}>{room.roomNumber}</h2>
            <div style={{ marginBottom: '6px' }}>
              <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>{room.category} Edition</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>{room.type} Room</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: getStatusColor(room.status) }}>
               <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(room.status) }}></div>
               {room.status.toUpperCase()}
             </span>
             <span style={{ color: 'var(--border)' }}>|</span>
             <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Floor {room.floor}</span>
             <span style={{ color: 'var(--border)' }}>|</span>
             <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--primary)' }}>₹{room.price}/Night</span>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ padding: '32px' }}>
          {/* Facilities Row */}
          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '2px', marginBottom: '20px', textTransform: 'uppercase' }}>Room Facilities & Strategic Perks</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              {amenities.map(name => {
                const item = amenityMap[name] || { icon: ShieldCheck, label: name };
                const Icon = item.icon;
                return (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--primary)' }}><Icon size={18} /></div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>Bed Configuration</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BedDouble size={16} style={{ color: 'var(--primary)' }} />
                <p style={{ fontSize: '14px', fontWeight: 700 }}>{room.bedType || `${room.type} Bed Layout`}</p>
              </div>
            </div>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>Room View</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={16} style={{ color: 'var(--primary)' }} />
                <p style={{ fontSize: '14px', fontWeight: 700 }}>{room.view || 'City Skyline View'}</p>
              </div>
            </div>
          </div>

          {/* Guest Context if Occupied */}
          {room.status === 'Occupied' && booking && (
            <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.1)', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ width: '32px', height: '32px', background: 'var(--danger)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 }}>{booking.customer?.name?.charAt(0) || 'G'}</div>
                   <div>
                     <p style={{ fontSize: '13px', fontWeight: 800 }}>In-House Guest: {booking.customer?.name}</p>
                     <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Checking out on {new Date(booking.expectedCheckOut).toLocaleDateString()}</p>
                   </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)' }}>TOTAL DUE</p>
                  <p style={{ fontSize: '16px', fontWeight: 900, color: 'var(--danger)' }}>₹{booking.totalAmount}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>Close Details</button>
            
            {room.status === 'Available' && (
              <button 
                onClick={() => { navigate('/dashboard/enroll', { state: { roomNumber: room.roomNumber } }); onClose(); }} 
                style={{ flex: 2, padding: '14px', borderRadius: '12px', background: 'var(--primary)', border: 'none', color: 'black', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.3)', transition: '0.2s' }}
              >
                Book Now • ₹{room.price}
              </button>
            )}

            {room.status === 'Occupied' && (
              <button 
                onClick={() => { navigate('/dashboard', { state: { openCheckout: booking } }); onClose(); }} 
                style={{ flex: 2, padding: '14px', borderRadius: '12px', background: 'var(--danger)', border: 'none', color: 'white', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.3)', transition: '0.2s' }}
              >
                Proceed to Checkout
              </button>
            )}

            {(room.status === 'Cleaning' || room.status === 'Maintenance') && (
              <button 
                onClick={onMarkAvailable} 
                disabled={loading}
                style={{ flex: 2, padding: '14px', borderRadius: '12px', background: 'var(--success)', border: 'none', color: 'white', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: '0.2s' }}
              >
                {loading ? 'Processing...' : 'Mark as Ready'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
