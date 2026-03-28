import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Zap, Coffee, Utensils, Wifi, Loader2, IndianRupee, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const iconMap = { Utensils, Zap, Coffee, Wifi, IndianRupee };

const Services = () => {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', category: 'Food', icon: 'Utensils', status: 'Active' });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await axios.put(`http://localhost:5000/api/services/${formData._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/services', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      setFormData({ name: '', price: '', category: 'Food', icon: 'Utensils', status: 'Active' });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`http://localhost:5000/api/services/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchServices();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Hotel Services</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure and manage additional guest services and their pricing.</p>
        </div>
        <button onClick={() => { setFormData({ name: '', price: '', category: 'Food', icon: 'Utensils', status: 'Active' }); setShowModal(true); }} className="btn btn-primary">
          <Plus size={18} /> Add New Service
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Loader2 className="animate-spin" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {services.map(service => {
            const IconComponent = iconMap[service.icon] || Utensils;
            return (
              <div key={service._id} className="glass-card" style={{ padding: '24px', position: 'relative' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <IconComponent size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{service.name}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{service.category}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--success)' }}>₹{service.price}</p>
                    <span style={{ fontSize: '10px', color: service.status === 'Active' ? 'var(--success)' : 'var(--danger)' }}>● {service.status}</span>
                  </div>
                </div>
                
                <div style={{ marginTop: '20px', display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <button onClick={() => { setFormData(service); setShowModal(true); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', fontSize: '13px', cursor: 'pointer' }}>
                    <Edit2 size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(service._id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--danger)', fontSize: '13px', cursor: 'pointer' }}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2>{formData._id ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label>Service Name</label>
                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Yoga Session" required />
              </div>
              <div className="input-group">
                <label>Price (₹)</label>
                <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="500" required />
              </div>
              <div className="input-group">
                <label>Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white' }}>
                  <option value="Food">Food & Dining</option>
                  <option value="Comfort">Comfort & Stay</option>
                  <option value="Tech">Technology</option>
                  <option value="Beverage">Beverages</option>
                  <option value="Other">Other Services</option>
                </select>
              </div>
              <div className="input-group">
                <label>Icon Identifier</label>
                <select value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} style={{ padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white' }}>
                  <option value="Utensils">Food Icon</option>
                  <option value="Zap">Zap Icon</option>
                  <option value="Coffee">Coffee Icon</option>
                  <option value="Wifi">Wifi Icon</option>
                  <option value="IndianRupee">Rupee Icon</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>Save Service Configuration</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
