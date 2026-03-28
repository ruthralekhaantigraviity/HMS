import React, { useState } from 'react';
import { Shield, MessageSquare, Mail, Database, History, Bell, Lock, Key } from 'lucide-react';

const ControlCard = ({ icon: Icon, title, description, badge }) => (
  <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start', cursor: 'pointer', border: '1px solid var(--border)', transition: 'var(--transition)' }}>
    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: 'var(--primary)' }}>
      <Icon size={24} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '1.1rem' }}>{title}</h3>
        {badge && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'var(--primary)', color: 'var(--bg-dark)', fontWeight: 700 }}>{badge}</span>}
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{description}</p>
    </div>
  </div>
);

const SystemControl = () => {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1>System Control</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure core system behavior, security, and data safety.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <ControlCard icon={Lock} title="Default Login Setup" description="Configure master password and session timeout policies." badge="SECURE" />
        <ControlCard icon={Key} title="OTP Settings" description="Adjust OTP length, expiry time, and retry limit." />
        <ControlCard icon={Bell} title="Notification Settings" description="Enable or disable SMS & Email alerts for bookings." />
        <ControlCard icon={Database} title="Backup & Restore" description="Trigger manual database backups or restore from history." />
        <ControlCard icon={History} title="Audit Logs" description="Track all administrative actions and system changes." />
        <ControlCard icon={Shield} title="Service Status" description="Monitor third-party API health and DB connectivity." badge="ONLINE" />
      </div>

      <div className="glass-card" style={{ padding: '32px' }}>
        <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Bell size={20} color="var(--primary)" /> Notification Channels</h3>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <MessageSquare size={20} color="#10b981" />
              <div>
                <h4 style={{ fontSize: '1rem' }}>SMS Notifications</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Send check-in/out alerts via SMS.</p>
              </div>
            </div>
            <div style={{ width: '40px', height: '20px', background: 'var(--success)', borderRadius: '20px', position: 'relative', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', right: '4px', top: '4px', width: '12px', height: '12px', background: 'white', borderRadius: '50%' }}></div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Mail size={20} color="var(--primary)" />
              <div>
                <h4 style={{ fontSize: '1rem' }}>Email Notifications</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Automated invoices and reports via Email.</p>
              </div>
            </div>
            <div style={{ width: '40px', height: '20px', background: 'var(--success)', borderRadius: '20px', position: 'relative', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', right: '4px', top: '4px', width: '12px', height: '12px', background: 'white', borderRadius: '50%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemControl;
