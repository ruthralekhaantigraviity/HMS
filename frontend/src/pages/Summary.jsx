import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Users, Calendar, Wallet, BedDouble, UserCheck, UserX } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="glass-card" style={{ padding: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>{title}</p>
        <h2 style={{ fontSize: '2rem', margin: '8px 0', fontWeight: '800' }}>{value}</h2>
      </div>
      <div style={{ padding: '12px', background: `${color}20`, color: color, borderRadius: '12px' }}>
        <Icon size={24} />
      </div>
    </div>
    <p style={{ color: 'var(--success)', fontSize: '13px', fontWeight: '600' }}>{subtext}</p>
  </div>
);

const Summary = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    bookings: { day: 0, month: 0, year: 0 },
    rooms: { total: 0, available: 0 },
    users: 0,
    attendance: { present: 0, leave: 0 },
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  const isSubAdmin = user?.role === 'subadmin';
  const isReception = user?.role === 'reception';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [bookingsRes, roomsRes, usersRes, attRes] = await Promise.all([
          axios.get('http://localhost:5000/api/bookings/summary', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/rooms', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/auth', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/attendance/today', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const availableRooms = roomsRes.data.filter(r => r.status === 'Available').length;

        setStats({
          bookings: bookingsRes.data,
          rooms: { total: roomsRes.data.length, available: availableRooms },
          users: usersRes.data.length,
          attendance: { 
            present: attRes.data.filter(a => a.status === 'Present').length, 
            leave: attRes.data.filter(a => a.status === 'Leave').length 
          },
          revenue: 84250 // Simulated for now
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  const chartData = [
    { name: 'Mon', rev: 4000, profit: 2400 },
    { name: 'Tue', rev: 3000, profit: 1398 },
    { name: 'Wed', rev: 5000, profit: 3800 },
    { name: 'Thu', rev: 2780, profit: 1908 },
    { name: 'Fri', rev: 1890, profit: 4800 },
    { name: 'Sat', rev: 2390, profit: 3800 },
    { name: 'Sun', rev: 3490, profit: 4300 },
  ];

  const payData = [
    { name: 'Cash', value: 4500, color: 'var(--primary)' },
    { name: 'Online', value: 3200, color: 'var(--accent)' },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '8px' }}>
          {isReception ? 'Front Desk Dashboard' : isSubAdmin ? 'Sub Admin Dashboard' : 'Super Admin Dashboard'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {isReception ? 'Manage guest lifecycle, room statuses, and daily operations.' : isSubAdmin ? 'Manage daily hotel operations and active bookings.' : 'Welcome back to the HMS Elite command center.'}
        </p>
      </div>

      {/* Primary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {isReception ? (
          <>
            <StatCard title="Available Rooms" value={stats.rooms.available} subtext="Ready for check-in" icon={BedDouble} color="var(--success)" />
            <StatCard title="Expected Check-ins" value={stats.bookings.day} subtext="For today" icon={Calendar} color="var(--primary)" />
            <StatCard title="Total Capacity" value={stats.rooms.total} subtext="Global inventory" icon={Users} color="var(--accent)" />
            <StatCard title="Staff Active" value={stats.users} subtext="On shift" icon={TrendingUp} color="#38bdf8" />
          </>
        ) : isSubAdmin ? (
          <>
            <StatCard title="Staff Present" value={`${stats.attendance.present} / ${stats.users - 1}`} subtext="On shift today" icon={UserCheck} color="var(--success)" />
            <StatCard title="Staff On Leave" value={stats.attendance.leave} subtext="Approved today" icon={UserX} color="var(--danger)" />
            <StatCard title="Rooms Status" value={`${stats.rooms.available} / ${stats.rooms.total}`} subtext="Available now" icon={BedDouble} color="var(--primary)" />
            <StatCard title="Today's Bookings" value={stats.bookings.day} subtext="New check-ins" icon={Calendar} color="var(--accent)" />
          </>
        ) : (
          <>
            <StatCard title="Total Users & Staff" value={stats.users} subtext="System-wide" icon={Users} color="var(--primary)" />
            <StatCard title="Bookings Today" value={stats.bookings.day} subtext={`Month: ${stats.bookings.month}`} icon={Calendar} color="var(--accent)" />
            <StatCard title="Total Inventory" value={stats.rooms.total} subtext={`${stats.rooms.available} Available`} icon={BedDouble} color="var(--success)" />
            <StatCard title="Annual Bookings" value={stats.bookings.year} subtext="Year to date" icon={TrendingUp} color="#38bdf8" />
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Revenue & Profit Trends */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '24px' }}>Revenue vs Profit Trends</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="rev" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.1} strokeWidth={3} />
                <Area type="monotone" dataKey="profit" stroke="var(--success)" fill="var(--success)" fillOpacity={0.1} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px' }}>Payment Summary (Cash vs Online)</h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={payData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {payData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ paddingLeft: '24px' }}>
              {payData.map(item => (
                <div key={item.name} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.color }}></div>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.name}</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>${item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
