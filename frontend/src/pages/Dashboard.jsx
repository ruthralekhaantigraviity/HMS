import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users, BedDouble, Wallet, Settings, 
  LogOut, LayoutDashboard, Calendar, ClipboardList, 
  UserPlus, UserCheck, Bell, Search, Menu, X,
  Shield, BarChart, CalendarCheck, FileText, IndianRupee,
  Brush, Coffee, Clock
} from 'lucide-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Summary from './Summary';
import Rooms from './Rooms';
import Bookings from './Bookings';
import Enrollment from './Enrollment';
import UserManagement from './UserManagement';
import HotelManagement from './HotelManagement';
import FinancialManagement from './FinancialManagement';
import SystemControl from './SystemControl';
import Analytics from './Analytics';
import Attendance from './Attendance';
import Reports from './Reports';
import CustomerDetails from './CustomerDetails';
import Housekeeping from './Housekeeping';
import Services from './Services';
import Staff from './Staff';
import Inventory from './Inventory';

const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => (
  <Link 
    to={path} 
    onClick={onClick}
    className={`nav-link ${active ? 'active' : ''}`}
  >
    {Icon && <Icon size={20} />}
    <span>{label}</span>
  </Link>
);

const Dashboard = () => {
  const { user, login, logout, token } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Global Monitoring for New Arrivals & Coming Checkouts
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/bookings/active', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const now = new Date();
        const alerts = res.data.map(b => {
          const expiryDiff = (new Date(b.expectedCheckOut) - now) / (1000 * 60);
          const arrivalDiff = (now - new Date(b.createdAt)) / (1000 * 60);

          if (expiryDiff > 0 && expiryDiff <= 30) {
            return { id: b._id, type: 'expiry', room: b.room?.roomNumber, time: Math.round(expiryDiff) };
          }
          // Only show arrivals to admins/sub-admins
          if (arrivalDiff <= 15 && user?.role !== 'reception') {
            return { id: b._id, type: 'arrival', room: b.room?.roomNumber, guest: b.customer?.name };
          }
          return null;
        }).filter(a => a !== null);
        // ADDING DUMMY NOTIFICATION FOR TESTING (Remove in production)
        alerts.push({ id: 'dummy-1', type: 'expiry', room: '999', time: 15 });
        
        setNotifications(alerts);
      } catch (err) {
        console.error('Notification fetch error:', err);
      }
    };

    if (token) {
      checkStatus();
      const interval = setInterval(checkStatus, 60000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const getMenuForRole = (role) => {
    switch(role) {
      case 'superadmin':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
          { icon: CalendarCheck, label: 'Booking Overview', path: '/dashboard/bookings' },
          { icon: Users, label: 'Customer Details', path: '/dashboard/customers' },
          { icon: BedDouble, label: 'Rooms Status', path: '/dashboard/rooms' },
          { icon: Brush, label: 'Housekeeping', path: '/dashboard/housekeeping' },
          { icon: Coffee, label: 'Services', path: '/dashboard/services' },
          { icon: Shield, label: 'User Management', path: '/dashboard/users' },
          { icon: UserCheck, label: 'Staff Directory', path: '/dashboard/staff' },
          { icon: UserPlus, label: 'Enrollment', path: '/dashboard/enroll' },
          { icon: IndianRupee, label: 'Salary Management', path: '/dashboard/salary' },
          { icon: Wallet, label: 'Financial Mgt', path: '/dashboard/finance' },
          { icon: ClipboardList, label: 'Inventory Management', path: '/dashboard/inventory' },
          { icon: BarChart, label: 'Analytics', path: '/dashboard/analytics' },
          { icon: Settings, label: 'Setting', path: '/dashboard/system' },
        ];
      case 'subadmin':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
          { icon: CalendarCheck, label: 'Booking Management', path: '/dashboard/bookings' },
          { icon: Users, label: 'Customer Details', path: '/dashboard/customers' },
          { icon: BedDouble, label: 'Rooms Status', path: '/dashboard/rooms' },
          { icon: Brush, label: 'Housekeeping', path: '/dashboard/housekeeping' },
          { icon: Coffee, label: 'Services', path: '/dashboard/services' },
          { icon: BedDouble, label: 'Hotel Management', path: '/dashboard/hotel' },
          { icon: ClipboardList, label: 'Inventory Management', path: '/dashboard/inventory' },
          { icon: UserCheck, label: 'Staff Details', path: '/dashboard/staff' },
          { icon: IndianRupee, label: 'Salary Management', path: '/dashboard/salary' },
          { icon: FileText, label: 'Basic Reports', path: '/dashboard/reports' },
        ];
      case 'reception':
        return [
          { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
          { icon: BedDouble, label: 'Rooms Status', path: '/dashboard/rooms' },
          { icon: UserPlus, label: 'Check In', path: '/dashboard/enroll' },
          { icon: Calendar, label: 'Check Out', path: '/dashboard/bookings' },
          { icon: Users, label: 'Customer Registry', path: '/dashboard/customers' },
        ];
      default: return [];
    }
  };

  const menu = getMenuForRole(user?.role);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Sidebar */}
      <div style={{ 
        width: sidebarOpen ? '260px' : '0', 
        transition: 'var(--transition)', 
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        zIndex: 50,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div style={{ padding: '8px', background: 'var(--primary)', borderRadius: '8px', color: 'var(--bg-dark)' }}>
              <BedDouble size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', color: 'white' }}>HMS Elite</h2>
          </div>

          <nav>
            {menu.map((item, idx) => (
              <SidebarItem 
                key={idx} 
                icon={item.icon} 
                label={item.label} 
                path={item.path} 
                active={location.pathname === item.path}
              />
            ))}
          </nav>
        </div>

        <div style={{ padding: '24px', position: 'sticky', bottom: 0, background: 'var(--surface)' }}>
          <button 
            onClick={logout}
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '12px', 
              color: 'var(--danger)', 
              background: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: '12px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{ height: '70px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', color: 'white' }}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}
              >
                <Bell size={20} color={notifications.length > 0 ? 'var(--primary)' : 'var(--text-muted)'} className={notifications.length > 0 ? 'animate-pulse' : ''} />
                {notifications.length > 0 && (
                  <div style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--danger)', color: 'white', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {notifications.length}
                  </div>
                )}
              </button>

              {/* Notification Overlay */}
              {showNotifications && (
                <div className="glass-card animate-fade-in" style={{ position: 'absolute', top: '45px', right: '0', width: '320px', padding: '16px', zIndex: 100, border: '1px solid var(--border)', maxHeight: '400px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Stay-Expiry Alerts</h4>
                    <span style={{ fontSize: '10px', color: 'var(--primary)' }}>Real-time Monitoring</span>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No guest stays expiring in the next 30 minutes.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {notifications.map(n => (
                        <div key={n.id} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px', 
                          padding: '12px', 
                          background: n.type === 'expiry' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)', 
                          borderRadius: '12px', 
                          borderLeft: `4px solid ${n.type === 'expiry' ? 'var(--danger)' : 'var(--success)'}` 
                        }}>
                          <div style={{ 
                            padding: '8px', 
                            background: n.type === 'expiry' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                            color: n.type === 'expiry' ? 'var(--danger)' : 'var(--success)', 
                            borderRadius: '8px' 
                          }}>
                            {n.type === 'expiry' ? <Clock size={16} /> : <UserPlus size={16} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                              <p style={{ fontSize: '13px', fontWeight: 800 }}>Room {n.room}</p>
                              <span style={{ fontSize: '10px', opacity: 0.6 }}>{n.type === 'expiry' ? 'Checkout' : 'New Guest'}</span>
                            </div>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {n.type === 'expiry' ? `Expiring in ${n.time} mins` : `${n.guest} checked in recently`}
                            </p>
                          </div>
                        </div>
                      ))}
                      <Link to="/dashboard/bookings" onClick={() => setShowNotifications(false)} style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>View All Active Bookings</Link>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{user?.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</p>
              </div>
              <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-dark)', fontWeight: 'bold' }}>
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Pages */}
        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route index element={<Summary />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="enroll" element={<Enrollment />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="hotel" element={<HotelManagement />} />
            <Route path="finance" element={<FinancialManagement />} />
            <Route path="system" element={<SystemControl />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="salary" element={<Attendance />} />
            <Route path="reports" element={<Reports />} />
            <Route path="customers" element={<CustomerDetails />} />
            <Route path="housekeeping" element={<Housekeeping />} />
            <Route path="services" element={<Services />} />
            <Route path="staff" element={<Staff />} />
            <Route path="inventory" element={<Inventory />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
