import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Brush, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Housekeeping = () => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/rooms/${id}`, { status });
      fetchRooms();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Housekeeping Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor and update room cleaning and maintenance status.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
        ) : rooms.map(room => (
          <div key={room._id} className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Room {room.roomNumber}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Floor {room.floor} • {room.type}</p>
              </div>
              <div style={{ 
                padding: '6px 12px', 
                borderRadius: '12px', 
                fontSize: '11px', 
                fontWeight: 700,
                background: room.status === 'Available' ? 'rgba(34, 197, 94, 0.1)' : room.status === 'Cleaning' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                color: room.status === 'Available' ? 'var(--success)' : room.status === 'Cleaning' ? '#3b82f6' : '#9ca3af'
              }}>
                {room.status}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => updateStatus(room._id, 'Available')}
                style={{ flex: 1, padding: '10px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '8px', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}
              >
                <CheckCircle size={14} /> Ready
              </button>
              <button 
                onClick={() => updateStatus(room._id, 'Maintenance')}
                style={{ flex: 1, padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}
              >
                <AlertTriangle size={14} /> Repair
              </button>
            </div>
            
            <button 
              onClick={() => updateStatus(room._id, 'Cleaning')}
              style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}
            >
              <Clock size={14} /> Internal Cleaning Order
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Housekeeping;
