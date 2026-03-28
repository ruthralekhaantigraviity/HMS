import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BedDouble, Plus, Edit2, Trash2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Rooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = rooms.filter(r => 
    (filterType === 'All' || r.type === filterType) &&
    (filterCategory === 'All' || r.category === filterCategory)
  );

  const roomsByFloor = filtered.reduce((acc, room) => {
    (acc[room.floor] = acc[room.floor] || []).push(room);
    return acc;
  }, {});

  const floors = Object.keys(roomsByFloor).sort();

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Rooms Status</h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time inventory by floor and category.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="glass-card" style={{ padding: '8px 12px', background: 'var(--surface)', fontSize: '14px' }}>
            <option value="All">All Types</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Suite">Suite</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="glass-card" style={{ padding: '8px 12px', background: 'var(--surface)', fontSize: '14px' }}>
            <option value="All">All Categories</option>
            <option value="AC">AC</option>
            <option value="NON-AC">Non-AC</option>
          </select>
        </div>
      </div>

      {loading ? <p>Syncing rooms...</p> : (
        <>
          {floors.map(floor => (
            <div key={floor} style={{ marginBottom: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Floor {floor}</h2>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, var(--border), transparent)' }}></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                {roomsByFloor[floor].map(room => (
                  <div 
                    key={room._id} 
                    className="glass-card" 
                    style={{ 
                      padding: '20px', 
                      textAlign: 'center', 
                      border: room.status === 'Available' ? '1px solid var(--success)50' : room.status === 'Occupied' ? '1px solid var(--danger)50' : '1px solid var(--primary)50',
                      cursor: room.status === 'Available' ? 'pointer' : 'default',
                      transition: '0.2s'
                    }}
                    onClick={() => room.status === 'Available' && navigate('/dashboard/enroll', { state: { roomNumber: room.roomNumber } })}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700 }}>{room.category} • {room.type}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>{room.roomNumber}</div>
                    <div style={{ 
                      display: 'inline-block', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '11px', 
                      fontWeight: 700,
                      background: room.status === 'Available' ? 'var(--success)' : room.status === 'Occupied' ? 'var(--danger)' : 'var(--primary)',
                      color: 'var(--bg-dark)'
                    }}>
                      {room.status.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {floors.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No rooms found matching filters.</p>}
        </>
      )}
    </div>
  );
};

export default Rooms;
