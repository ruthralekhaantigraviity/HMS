import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User, MessageSquare, Shield, Loader2, Search, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ChatHub = () => {
  const { user, token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchContacts();
  }, [token]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact._id);
      const interval = setInterval(() => fetchMessages(selectedContact._id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedContact, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get('/api/messages/contacts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchMessages = async (contactId) => {
    try {
      const res = await axios.get(`/api/messages/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    try {
      setSending(true);
      const res = await axios.post('/api/messages', {
        receiverId: selectedContact._id,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', background: 'var(--bg-card)', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
      {/* Contact List Sidebar */}
      <div style={{ width: '320px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare color="var(--primary)" /> 
            Team Chat
          </h2>
          <div style={{ position: 'relative' }}>
             <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
             <input 
              placeholder="Search staff..." 
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: '#fff', fontSize: '14px' }}
             />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {loadingContacts ? (
             <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" color="var(--primary)" /></div>
          ) : contacts.map((c) => (
             <div 
              key={c._id} 
              onClick={() => { setSelectedContact(c); setMessages([]); }}
              style={{ 
                padding: '16px', 
                borderRadius: '16px', 
                cursor: 'pointer', 
                marginBottom: '8px',
                background: selectedContact?._id === c._id ? 'var(--primary)' : 'transparent',
                color: selectedContact?._id === c._id ? 'var(--bg-dark)' : '#fff',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
              className={selectedContact?._id !== c._id ? 'hover-glow' : ''}
             >
                <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <User size={24} />
                </div>
                <div style={{ flex: 1 }}>
                   <p style={{ fontWeight: 800, fontSize: '14px' }}>{c.name}</p>
                   <p style={{ fontSize: '11px', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>{c.role}</p>
                </div>
             </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.01)' }}>
        {selectedContact ? (
          <>
            <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'var(--surface)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><Shield size={20} /></div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{selectedContact.name}</h3>
                    <p style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 800 }}>ACTIVE NOW</p>
                  </div>
               </div>
            </div>

            <div style={{ flex: 1, padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {messages.map((m, idx) => (
                 <div key={idx} style={{ 
                   display: 'flex', 
                   justifyContent: m.sender === user._id ? 'flex-end' : 'flex-start'
                 }}>
                   <div style={{ 
                     maxWidth: '70%', 
                     padding: '16px 20px', 
                     borderRadius: m.sender === user._id ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                     background: m.sender === user._id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                     color: m.sender === user._id ? 'var(--bg-dark)' : '#fff',
                     boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                     border: m.sender === user._id ? 'none' : '1px solid var(--border)'
                   }}>
                      <p style={{ fontSize: '15px', lineHeight: 1.5, fontWeight: 600 }}>{m.content}</p>
                      <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                         {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         {m.sender === user._id && <CheckCircle size={10} />}
                      </div>
                   </div>
                 </div>
               ))}
               <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '24px 32px', borderTop: '1px solid var(--border)' }}>
               <div style={{ display: 'flex', gap: '16px', background: 'var(--surface)', padding: '8px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message for the team..." 
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', background: 'transparent', border: 'none', color: '#fff', fontSize: '15px' }}
                  />
                  <button 
                    disabled={!newMessage.trim() || sending}
                    style={{ padding: '12px 24px', background: 'var(--primary)', color: 'var(--bg-dark)', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    className="hover-glow"
                  >
                     {sending ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> SEND</>}
                  </button>
               </div>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 0.5 }}>
             <div style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%', marginBottom: '24px' }}>
                <MessageSquare size={60} strokeWidth={1} />
             </div>
             <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome to HMS Chat Hub</h3>
             <p style={{ color: 'var(--text-muted)' }}>Select a staff member from the left to start connecting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHub;
