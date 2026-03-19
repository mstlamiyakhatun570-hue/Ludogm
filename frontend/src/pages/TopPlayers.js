import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import { FaArrowLeft, FaSkull } from 'react-icons/fa';

export default function TopPlayers() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/users/top').then(res => setPlayers(res.data)).finally(() => setLoading(false));
  }, []);

  const rankColors = ['#f59e0b', '#9ca3af', '#b45309'];

  return (
    <div className="pb-nav animate-fade">
      <TopBar/>
      <div style={{padding:'16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px'}}>
          <button onClick={() => navigate(-1)} style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'8px', padding:'8px 10px', color:'white', cursor:'pointer'}}>
            <FaArrowLeft size={14}/>
          </button>
          <h2 style={{fontFamily:'Rajdhani', fontSize:'20px', fontWeight:700}}>🏆 Top Players</h2>
        </div>
        {loading ? <div className="page-loader"><div className="spinner"/></div>
        : players.map((p, i) => (
          <div key={p._id} style={{background:'var(--bg-card)', border:`1px solid ${i < 3 ? rankColors[i]+'44' : 'var(--border)'}`, borderRadius:10, padding:'14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
            <div style={{width:32, height:32, borderRadius:'50%', background: i < 3 ? `${rankColors[i]}22` : 'var(--bg-card2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:700, color: i < 3 ? rankColors[i] : 'var(--text-muted)', flexShrink:0}}>
              {i < 3 ? ['🥇','🥈','🥉'][i] : i+1}
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700, fontSize:'15px'}}>{p.name}</div>
              <div style={{fontSize:'11px', color:'var(--text-muted)'}}>Promo: {p.promoCode}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:'Rajdhani', fontSize:'16px', fontWeight:700, color:'var(--accent)'}}>৳{p.totalWin}</div>
              <div style={{fontSize:'11px', color:'var(--danger)', display:'flex', alignItems:'center', gap:'3px', justifyContent:'flex-end'}}>
                <FaSkull size={9}/> {p.totalKills} kills
              </div>
            </div>
          </div>
        ))}
      </div>
      <Navbar/>
    </div>
  );
}

