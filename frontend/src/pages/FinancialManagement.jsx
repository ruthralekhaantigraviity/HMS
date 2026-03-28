import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, ClipboardList, PieChart, Download, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const FinancialManagement = () => {
  const [activeTab, setActiveTab] = useState('profits');
  
  const profitData = [
    { day: 'Mon', profit: 4500 }, { day: 'Tue', profit: 5200 }, { day: 'Wed', profit: 4800 },
    { day: 'Thu', profit: 6100 }, { day: 'Fri', profit: 5900 }, { day: 'Sat', profit: 7500 },
    { day: 'Sun', profit: 6800 },
  ];

  const expenses = [
    { id: 1, name: 'Electricity Bill', date: '21 Mar 2026', amount: 1200, category: 'Utilities' },
    { id: 2, name: 'Cleaning Supplies', date: '20 Mar 2026', amount: 350, category: 'Maintenance' },
    { id: 3, name: 'Kitchen Stock', date: '19 Mar 2026', amount: 840, category: 'Food & Bev' },
  ];

  const salaries = [
    { id: 1, name: 'Alex Johnson', role: 'Sub Admin', salary: 45000, status: 'Paid' },
    { id: 2, name: 'Sarah Miller', role: 'Reception', salary: 28000, status: 'Pending' },
    { id: 3, name: 'John Doe', role: 'Housekeeping', salary: 18000, status: 'Paid' },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Financial Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor profits, expenses, salaries, and GST reports.</p>
        </div>
        <button className="btn btn-primary"><Download size={18} /> Export Reports</button>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '1px solid var(--border)' }}>
        {['Profits', 'Expenses', 'Salary Overview', 'GST Reports'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            style={{ padding: '12px 24px', background: 'none', color: activeTab === tab.toLowerCase() ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === tab.toLowerCase() ? '2px solid var(--primary)' : 'none', fontWeight: 600, fontSize: '14px' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'profits' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--success)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Today's Total Profit</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '2rem' }}>$2,450</h2>
              <TrendingUp size={20} color="var(--success)" />
            </div>
            <p style={{ color: 'var(--success)', fontSize: '12px', marginTop: '4px' }}>+12% from yesterday</p>
          </div>
          <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Monthly Projected Profit</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '2rem' }}>$68,200</h2>
              <ClipboardList size={20} color="var(--primary)" />
            </div>
            <p style={{ color: 'var(--primary)', fontSize: '12px', marginTop: '4px' }}>On track for target</p>
          </div>
          <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--accent)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Total GST Collected (12%)</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '2rem' }}>$8,140</h2>
              <TrendingDown size={20} color="var(--accent)" />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Quarterly liability</p>
          </div>
        </div>
      )}

      {activeTab === 'profits' && (
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '24px' }}>Daily Profit Trends</h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Bar dataKey="profit" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
            <h3>Recent Expenses</h3>
            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}><Plus size={16} /> Log Expense</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Item</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Category</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Date</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px' }}>{exp.name}</td>
                  <td style={{ padding: '16px 24px' }}><span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>{exp.category}</span></td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{exp.date}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 700 }}>${exp.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'salary overview' && (
        <div className="animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Total Payroll (Monthly)</p>
              <h2 style={{ fontSize: '1.8rem', marginTop: '8px' }}>$91,000</h2>
            </div>
            <div className="glass-card" style={{ padding: '24px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Disbursed (Paid)</p>
              <h2 style={{ fontSize: '1.8rem', marginTop: '8px', color: 'var(--success)' }}>$63,000</h2>
            </div>
            <div className="glass-card" style={{ padding: '24px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Pending Payments</p>
              <h2 style={{ fontSize: '1.8rem', marginTop: '8px', color: 'var(--danger)' }}>$28,000</h2>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 0 }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <h3>Staff Payroll Ledger</h3>
              <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>Release All (Pending)</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Employee</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Role</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Base Salary</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Status</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {salaries.map(st => (
                  <tr key={st.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px' }}>{st.name}</td>
                    <td style={{ padding: '16px 24px' }}>{st.role}</td>
                    <td style={{ padding: '16px 24px' }}>${st.salary}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        fontSize: '11px', padding: '4px 8px', borderRadius: '4px', 
                        background: st.status === 'Paid' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                        color: st.status === 'Paid' ? 'var(--success)' : 'var(--danger)' 
                      }}>
                        {st.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button style={{ background: 'none', color: st.status === 'Paid' ? 'var(--text-muted)' : 'var(--primary)', fontWeight: 600 }}>
                        {st.status === 'Paid' ? 'Slip' : 'Pay Now'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'gst reports' && (
        <div className="animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div className="glass-card" style={{ padding: '32px' }}>
              <h3 style={{ marginBottom: '20px' }}>Tax Liability Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Net Bookings Value</span>
                  <span style={{ fontWeight: 700 }}>$142,500</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST Collected (12%)</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>$17,100</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                  <span style={{ fontWeight: 600 }}>Total Payable</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem' }}>$17,100</span>
                </div>
              </div>
            </div>
            
            <div className="glass-card" style={{ padding: '32px' }}>
              <h3 style={{ marginBottom: '20px' }}>Quarterly GST Trend</h3>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { m: 'Jan', gst: 4200 }, { m: 'Feb', gst: 5100 }, { m: 'Mar', gst: 7800 }
                  ]}>
                    <XAxis dataKey="m" stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
                    <Bar dataKey="gst" fill="var(--success)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 0 }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}><h3>Tax Ledger (Active Quarter)</h3></div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Invoice ID</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>Net Amount</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>GST (12%)</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {[1201, 1202, 1203].map(id => (
                  <tr key={id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px' }}>#HMS-{id}</td>
                    <td style={{ padding: '16px 24px' }}>$1,200.00</td>
                    <td style={{ padding: '16px 24px' }}>$144.00</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>$1,344.00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManagement;
