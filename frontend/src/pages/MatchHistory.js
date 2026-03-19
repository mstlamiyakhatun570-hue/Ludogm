import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaGamepad } from 'react-icons/fa';
import { format } from 'date-fns';

const STATUS_INFO = {
  upcoming: { label: '⏳ আসছে', color: 'var(--accent)' },
  running: { label: '🔴 চলছে', color: '#60a5fa' },
  completed: { label: '✅ শেষ', color: 'var(--accent2)' },
  cancelled: { label: '❌ বাতিল', color: 'var(--danger)' },
};

export default function MatchHistory() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/matches/user/history').then(res => setMatches(res.data)).finally(() => setLoading(false));
  }, []);

  const getMyPlayer = (match) => {
    return match.players?.find(p => {
      const pid = p.user?._id || p.user;
      return pid?.toString() === user?._id?.toString();
    });
  };

  return (
    <div className="pb-nav animate-fade">
      <TopBar/>
      <div style={{padding:'16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px'}}>
          <button onClick={() => navigate(-1)} style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'8px', padding:'8px 10px', color:'white', cursor:'pointer'}}>
            <FaArrowLeft size={14}/>
          </button>
          <h2 style={{fontFamily:'Rajdhani', fontSize:'20px', fontWeight:700}}>Match History</h2>
        </div>

        {loading ? <div className="page-loader"><div className="spinner"/></div>
        : matches.length === 0 ? (
          <div className="empty-state"><FaGamepad size={40}/><p style={{marginTop:12}}>কোনো ম্যাচ খেলা হয়নি</p></div>
        ) : matches.map(m => {
          const myPlayer = getMyPlayer(m);
          const statusInfo = STATUS_INFO[m.status] || STATUS_INFO.upcoming;
          return (
            <div key={m._id} onClick={() => navigate(`/match/${m._id}`)}
              style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'14px', marginBottom:'10px', cursor:'pointer'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px'}}>
                <div>
                  <span style={{fontSize:'10px', background:'var(--purple-glow)', color:'var(--purple-light)', padding:'2px 6px', borderRadius:4, fontWeight:600}}>{m.game}</span>
                  <h3 style={{fontFamily:'Rajdhani', fontSize:'15px', fontWeight:700, marginTop:'4px'}}>{m.title}</h3>
                  <span style={{fontSize:'12px', color:'var(--text-secondary)'}}>{m.matchTime ? format(new Date(m.matchTime), 'dd/MM/yyyy hh:mm a') : ''}</span>
                </div>
                <span style={{fontSize:'12px', fontWeight:700, color: statusInfo.color}}>{statusInfo.label}</span>
              </div>
              <div style={{display:'flex', gap:'12px', fontSize:'12px'}}>
                <span style={{color:'var(--text-muted)'}}>ফি: <strong style={{color:'var(--text-primary)'}}>{m.entryFee}৳</strong></span>
                {myPlayer?.kills > 0 && <span style={{color:'var(--text-muted)'}}>কিল: <strong style={{color:'var(--danger)'}}>{myPlayer.kills}</strong></span>}
                {myPlayer?.prize > 0 && <span style={{color:'var(--text-muted)'}}>পুরস্কার: <strong style={{color:'var(--accent2)'}}>{myPlayer.prize}৳</strong></span>}
                {myPlayer?.resultStatus && myPlayer.resultStatus !== 'pending' && (
                  <span style={{color: myPlayer.resultStatus === 'approved' ? 'var(--accent2)' : myPlayer.resultStatus === 'rejected' ? 'var(--danger)' : 'var(--accent)'}}>
                    {myPlayer.resultStatus === 'approved' ? '✅' : myPlayer.resultStatus === 'rejected' ? '❌' : '⏳'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <Navbar/>
    </div>
  );
}
