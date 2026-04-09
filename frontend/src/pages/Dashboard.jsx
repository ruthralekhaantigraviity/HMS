import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users, BedDouble, Wallet, Settings, 
  LogOut, LayoutDashboard, Calendar, ClipboardList, 
  UserPlus, UserCheck, Bell, Search, Menu, X,
  Shield, BarChart, CalendarCheck, FileText, IndianRupee,
  Brush, Coffee, Clock, Utensils, MessageSquare,
  Sun, Moon, AlertCircle, Globe, User
} from 'lucide-react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
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
import StaffSummary from './StaffSummary';
import RoomServiceTasks from './RoomServiceTasks';
import StaffPayouts from './StaffPayouts';
import Queries from './Queries';
import TechnicalIssues from './TechnicalIssues';

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
  const navigate = useNavigate();
  const { user, login, logout, token } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.setAttribute('data-theme', 'dark');
    } else {
      setIsDarkMode(false);
      document.body.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get('/api/bookings/active');
        
        const now = new Date();
        const data = Array.isArray(res.data) ? res.data : [];
        const fetchedAlerts = data.map(b => {
          if (!b || !b.expectedCheckOut) return null;
          const expiryDiff = (new Date(b.expectedCheckOut) - now) / (1000 * 60);
          const arrivalDiff = (now - new Date(b.createdAt)) / (1000 * 60);

          if (expiryDiff > 0 && expiryDiff <= 30) {
            return { 
              id: b._id, 
              type: 'expiry', 
              room: b.room?.roomNumber || 'Unknown', 
              guest: b.customer?.name || 'Guest',
              customer: b.customer,
              booking: b,
              time: Math.round(expiryDiff) 
            };
          }
          if (arrivalDiff <= 15 && user?.role !== 'reception') {
            return { 
              id: b._id, 
              type: 'arrival', 
              room: b.room?.roomNumber || 'Unknown', 
              guest: b.customer?.name || 'Guest',
              customer: b.customer,
              booking: b
            };
          }
          return null;
        }).filter(a => a !== null);

        // Add dummy notifications as requested for demonstration
        const dummyAlerts = [
          { id: 'dummy-1', type: 'expiry', room: '302', guest: 'Rahul V.', time: 15, isDummy: true, customer: { name: 'Rahul V.', phone: '9876543210', identityNumber: 'ID-123456', identityType: 'Aadhar' }, booking: { checkIn: new Date(), expectedCheckOut: new Date(), totalAmount: 1500 } },
          { id: 'dummy-2', type: 'expiry', room: '105', guest: 'Priya S.', time: 5, isDummy: true, customer: { name: 'Priya S.', phone: '9876543211', identityNumber: 'ID-654321', identityType: 'PAN Card' }, booking: { checkIn: new Date(), expectedCheckOut: new Date(), totalAmount: 2200 } }
        ];
        
        setNotifications([...dummyAlerts, ...fetchedAlerts]);
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error('Notification fetch error:', err);
        }
      }
    };

    if (token && user) {
      checkStatus();
      const interval = setInterval(checkStatus, 60000);
      return () => clearInterval(interval);
    }
  }, [token, user?.role]); // Only re-run if role changes, to avoid loops

  const getMenuForRole = (role) => {
    const r = role.toLowerCase();
    switch(r) {
      case 'superadmin':
      case 'admin':
      case 'subadmin':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
          { icon: CalendarCheck, label: 'Booking Overview', path: '/dashboard/bookings' },
          { icon: Users, label: 'Customer Details', path: '/dashboard/customers' },
          { icon: BedDouble, label: 'Rooms Status', path: '/dashboard/rooms' },
          { icon: MessageSquare, label: 'Guest Queries', path: '/dashboard/queries' },
          { icon: Brush, label: 'Housekeeping', path: '/dashboard/housekeeping' },
          { icon: Coffee, label: 'Services', path: '/dashboard/services' },
          { icon: Shield, label: 'User Management', path: '/dashboard/users' },
          { icon: UserCheck, label: 'Staff Directory', path: '/dashboard/staff' },
          { icon: CalendarCheck, label: 'Booking', path: '/dashboard/enroll' },
          { icon: IndianRupee, label: 'Salary Management', path: '/dashboard/salary' },
          { icon: Wallet, label: 'Financial Management', path: '/dashboard/finance' },
          { icon: ClipboardList, label: 'Inventory Management', path: '/dashboard/inventory' },
          { icon: BarChart, label: 'Revenue', path: '/dashboard/analytics' },
          { icon: AlertCircle, label: 'Technical Issues', path: '/dashboard/tech-issues' },
          { icon: Settings, label: 'Setting', path: '/dashboard/system' }
        ];
      case 'reception':
        return [
          { icon: LayoutDashboard, label: 'Room Dashboard', path: '/dashboard' },
          { icon: CalendarCheck, label: 'New Booking', path: '/dashboard/bookings' },
          { icon: AlertCircle, label: 'Technical Issues', path: '/dashboard/tech-issues' },
          { icon: FileText, label: 'Room Information', path: '/dashboard/rooms' },
          { icon: Clock, label: 'Room History', path: '/dashboard/reports' },
          { icon: Settings, label: 'Settings', path: '/dashboard/system' }
        ];
      case 'housekeeping':
        return [
          { icon: LayoutDashboard, label: 'My HRM Stats', path: '/dashboard' },
          { icon: AlertCircle, label: 'Technical Issues', path: '/dashboard/tech-issues' },
          { icon: IndianRupee, label: 'Salary Records', path: '/dashboard/payouts' }
        ];
      case 'roomservice':
        return [
          { icon: LayoutDashboard, label: 'My HRM Stats', path: '/dashboard' },
          { icon: Utensils, label: 'Service Orders', path: '/dashboard/tasks' },
          { icon: AlertCircle, label: 'Technical Issues', path: '/dashboard/tech-issues' },
          { icon: IndianRupee, label: 'Salary Records', path: '/dashboard/payouts' }
        ];
      default: return [];
    }
  };

  const rawRole = user?.role;
  
  if (!user || !rawRole) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-pulse" style={{ fontSize: '1.2rem', fontWeight: 800 }}>INITIALIZING SECURE SESSION...</div>
          <div style={{ fontSize: '10px', marginTop: '10px', opacity: 0.5, letterSpacing: '2px' }}>ESTABLISHING ENCRYPTED ADMIN CHANNEL</div>
        </div>
      </div>
    );
  }

  const role = rawRole.toLowerCase();
  const menu = getMenuForRole(role);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', transition: 'var(--transition)' }}>
      {/* Sidebar */}
      <div style={{ 
        width: sidebarOpen ? '260px' : '0', 
        transition: 'var(--transition)', 
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'var(--bg-main)',
        borderRight: '1px solid var(--border)',
        zIndex: 50,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div style={{ padding: '8px', background: 'var(--primary)', borderRadius: '8px', color: 'white' }}>
              <BedDouble size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontFamily: 'Outfit' }}>Hotel Glitz</h2>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menu.map((item, idx) => (
              <SidebarItem 
                key={idx} 
                icon={item.icon} 
                label={item.label} 
                path={item.path} 
                active={location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))}
              />
            ))}
          </nav>
        </div>

        <div style={{ padding: '24px', position: 'sticky', bottom: 0, background: 'var(--bg-main)', borderTop: '1px solid var(--border)' }}>
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
              cursor: 'pointer',
              fontFamily: 'Outfit'
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-sec)' }}>
        {/* Header */}
        <header style={{ height: '70px', background: 'var(--glass)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 40 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', border: 'none', cursor: 'pointer' }}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', padding: '8px', borderRadius: '50%', transition: 'var(--transition)' }}>
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
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
                        <div 
                          key={n.id} 
                          onClick={() => {
                            setShowNotifications(false);
                            if (n.customer) {
                              setSelectedBooking(n);
                              setShowModal(true);
                            } else {
                              navigate('/dashboard/customers', { state: { search: n.guest } });
                            }
                          }}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            padding: '12px', 
                            background: n.type === 'expiry' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)', 
                            borderRadius: '12px', 
                            borderLeft: `4px solid ${n.type === 'expiry' ? 'var(--danger)' : 'var(--success)'}`,
                            cursor: 'pointer',
                            transition: 'var(--transition)'
                          }}
                          className="hover-card"
                        >
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
                            <p style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: 600 }}>Guest: {n.guest}</p>
                            <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                              {n.type === 'expiry' ? `Expiring in ${n.time} mins` : `Checked in recently`}
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
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{user?.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</p>
              </div>
              <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Quick View Modal */}
        {showModal && selectedBooking && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative', border: '1px solid var(--primary-glow)' }}>
              <button 
                onClick={() => setShowModal(false)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--primary)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white' }}>
                  <User size={32} />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{selectedBooking.customer?.name}</h2>
                <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px' }}>Room {selectedBooking.room}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Phone Number</p>
                  <p style={{ fontWeight: 600 }}>{selectedBooking.customer?.phone}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Identity</p>
                  <p style={{ fontWeight: 600 }}>{selectedBooking.customer?.identityType}: {selectedBooking.customer?.identityNumber}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Check-in</p>
                  <p style={{ fontWeight: 600 }}>{new Date(selectedBooking.booking?.checkIn).toLocaleDateString()}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Amount Paid</p>
                  <p style={{ fontWeight: 600, color: 'var(--success)' }}>₹{selectedBooking.booking?.totalAmount}</p>
                </div>
              </div>

              <button 
                onClick={() => {
                  setShowModal(false);
                  navigate('/dashboard/customers', { state: { search: selectedBooking.customer?.name } });
                }}
                style={{ width: '100%', padding: '14px', background: 'var(--primary)', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', transition: 'var(--transition)' }}
                className="btn-primary"
              >
                View Full Profile
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Pages */}
        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>

          <Routes>
            <Route index element={
              user ? (
                ['superadmin', 'admin', 'subadmin', 'reception'].includes(role)
                ? <Summary /> 
                : <StaffSummary />
              ) : (
                <div style={{ padding: '100px', textAlign: 'center', color: 'var(--primary)' }}>
                  <div className="animate-pulse" style={{ fontSize: '1.2rem', fontWeight: '800' }}>INITIALIZING HMS PORTAL...</div>
                  <div style={{ fontSize: '10px', marginTop: '10px', opacity: 0.5, letterSpacing: '2px' }}>ESTABLISHING SECURE ADMIN CHANNEL</div>
                </div>
              )
            } />
            
            {/* Management & Administration (SuperAdmin, Admin, SubAdmin) */}
            {['superadmin', 'admin', 'subadmin'].includes(role) && (
              <>
                <Route path="users" element={<UserManagement />} />
                <Route path="finance" element={<FinancialManagement />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="queries" element={<Queries />} />
              </>
            )}

            {/* Operations (All Admin levels + Reception) */}
            {['superadmin', 'admin', 'subadmin', 'reception'].includes(role) && (
              <>
                <Route path="rooms" element={<Rooms />} />
                <Route path="enroll" element={<Enrollment />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="customers" element={<CustomerDetails />} />
                <Route path="housekeeping" element={<Housekeeping />} />
                <Route path="services" element={<Services />} />
                <Route path="staff" element={<Staff />} />
                <Route path="salary" element={<Attendance />} />
                <Route path="reports" element={<Reports />} />
                <Route path="system" element={<SystemControl />} />
                <Route path="admin" element={<HotelManagement />} />
              </>
            )}

            {/* General & Shared Pages */}
            <Route path="profile" element={<StaffSummary />} />
            <Route path="tasks" element={<RoomServiceTasks />} />
            <Route path="payouts" element={<StaffPayouts />} />
            <Route path="tech-issues" element={<TechnicalIssues />} />

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
