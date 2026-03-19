import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Navbar from '../components/Navbar';
import MatchCard from '../components/MatchCard';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { FaArrowLeft } from 'react-icons/fa';

export default function Matches() {
  const { game } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ game, status: filter });
    if (mode) params.set('mode', mode); // backend uses ?mode= → filter.gameMode
    API.get(`/matches?${params}`)
      .then(res => setMatches(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [game, mode, filter]);

  return (
    <div className="pb-nav">
      <TopBar/>
      <div style={{padding:'12px 16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px'}}>
          <button onClick={() => navigate(-1)} style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'8px', padding:'8px 10px', color:'var(--text-primary)', cursor:'pointer'}}>
            <FaArrowLeft size={14}/>
          </button>
          <div>
            <h2 style={{fontFamily:'Rajdhani', fontSize:'18px', fontWeight:700}}>{game} - {mode}</h2>
            <span style={{fontSize:'12px', color:'var(--text-secondary)'}}>{matches.length} Match Found</span>
          </div>
        </div>

        {/* Status filter */}
        <div style={{display:'flex', gap:'8px', marginBottom:'14px', overflowX:'auto', paddingBottom:'4px'}}>
          {['upcoming','running','completed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding:'6px 14px', borderRadius:'20px', border:'none', cursor:'pointer',
                background: filter === s ? 'var(--purple)' : 'var(--bg-card)',
                color: filter === s ? 'white' : 'var(--text-secondary)',
                fontSize:'13px', fontWeight:600, whiteSpace:'nowrap',
                fontFamily:'Hind Siliguri, sans-serif'
              }}>
              {s === 'upcoming' ? '⏳ আসছে' : s === 'running' ? '🔴 চলছে' : '✅ শেষ'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner"/></div>
        ) : matches.length === 0 ? (
          <div className="empty-state">
            <div style={{fontSize:'40px', marginBottom:'12px'}}>🎮</div>
            <p>কোনো ম্যাচ পাওয়া যায়নি</p>
          </div>
        ) : (
          matches.map(m => <MatchCard key={m._id} match={m} userId={user?._id}/>)
        )}
      </div>
      <Navbar/>
    </div>
  );
}
