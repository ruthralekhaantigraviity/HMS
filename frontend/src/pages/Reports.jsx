import React, { useState } from 'react';
import { BarChart as BarChartIcon, FileText, Download, Filter, TrendingUp, Calendar, Eye, User, Phone, Mail, MapPin, IdCard, X, BedDouble, History } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Reports = () => {
  const [data] = useState([
    { month: 'Jan', revenue: 4500, bookings: 120 },
    { month: 'Feb', revenue: 5200, bookings: 145 },
    { month: 'Mar', revenue: 4800, bookings: 132 },
  ]);

  const [logs] = useState([
    { 
      _id: '1',
      date: 'March 27, 2026', 
      customer: 'Rahul Sharma', 
      phone: '+91 98765 43210',
      email: 'rahul.s@outlook.com',
      location: 'New Delhi, India',
      idType: 'Aadhar Card',
      idNumber: 'XXXX-XXXX-1234',
      room: '101 (AC)', 
      type: 'AC Stay',
      amount: '₹1,500' 
    },
    { 
      _id: '2',
      date: 'March 26, 2026', 
      customer: 'Priya Singh', 
      phone: '+91 88776 65544',
      email: 'priya.singh@gmail.com',
      location: 'Mumbai, Maharashtra',
      idType: 'Passport',
      idNumber: 'Z-1234567',
      room: '202 (Non-AC)', 
      type: 'Non-AC Stay',
      amount: '₹800' 
    }
  ]);

  const [selectedRecord, setSelectedRecord] = useState(null);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Basic Reports</h1>
          <p style={{ color: 'var(--text-muted)' }}>Daily operational reports and monthly revenue summaries.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}><Filter size={18} /> Filter</button>
          <button className="btn btn-primary"><Download size={18} /> Export PDF</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {/* Booking Report Summary */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={20} color="var(--primary)" /> Booking Trends
          </h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Bar dataKey="bookings" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Summary (Limited) */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={20} color="var(--success)" /> Revenue Summary (Limited)
          </h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Bar dataKey="revenue" fill="var(--success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Historical Booking Logs</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Date</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Customer</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Room</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Amount</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 24px' }}>{log.date}</td>
                <td style={{ padding: '16px 24px' }}>{log.customer}</td>
                <td style={{ padding: '16px 24px' }}>{log.room}</td>
                <td style={{ padding: '16px 24px' }}>{log.amount}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button 
                    onClick={() => setSelectedRecord(log)}
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      border: '1px solid var(--primary)', 
                      color: 'var(--primary)', 
                      background: 'transparent', 
                      borderRadius: '12px', 
                      cursor: 'pointer'
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRecord && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'var(--glass-overlay)', 
          backdropFilter: 'blur(20px)', 
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999, 
          padding: '20px' 
        }} className="animate-fade-in">
          <div 
            className="animate-scale-in" 
            style={{ 
              width: '100%', 
              maxWidth: '550px', 
              padding: '0', 
              overflow: 'hidden', 
              background: 'var(--surface)', 
              borderRadius: '32px', 
              border: '1px solid rgba(212, 175, 55, 0.4)', 
              boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <div style={{ padding: '24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={20} color="var(--primary)" /> Record: #{selectedRecord._id.padStart(4, '0')}
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Historical Booking Log • {selectedRecord.date}</p>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                style={{ background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '32px' }}>
              {/* Guest Identity Overview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                  <User size={40} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '4px' }}>{selectedRecord.customer}</h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, background: 'var(--success)', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>VERIFIED GUEST</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>ID: {selectedRecord.idNumber}</span>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' }}>
                <div style={{ padding: '16px', background: 'var(--bg-sec)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                   <div style={{ color: 'var(--primary)', marginBottom: '8px' }}><Phone size={14} /></div>
                   <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Phone Number</p>
                   <p style={{ fontWeight: 700, fontSize: '14px' }}>{selectedRecord.phone}</p>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-sec)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                   <div style={{ color: 'var(--primary)', marginBottom: '8px' }}><Mail size={14} /></div>
                   <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Email Address</p>
                   <p style={{ fontWeight: 700, fontSize: '14px' }}>{selectedRecord.email}</p>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-sec)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                   <div style={{ color: 'var(--primary)', marginBottom: '8px' }}><IdCard size={14} /></div>
                   <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>ID Document</p>
                   <p style={{ fontWeight: 700, fontSize: '14px' }}>{selectedRecord.idType}</p>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-sec)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                   <div style={{ color: 'var(--primary)', marginBottom: '8px' }}><MapPin size={14} /></div>
                   <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Location</p>
                   <p style={{ fontWeight: 700, fontSize: '14px' }}>{selectedRecord.location}</p>
                </div>
              </div>

              {/* Booking Stay Detail */}
              <div style={{ padding: '24px', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '20px', border: '1px solid rgba(212, 175, 55, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <BedDouble size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 800 }}>Room {selectedRecord.room}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedRecord.type} • Final Settle</p>
                  </div>
                </div>
                <div>
                   <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', fontWeight: 800 }}>TOTAL PAID</p>
                   <p style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>{selectedRecord.amount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
