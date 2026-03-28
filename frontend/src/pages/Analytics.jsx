import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';

const Analytics = () => {
  const occupancyData = [
    { name: 'Mon', rate: 65 }, { name: 'Tue', rate: 70 }, { name: 'Wed', rate: 85 },
    { name: 'Thu', rate: 78 }, { name: 'Fri', rate: 92 }, { name: 'Sat', rate: 98 },
    { name: 'Sun', rate: 88 },
  ];

  const revenueTrends = [
    { month: 'Jan', revenue: 45000 }, { month: 'Feb', revenue: 52000 }, { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 }, { month: 'May', revenue: 59000 }, { month: 'Jun', revenue: 75000 },
  ];

  const guestStats = [
    { name: 'Business', value: 45, color: 'var(--primary)' },
    { name: 'Leisure', value: 35, color: 'var(--accent)' },
    { name: 'Family', value: 20, color: 'var(--success)' },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1>Data Analytics</h1>
        <p style={{ color: 'var(--text-muted)' }}>Deep dive into occupancy, revenue trends, and guest demographics.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '24px' }}>
        {/* Occupancy Rate */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Target size={20} color="var(--primary)" /> Occupancy Rate</h3>
            <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 700 }}>Avg: 82%</span>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} suffix="%" />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="rate" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Trends */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><TrendingUp size={20} color="var(--success)" /> Revenue Trends</h3>
            <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 700 }}>+15% Growth</span>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Bar dataKey="revenue" fill="var(--success)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Guest Insights */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={20} color="var(--accent)" /> Customer Insights</h3>
          <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <div style={{ height: '250px', width: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={guestStats} innerRadius={60} outerRadius={100} paddingAngle={8} dataKey="value">
                    {guestStats.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1 }}>
              {guestStats.map(stat => (
                <div key={stat.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: stat.color }}></div>
                    <span style={{ fontSize: '15px' }}>{stat.name} Guests</span>
                  </div>
                  <span style={{ fontWeight: 800 }}>{stat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Growth Analytics Summary */}
        <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(251, 191, 36, 0.1)', color: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <BarChart3 size={32} />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Ready for Growth?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '32px' }}>Our deep-learning algorithms suggest that focusing on the <strong>Business Segment</strong> between <strong>Tue-Thu</strong> could increase weekly revenue by up to 18%.</p>
          <button className="btn btn-primary" style={{ width: 'max-content' }}>Download Insights PDF</button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
