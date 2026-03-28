import React, { useState } from 'react';
import { BarChart as BarChartIcon, FileText, Download, Filter, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Reports = () => {
  const [data] = useState([
    { month: 'Jan', revenue: 4500, bookings: 120 },
    { month: 'Feb', revenue: 5200, bookings: 145 },
    { month: 'Mar', revenue: 4800, bookings: 132 },
  ]);

  return (
    <div className="animate-fade-in">
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
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '16px 24px' }}>March 27, 2026</td>
              <td style={{ padding: '16px 24px' }}>Rahul Sharma</td>
              <td style={{ padding: '16px 24px' }}>101 (AC)</td>
              <td style={{ padding: '16px 24px' }}>$1,500</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '16px 24px' }}>March 26, 2026</td>
              <td style={{ padding: '16px 24px' }}>Priya Singh</td>
              <td style={{ padding: '16px 24px' }}>202 (Non-AC)</td>
              <td style={{ padding: '16px 24px' }}>$800</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
