import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import API from '../../utils/api';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/admin/users/stats/dashboard').then(res => setStats(res.data)).catch(() => {});
  }, []);

  const cards = stats ? [
    { label: 'মোট User', value: stats.totalUsers, color: '#60a5fa', emoji: '👥', path: '/admin/users' },
    { label: 'মোট Match', value: stats.totalMatches, color: 'var(--purple-light)', emoji: '🎮', path: '/admin/matches' },
    { label: 'Pending Add Money', value: `${stats.pendingAddMoney} (৳${stats.pendingAddMoneyTotal})`, color: 'var(--accent2)', emoji: '💰', path: '/admin/addmoney' },
    { label: 'Pending Withdraw', value: `${stats.pendingWithdraw} (৳${stats.pendingWithdrawTotal})`, color: 'var(--accent)', emoji: '💸', path: '/admin/withdraw' },
  ] : [];

  const quickLinks = [
    { label: '➕ নতুন Match', path: '/admin/matches/new', color: 'var(--purple)' },
    { label: '🖼 Slider', path: '/admin/sliders', color: '#60a5fa' },
    { label: '🔔 Notification', path: '/admin/notifications', color: 'var(--accent)' },
    { label: '⚙️ Settings', path: '/admin/settings', color: 'var(--accent2)' },
  ];

  return (
    <AdminLayout title="Admin Dashboard">
      {!stats ? <div className="page-loader"><div className="spinner"/></div> : (
        <>
          <div className="admin-stats">
            {cards.map((c, i) => (
              <div key={i} className="admin-stat-card" style={{cursor:'pointer', borderColor:`${c.color}33`}} onClick={() => navigate(c.path)}>
                <div style={{fontSize:'20px', marginBottom:'4px'}}>{c.emoji}</div>
                <div className="stat-label">{c.label}</div>
                <div className="stat-value" style={{color: c.color}}>{c.value}</div>
              </div>
            ))}
          </div>

          <h3 style={{fontFamily:'Rajdhani', fontSize:'16px', fontWeight:700, marginBottom:'10px'}}>Quick Actions</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
            {quickLinks.map((l, i) => (
              <button key={i} onClick={() => navigate(l.path)} style={{
                background:'var(--bg-card)', border:`1px solid ${l.color}44`,
                borderRadius:10, padding:'14px', color: l.color,
                fontSize:'14px', fontWeight:700, cursor:'pointer',
                fontFamily:'Hind Siliguri, sans-serif', transition:'all 0.2s'
              }}>
                {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
