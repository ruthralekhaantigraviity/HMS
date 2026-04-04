import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Menu, X, Sun, Moon, Search, Calendar, Users, MapPin, 
  Wifi, Coffee, Utensils, Waves, Shield, Award, 
  Mail, Phone, ChevronRight,
  Maximize, Star
} from 'lucide-react';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { token, user, loading: authLoading, debugReset } = useAuth();
  console.log("LandingPage: Initializing... Auth status:", !!token);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Theme Toggle
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.body.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    console.log("LandingPage: useEffect running");
    
    // STRONGER HARD REDIRECT
    const hardToken = localStorage.getItem('hms_token');
    if (hardToken) {
      console.log("LandingPage: HARD TOKEN DETECTED. Bypassing React state for direct entry.");
      window.location.href = '/dashboard';
    }

    if (token) {
      console.log("LandingPage: Authenticated user detected, redirecting to Dashboard...");
      navigate('/dashboard');
      return;
    }
    // Initial theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.setAttribute('data-theme', 'dark');
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Fetch Data
    const fetchData = async () => {
      try {
        const roomsRes = await axios.get('http://localhost:5000/api/rooms');
        setRooms(roomsRes.data.filter(r => r.status === 'Available').slice(0, 3));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className={`landing-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logo-container">
          <img src="/assets/images/logo.png" alt="Hotel Glitz" />
        </div>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#rooms">Rooms</a>
          <a href="#features">Features</a>
          <a href="#gallery">Gallery</a>
          <a href="#queries">Queries</a>
          {token ? (
            <button className="book-btn" style={{ padding: '10px 20px', marginLeft: '10px', background: 'var(--success)' }} onClick={() => navigate('/dashboard')}>Dashboard</button>
          ) : (
            <button className="book-btn" style={{ padding: '10px 20px', marginLeft: '10px' }} onClick={() => navigate('/login')}>Login</button>
          )}
          <button onClick={toggleTheme} className="theme-toggle">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <button className="mobile-menu-btn" style={{ display: 'none' }}>
           <Menu />
        </button>
      </nav>

      {/* Hero Section */}
      <header id="home" className="hero-section">
        <div className="hero-content animate-fade">
          <p style={{ letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1rem' }}>Welcome to Excellence</p>
          <h1>Experience Urban Luxury <br /> at Hotel Glitz</h1>
          <p>Where modern sophistication meets timeless hospitality in the heart of the city.</p>
        </div>

        {/* Booking Form */}
        <div className="booking-container animate-fade" style={{ animationDelay: '0.3s' }}>
          <div className="booking-group">
            <label><Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Check In</label>
            <input type="date" defaultValue="2026-04-03" />
          </div>
          <div className="booking-group">
            <label><Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Check Out</label>
            <input type="date" defaultValue="2026-04-05" />
          </div>
          <div className="booking-group">
            <label><Users size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Guests</label>
            <select>
              <option>1 Adult</option>
              <option>2 Adults</option>
              <option>3 Adults</option>
              <option>Family</option>
            </select>
          </div>
          <button className="book-btn">
            <Search size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
            Search Availability
          </button>
        </div>
      </header>

      {/* About Section */}
      <section id="about" className="section">
        <div style={{ display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <img src="/assets/images/lobby.png" alt="Lobby" style={{ width: '100%', borderRadius: '20px', boxShadow: 'var(--shadow)' }} />
          </div>
          <div style={{ flex: '1.2', minWidth: '300px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>Since 1998</span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '1rem', marginBottom: '1.5rem' }}>A Legacy of Exceptional <br /> Urban Hospitality</h2>
            <p style={{ color: 'var(--text-sec)', lineHeight: '1.8', marginBottom: '2rem' }}>
              Hotel Glitz offers a sanctuary of style and comfort. Our meticulously designed spaces and dedicated service team ensure that every guest experiences the pinnacle of luxury. Located in the vibrant financial district, we offer perfect access for both business and leisure.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ padding: '10px', background: 'var(--bg-sec)', borderRadius: '10px', color: 'var(--primary)' }}><Shield /></div>
                <div><h4 style={{ margin:0 }}>Safe Stay</h4><p style={{ fontSize:'12px', color:'var(--text-sec)' }}>Top Hygiene Standards</p></div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ padding: '10px', background: 'var(--bg-sec)', borderRadius: '10px', color: 'var(--primary)' }}><Award /></div>
                <div><h4 style={{ margin:0 }}>Award Winning</h4><p style={{ fontSize:'12px', color:'var(--text-sec)' }}>5 Star Service</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="section" style={{ background: 'var(--bg-sec)' }}>
        <div className="section-header">
          <h2>Luxury Accommodations</h2>
          <p>Each of our rooms is a blend of modern elegance and technological convenience.</p>
        </div>
        <div className="room-grid">
          {loading ? (
             <p>Loading luxury rooms...</p>
          ) : (
            rooms.map(room => (
              <div key={room._id} className="room-card">
                <div className="room-image">
                  <img src={room.image || '/assets/images/room1.png'} alt={room.type} />
                  <div className="room-price">From ${room.price}/night</div>
                </div>
                <div className="room-info">
                  <h3>{room.type} Suite</h3>
                  <div className="room-details">
                    <span><Maximize size={16} /> {room.size} sqft</span>
                    <span><Users size={16} /> Max {room.capacity}</span>
                    <span><MapPin size={16} /> {room.view} View</span>
                  </div>
                  <p style={{ color: 'var(--text-sec)', marginBottom: '1.5rem', fontSize:'14px' }}>{room.description}</p>
                  <button className="view-details-btn">View Suite Details</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Signature Rooms Showcase (Replacing Dining) */}
      <section className="featured-rooms-showcase">
        <div style={{ padding: '100px 5%', background: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url("/assets/images/room1.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', textAlign: 'center', color: 'white' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '600', letterSpacing: '2px' }}>SIGNATURE COLLECTION</span>
          <h2 style={{ fontSize: '3.5rem', margin: '1rem 0' }}>The Glitz Presidential Suites</h2>
          <p style={{ maxWidth: '800px', margin: '0 auto 3rem', fontSize: '1.1rem', opacity: '0.8', lineHeight: '1.8' }}>
            Experience the zenith of urban luxury in our specially curated suites. Each detail is designed for optimal comfort, featuring high-speed digital amenities and breathtaking city views.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto 4rem' }}>
            {[
              { name: 'Skyline Penthouse', price: '1,200', features: ['Private Infinity Pool', '24/7 Butler', 'Panoramic City View'], image: '/assets/images/room1.png' },
              { name: 'Glitz Grand Suite', price: '850', features: ['Personal Gym', 'Home Theater', 'Spa Bathroom'], image: '/assets/images/room2.png' },
              { name: 'Royal Executive', price: '950', features: ['Conference Room', 'Chef Service', 'Master Bedroom'], image: '/assets/images/room1.png' }
            ].map((suite, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <img src={suite.image} alt={suite.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '1.5rem' }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{suite.name}</h3>
                <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.25rem', marginBottom: '1rem' }}>${suite.price} <span style={{ fontSize: '12px', fontWeight: '400', opacity: 0.7 }}>/ night</span></p>
                <ul style={{ listStyle: 'none', marginBottom: '2rem', fontSize: '14px', opacity: 0.8 }}>
                  {suite.features.map((f, i) => <li key={i} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><Star size={14} color="var(--primary)" /> {f}</li>)}
                </ul>
                <button className="book-btn" style={{ width: '100%', padding: '12px' }}>View Luxury Details</button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Features/Services */}
      <section id="features" className="section">
        <div className="section-header">
          <h2>World-Class Amenities</h2>
          <p>We provide everything you need for a seamless and comfortable stay.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {[
            { icon: <Wifi />, title: 'High Speed WiFi' },
            { icon: <Coffee />, title: 'Premium Lounge' },
            { icon: <Utensils />, title: 'In-Room Dining' },
            { icon: <Shield />, title: '24/7 Security' },
            { icon: <Waves />, title: 'Heated Infinity Pool' },
            { icon: <Phone />, title: 'Concierge' }
          ].map((item, idx) => (
            <div key={idx} style={{ padding: '2rem', background: 'var(--bg-main)', borderRadius: '15px', border: '1px solid var(--border)', transition: 'var(--transition)' }} className="amenity-card">
              <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{item.icon}</div>
              <h4>{item.title}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="section" style={{ background: 'var(--bg-sec)' }}>
        <div className="section-header">
          <h2>Visual Journey</h2>
          <p>Glance through the elegance that awaits you at Hotel Glitz.</p>
        </div>
        <div className="gallery-grid">
          {['lobby.png', 'room1.png', 'restaurant.png', 'room2.png', 'lobby.png', 'room1.png'].map((img, idx) => (
            <div key={idx} className="gallery-item">
              <img src={`/assets/images/${img}`} alt="Gallery" />
              <div className="gallery-overlay">
                <Maximize color="white" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Queries Section (Replacing Journal) */}
      <section id="queries" className="section">
        <div className="section-header">
          <h2>Guest Inquiries & Queries</h2>
          <p>Have a question or a special request? Our dedicated team is here to assist you 24/7.</p>
        </div>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h3 style={{ marginBottom: '2rem' }}>Send us a message</h3>
            <form className="contact-form" onSubmit={async (e) => {
              e.preventDefault();
              const formData = {
                name: e.target.name.value,
                email: e.target.email.value,
                subject: 'General Inquiry',
                message: e.target.message.value
              };
              try {
                const btn = e.target.querySelector('button');
                btn.disabled = true;
                btn.innerText = 'Sending...';
                await axios.post('http://localhost:5000/api/queries/submit', formData);
                alert('Thank you! Your inquiry has been submitted successfully.');
                e.target.reset();
              } catch (err) {
                alert('Something went wrong. Please try again later.');
              } finally {
                const btn = e.target.querySelector('button');
                btn.disabled = false;
                btn.innerText = 'Submit Inquiry';
              }
            }}>
               <div className="booking-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Your Name</label>
                  <input name="name" type="text" placeholder="John Doe" style={{ width: '100%' }} required />
               </div>
               <div className="booking-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Email Address</label>
                  <input name="email" type="email" placeholder="john@example.com" style={{ width: '100%' }} required />
               </div>
               <div className="booking-group" style={{ marginBottom: '1.5rem' }}>
                  <label>Message</label>
                  <textarea name="message" placeholder="Tell us more about your inquiry..." style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', minHeight: '120px', background: 'transparent', color: 'var(--text-main)' }} required></textarea>
               </div>
               <button className="book-btn" style={{ width: '100%', padding: '15px' }}>Submit Inquiry</button>
            </form>
          </div>
          <div style={{ flex: '0.8', minWidth: '300px', padding: '2rem', background: 'var(--bg-sec)', borderRadius: '15px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Contact Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ color: 'var(--primary)' }}><Mail size={24} /></div>
                  <div><p style={{ fontSize: '12px', opacity: 0.6 }}>Email Us</p><p>reservations@hotelglitz.com</p></div>
               </div>
               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ color: 'var(--primary)' }}><Phone size={24} /></div>
                  <div><p style={{ fontSize: '12px', opacity: 0.6 }}>Call Us</p><p>+1 (555) 0123 456</p></div>
               </div>
               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ color: 'var(--primary)' }}><MapPin size={24} /></div>
                  <div><p style={{ fontSize: '12px', opacity: 0.6 }}>Our Location</p><p>123 Luxury Ave, Manhattan, NY</p></div>
               </div>
            </div>
            <div style={{ marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border)' }}>
               <h4 style={{ marginBottom: '1rem' }}>Business Hours</h4>
               <p style={{ fontSize: '14px', opacity: 0.8 }}>Front Desk: 24/7 Available</p>
               <p style={{ fontSize: '14px', opacity: 0.8 }}>General Inquiries: Mon-Fri, 9am - 6pm</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-top">
          <div className="footer-col">
            <img src="/assets/images/logo.png" alt="Logo" style={{ height: '40px', marginBottom: '1.5rem' }} />
            <p style={{ opacity: 0.7, lineHeight: 1.6 }}>
              Hotel Glitz is the premier destination for modern luxury and urban comfort. Committed to providing 5-star service and unforgettable experiences.
            </p>
            <div className="social-links">
              {/* Social icons removed temporarily due to export issues */}
            </div>
          </div>
          <div className="footer-col">
            <h4>Management</h4>
            <ul>
              {token ? (
                <li><a href="/dashboard" style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.1rem' }}>➡️ OPEN ADMIN PORTAL</a></li>
              ) : (
                <li><a href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Staff Login</a></li>
              )}
              <li>Employee Directory</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Reservations</h4>
            <ul>
              <li>Rooms & Suites</li>
              <li>Restaurant</li>
              <li>Meeting Rooms</li>
              <li>Event Spaces</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact Info</h4>
            <ul>
              <li><Mail size={16} /> reservations@hotelglitz.com</li>
              <li><Phone size={16} /> +1 (555) 0123 456</li>
              <li><MapPin size={16} /> 123 Luxury Ave, Manhattan, NY</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2026 Hotel Glitz. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
