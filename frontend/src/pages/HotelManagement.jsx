import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BedDouble, Plus, Edit3, Settings, DollarSign, Wrench, Loader2, X, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HotelManagement = () => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };
  
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: '',
    type: 'Single',
    category: 'AC',
    price: '',
    description: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axios.post('http://localhost:5000/api/rooms', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setFormData({ roomNumber: '', floor: '', type: 'Single', category: 'AC', price: '', description: '' });
      fetchRooms();
    } catch (err) {
      showToast(err.response?.data?.msg || 'Error adding room', 'error');
    } finally {
      setCreating(false);
    }
  };

  const deleteRoom = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRooms();
    } catch (err) {
      console.error(err);
    }
  };

  const updateRoomPrice = async (roomId, newPrice) => {
    try {
      await axios.put(`http://localhost:5000/api/rooms/${roomId}`, { price: newPrice }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error updating price:', err);
    }
  };

  const handleBulkUpdate = async (category, type, price) => {
    if (!price || price <= 0) return;
    setUpdatingPrices(true);
    try {
      const targets = rooms.filter(r => r.category === category && r.type === type);
      await Promise.all(targets.map(r => updateRoomPrice(r._id, price)));
      fetchRooms();
      showToast(`Pricing Configuration Completed`);
      setShowPricingModal(false);
    } catch (err) {
      showToast('Error during pricing update', 'error');
    } finally {
      setUpdatingPrices(false);
    }
  };

  const acCount = rooms.filter(r => r.category === 'AC').length;
  const nonAcCount = rooms.filter(r => r.category === 'NON-AC').length;
  const maintenanceCount = rooms.filter(r => r.status === 'Maintenance').length;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Hotel Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure rooms, categories, and pricing setup.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => setShowPricingModal(true)} style={{ borderRadius: '0' }}>
            <Settings size={18} /> Pricing Setup
          </button>
          <button 
            className="btn" 
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', borderRadius: '0' }}
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} /> Add Room
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BedDouble size={20} color="var(--primary)" /> Room Categories
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <span>AC Rooms</span>
            <span style={{ fontWeight: 700 }}>{acCount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <span>Non-AC Rooms</span>
            <span style={{ fontWeight: 700 }}>{nonAcCount}</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign size={20} color="var(--success)" /> Inventory Status
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <span>Total Operational</span>
            <span style={{ fontWeight: 700, color: 'var(--success)' }}>{rooms.length - maintenanceCount} Rooms</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <span>Maintenance</span>
            <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{maintenanceCount} Rooms</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wrench size={20} color="var(--danger)" /> System Controls
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <span>All Floors</span>
            <span style={{ fontWeight: 700 }}>{new Set(rooms.map(r => r.floor)).size}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <span>Active Sensors</span>
            <span style={{ fontWeight: 700, color: 'var(--success)' }}>Online</span>
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: '40px', marginBottom: '20px' }}>Room Inventory & Controls</h3>
      <div className="glass-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>Room #</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>Floor</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>Type</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>Category</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>Price</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No rooms found. Add your first room!</td></tr>
              ) : rooms.map(room => (
                <tr key={room._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '20px 24px', fontWeight: 700 }}>{room.roomNumber}</td>
                  <td style={{ padding: '20px 24px' }}>Floor {room.floor}</td>
                  <td style={{ padding: '20px 24px' }}>{room.type}</td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', background: room.category === 'AC' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(148, 163, 184, 0.1)', color: room.category === 'AC' ? '#38bdf8' : 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>
                      {room.category}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', fontWeight: 600 }}>${room.price}</td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', border: `1px solid ${room.status === 'Available' ? 'var(--success)' : 'var(--danger)'}`, color: room.status === 'Available' ? 'var(--success)' : 'var(--danger)', fontSize: '12px' }}>
                      {room.status}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button style={{ background: 'none', color: 'var(--text-muted)' }}><Edit3 size={16} /></button>
                    <button onClick={() => deleteRoom(room._id)} style={{ background: 'none', color: 'var(--danger)', marginLeft: '8px' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showPricingModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(10px)' }}>
          <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '700px', padding: '32px', borderRadius: '0', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <DollarSign size={24} color="var(--primary)" /> Pricing Setup
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Configure base rates for all room configurations.</p>
              </div>
              <button onClick={() => setShowPricingModal(false)} style={{ background: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* AC Section */}
              <div>
                <h4 style={{ color: '#38bdf8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   AC CATEGORY
                </h4>
                {['Single', 'Double', 'Suite', 'Deluxe'].map(type => (
                  <div key={type} className="input-group" style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px' }}>{type.toUpperCase()}</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="number" 
                        placeholder="Rate"
                        style={{ height: '40px', borderRadius: 0 }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleBulkUpdate('AC', type, e.target.value);
                        }}
                      />
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0 12px', borderRadius: 0, height: '40px' }}
                        onClick={(e) => handleBulkUpdate('AC', type, e.target.previousSibling.value)}
                      >Apply</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* NON-AC Section */}
              <div>
                <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   NON-AC CATEGORY
                </h4>
                {['Single', 'Double', 'Suite', 'Deluxe'].map(type => (
                  <div key={type} className="input-group" style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px' }}>{type.toUpperCase()}</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="number" 
                        placeholder="Rate"
                        style={{ height: '40px', borderRadius: 0 }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleBulkUpdate('NON-AC', type, e.target.value);
                        }}
                      />
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0 12px', borderRadius: 0, height: '40px' }}
                        onClick={(e) => handleBulkUpdate('NON-AC', type, e.target.previousSibling.value)}
                      >Apply</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', marginTop: '24px', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
               <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 0 }} onClick={() => setShowPricingModal(false)}>Close Setup</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmit} className="glass-card" style={{ width: '500px', padding: '32px', borderRadius: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2>Add New Room</h2>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'none', color: 'var(--text-muted)' }}><X /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label>Room Number</label>
                <input name="roomNumber" value={formData.roomNumber} onChange={handleChange} placeholder="e.g. 101" required style={{ borderRadius: 0 }} />
              </div>
              <div className="input-group">
                <label>Floor</label>
                <input name="floor" type="number" value={formData.floor} onChange={handleChange} placeholder="e.g. 1" required style={{ borderRadius: 0 }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label>Room Type</label>
                <select name="type" value={formData.type} onChange={handleChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '0', color: 'white' }}>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Suite">Suite</option>
                  <option value="Deluxe">Deluxe</option>
                </select>
              </div>
              <div className="input-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '0', color: 'white' }}>
                  <option value="AC">AC</option>
                  <option value="NON-AC">NON-AC</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Price Per Night (₹)</label>
              <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="e.g. 1500" required style={{ borderRadius: 0 }} />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="button" onClick={() => setShowAddModal(false)} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 0 }}>Cancel</button>
              <button type="submit" disabled={creating} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', borderRadius: 0 }}>
                {creating ? <Loader2 className="animate-spin" size={18} /> : 'Create Room'}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Toast Notification */}
      {toast.show && (
        <div 
          style={{ 
            position: 'fixed', 
            top: '32px', 
            left: '50%',
            transform: 'translateX(-50%)',
            background: toast.type === 'error' ? 'var(--danger)' : 'var(--primary)', 
            color: 'var(--bg-dark)', 
            padding: '16px 32px', 
            borderRadius: '0', 
            fontWeight: 800, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            zIndex: 99999,
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.2)',
            animation: 'toastIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards'
          }}
        >
          <style>{`
            @keyframes toastIn {
              from { opacity: 0; transform: translate(-50%, -40px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
          `}</style>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <Settings size={20} />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default HotelManagement;
