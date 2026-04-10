import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, AlertCircle, CheckCircle, Package, RefreshCw, X, Settings, DollarSign, Loader2 } from 'lucide-react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Inventory = () => {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({ name: '', category: 'Linen', stock: '', minStock: '10', unit: 'pcs' });

  React.useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/inventory');
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...formData,
        stock: Number(formData.stock),
        minStock: Number(formData.minStock)
      };
      await axios.post('/api/inventory', payload);
      setShowAddModal(false);
      setFormData({ name: '', category: 'Linen', stock: '', minStock: '10', unit: 'pcs' });
      fetchItems();
      showToast('Inventory Item Added Successfully');
    } catch (err) {
      showToast(err.response?.data?.msg || 'Error adding inventory item', 'error');
    } finally {
      setCreating(false);
    }
  };

  const adjustStock = async (itemId, amount) => {
    try {
      const item = items.find(i => i._id === itemId);
      const newStock = Math.max(0, item.stock + amount);
      const res = await axios.put(`/api/inventory/${itemId}`, { stock: newStock });
      setItems(prev => prev.map(i => i._id === itemId ? res.data : i));
      showToast('Stock Adjusted Successfully');
    } catch (err) {
      showToast(err.response?.data?.msg || 'Error adjusting stock', 'error');
    }
  };

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(search.toLowerCase()) || 
    item.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Inventory Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track room supplies, linens, and minibar consumables.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ borderRadius: 0 }}>
          <Plus size={18} /> Update Stock
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Total SKUs</p>
          <h2 style={{ fontSize: '1.8rem' }}>{items.length}</h2>
        </div>
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--danger)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Alerts (Low/Out)</p>
          <h2 style={{ fontSize: '1.8rem' }}>{items.filter(i => i.stock < i.minStock).length}</h2>
        </div>
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--success)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Stock Value</p>
          <h2 style={{ fontSize: '1.8rem' }}>₹42,350</h2>
        </div>
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--warning)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Incoming Orders</p>
          <h2 style={{ fontSize: '1.8rem' }}>3</h2>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items, categories..." 
            style={{ 
              paddingLeft: '48px', 
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              color: 'var(--text-main)',
              height: '48px',
              fontSize: '14px',
              outline: 'none',
              transition: 'var(--transition)'
            }} 
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <button className="btn" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)' }}>
          <RefreshCw size={18} /> Sync Registry
        </button>
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Item Name</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Category</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Current Stock</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Min. Stock</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Status</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item._id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={16} color="var(--primary)" />
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '0', background: 'rgba(255,255,255,0.05)', fontSize: '11px', border: '1px solid var(--border)' }}>{item.category}</span>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ fontWeight: 700, color: item.status === 'In Stock' ? 'white' : 'var(--danger)' }}>
                    {item.stock} {item.unit}
                  </span>
                </td>
                <td style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>{item.minStock} {item.unit}</td>
                <td style={{ padding: '20px 24px' }}>
                   <div style={{ 
                     display: 'flex', alignItems: 'center', gap: '6px', 
                     fontSize: '11px', fontWeight: 800, 
                     color: item.status === 'Restock Required' ? 'var(--danger)' : item.status === 'Low Stock' ? 'var(--warning)' : 'var(--success)',
                     background: item.status === 'Restock Required' ? 'rgba(239, 68, 68, 0.1)' : item.status === 'Low Stock' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                     padding: '4px 10px', borderRadius: '0', border: '1px solid currentColor', width: 'fit-content'
                   }}>
                     {item.status === 'In Stock' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                     {item.status.toUpperCase()}
                   </div>
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                   <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                     <button 
                       onClick={() => adjustStock(item._id, 10)}
                       className="btn" 
                       style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 0, fontSize: '11px', border: '1px solid var(--border)' }}
                     >+10</button>
                     <button 
                       onClick={() => adjustStock(item._id, -10)}
                       className="btn" 
                       style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 0, fontSize: '11px', border: '1px solid var(--border)' }}
                     >-10</button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add Item Modal */}
      {showAddModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(255, 255, 255, 0.3)', 
          backdropFilter: 'blur(15px)', 
          WebkitBackdropFilter: 'blur(15px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999, 
          padding: '20px' 
        }} className="animate-fade-in">
          <form 
            onSubmit={handleAddItem} 
            className="animate-scale-in" 
            style={{ 
              width: '100%', 
              maxWidth: '500px', 
              padding: '40px', 
              background: '#ffffff', 
              borderRadius: '32px', 
              border: '1px solid rgba(212, 175, 55, 0.4)', 
              boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Update Stock Registry</h2>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'none', color: 'var(--text-muted)' }}><X /></button>
            </div>
            
            <div className="input-group">
              <label>ITEM NAME</label>
              <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Luxury Hand Soap" required style={{ borderRadius: 0 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label>CATEGORY</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0', color: 'var(--text-main)' }}>
                  <option value="Linen">Linen</option>
                  <option value="Toiletries">Toiletries</option>
                  <option value="Minibar">Minibar</option>
                  <option value="Comfort">Comfort</option>
                  <option value="Cleaning">Cleaning</option>
                </select>
              </div>
              <div className="input-group">
                <label>UNIT</label>
                <input value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} placeholder="pcs / bottles / units" required style={{ borderRadius: 0 }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label>CURRENT STOCK</label>
                <input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} placeholder="0" required style={{ borderRadius: 0 }} />
              </div>
              <div className="input-group">
                <label>MIN STOCK LEVEL</label>
                <input type="number" value={formData.minStock} onChange={(e) => setFormData({...formData, minStock: e.target.value})} placeholder="10" required style={{ borderRadius: 0 }} />
              </div>
            </div>

            <button type="submit" disabled={creating} className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '12px', borderRadius: 0 }}>
              {creating ? <Loader2 className="animate-spin" size={18} /> : 'Synchronize Registry'}
            </button>
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

export default Inventory;
