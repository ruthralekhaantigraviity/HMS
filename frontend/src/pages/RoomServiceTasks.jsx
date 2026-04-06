import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Utensils, Clock, CheckCircle, AlertCircle, Loader2, MapPin, User, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RoomServiceTasks = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [token]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/bookings/services/pending');
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliver = async (bookingId, serviceId) => {
    try {
      setUpdating(serviceId);
      await axios.patch(`/api/bookings/${bookingId}/services/${serviceId}`, 
        { status: 'Delivered' }
      );
      setTasks(prev => prev.filter(t => t.serviceId !== serviceId));
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={48} color="var(--primary)" /></div>;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '8px' }}>Active Service Orders</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage real-time guest requests and ensure elite service delivery.</p>
      </div>

      {tasks.length === 0 ? (
        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
          <div style={{ display: 'inline-flex', padding: '24px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '50%', marginBottom: '24px' }}>
            <CheckCircle size={48} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>All caught up!</h2>
          <p style={{ color: 'var(--text-muted)' }}>There are no pending service orders right now.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {tasks.map((task) => (
            <div key={task.serviceId} className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--primary)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ width: '40px', height: '40px', background: 'var(--surface)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                      <MapPin size={20} color="var(--primary)" />
                   </div>
                   <h3 style={{ fontSize: '1.4rem', fontWeight: 900 }}>Room {task.roomNumber}</h3>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', background: 'var(--surface)', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border)' }}>
                   <Clock size={12} />
                   <span>ACTIVE REQUEST</span>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', opacity: 0.8 }}>
                    <Package size={16} color="var(--primary)" />
                    <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{task.serviceName}</span>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                    <User size={16} />
                    <span style={{ fontSize: '14px' }}>Ordered by: {task.guestName}</span>
                 </div>
              </div>

              <button 
                onClick={() => handleDeliver(task.bookingId, task.serviceId)}
                disabled={updating === task.serviceId}
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  background: 'var(--primary)', 
                  color: 'var(--bg-dark)', 
                  fontWeight: 900, 
                  border: 'none', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
                className="hover-glow"
              >
                {updating === task.serviceId ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <Utensils size={20} />
                    <span>MARK AS DELIVERED</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomServiceTasks;
