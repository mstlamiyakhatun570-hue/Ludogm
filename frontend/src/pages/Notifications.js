// Notifications.js
import { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import { FaBell, FaArrowLeft } from 'react-icons/fa';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/notifications').then(res => setNotifications(res.data)).finally(() => setLoading(false));
    API.post('/notifications/read-all').catch(() => {});
  }, []);

  return (
    <div className="pb-nav animate-fade">
      <TopBar/>
      <div style={{padding:'16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px'}}>
          <button onClick={() => navigate(-1)} style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'8px', padding:'8px 10px', color:'white', cursor:'pointer'}}>
            <FaArrowLeft size={14}/>
          </button>
          <h2 style={{fontFamily:'Rajdhani', fontSize:'20px', fontWeight:700}}>নোটিফিকেশন</h2>
        </div>
        {loading ? <div className="page-loader"><div className="spinner"/></div>
        : notifications.length === 0 ? (
          <div className="empty-state"><FaBell size={40}/><p style={{marginTop:12}}>কোনো নোটিফিকেশন নেই</p></div>
        ) : notifications.map(n => (
          <div key={n._id} style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'14px', marginBottom:'10px'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'6px'}}>
              <strong style={{fontSize:'14px', fontFamily:'Rajdhani'}}>{n.title}</strong>
              <span style={{fontSize:'11px', color:'var(--text-muted)'}}>{format(new Date(n.createdAt), 'dd/MM/yyyy HH:mm')}</span>
            </div>
            <p style={{fontSize:'13px', color:'var(--text-secondary)', lineHeight:1.5}}>{n.message}</p>
          </div>
        ))}
      </div>
      <Navbar/>
    </div>
  );
}
