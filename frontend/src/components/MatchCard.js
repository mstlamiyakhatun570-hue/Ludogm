import { useNavigate } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';
import { FaMap, FaUsers, FaTrophy, FaSkull } from 'react-icons/fa';
import { format } from 'date-fns';
import './MatchCard.css';

const getBannerUrl = (banner) => {
  if (!banner) return '';
  if (banner.startsWith('http')) return banner;
  return `${(process.env.REACT_APP_API_URL||'/api').replace('/api','')}${banner}`;
};

export default function MatchCard({ match, userId }) {
  const navigate = useNavigate();
  const isJoined = match.players?.some(p => {
    const pid = p.user?._id || p.user;
    return pid?.toString() === userId?.toString();
  });
  const slotUsed = match.players?.length || 0;
  const slotPercent = (slotUsed / match.maxSlots) * 100;
  const isFull = slotUsed >= match.maxSlots;
  const bannerUrl = getBannerUrl(match.banner);

  const statusColor = {
    upcoming: 'var(--accent2)',
    running: '#60a5fa',
    completed: 'var(--text-muted)',
    cancelled: 'var(--danger)',
  }[match.status];

  return (
    <div className="match-card animate-slide" onClick={() => navigate(`/match/${match._id}`)}>
      {/* Banner Image */}
      {bannerUrl && (
        <div style={{position:'relative', height:'90px', overflow:'hidden', borderRadius:'10px 10px 0 0', margin:'-14px -14px 10px -14px'}}>
          <img src={bannerUrl} alt={match.title}
            style={{width:'100%', height:'100%', objectFit:'cover'}}
            onError={e => { e.target.parentElement.style.display='none'; }}
          />
          <div style={{position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(13,13,26,0.8))'}}/>
          <span style={{position:'absolute', bottom:'8px', left:'10px', fontSize:'10px', background:'rgba(124,58,237,0.8)', color:'white', padding:'2px 8px', borderRadius:'4px', fontWeight:700}}>
            {match.game}
          </span>
          <span style={{position:'absolute', top:'8px', right:'10px', fontSize:'11px', fontWeight:700, color:'#10b981', fontFamily:'Rajdhani, sans-serif'}}>
            #{match.matchNumber}
          </span>
        </div>
      )}
      <div className="match-card-header">
        <div className="match-card-title">
          {!bannerUrl && <span className="match-game-badge">{match.game}</span>}
          <h3>{match.title}</h3>
          <span style={{fontSize:'12px', color:'var(--text-secondary)'}}>
            {match.matchTime ? format(new Date(match.matchTime), 'dd-MM-yyyy, hh:mm a') : ''}
          </span>
        </div>
        <div style={{textAlign:'right'}}>
          {!bannerUrl && <span className="match-number" style={{color: statusColor}}>#{match.matchNumber}</span>}
          {match.status === 'upcoming' && (
            <div style={{marginTop:'4px'}}>
              <CountdownTimer matchTime={match.matchTime} status={match.status}/>
            </div>
          )}
          {match.status !== 'upcoming' && (
            <span style={{fontSize:'11px', color: statusColor, fontWeight:600}}>
              {match.status === 'running' ? '🔴 চলছে' : match.status === 'completed' ? '✅ শেষ' : '❌ বাতিল'}
            </span>
          )}
        </div>
      </div>

      <div className="match-tags">
        <span className="match-tag blue"><FaMap size={10}/> {match.map}</span>
        <span className="match-tag orange"><FaUsers size={10}/> {match.entryType}</span>
        <span className="match-tag red">ফি: {match.entryFee}৳</span>
      </div>

      <div className="match-prizes">
        <div className="prize-box">
          <FaTrophy size={12} color="var(--accent)"/>
          <span>মোট পুরস্কার</span>
          <strong>{match.totalPrize} TK</strong>
        </div>
        <div className="prize-divider"/>
        <div className="prize-box">
          <FaSkull size={12} color="var(--danger)"/>
          <span>প্রতি কিল</span>
          <strong>{match.perKillPrize} TK</strong>
        </div>
      </div>

      <div className="match-slots">
        <div className="slot-bar">
          <div className="slot-fill" style={{width: `${slotPercent}%`, background: isFull ? 'var(--danger)' : 'var(--purple)'}}/>
        </div>
        <span style={{fontSize:'12px', color:'var(--text-secondary)'}}>{slotUsed}/{match.maxSlots}</span>
      </div>

      <div className="match-actions">
        <button className="btn-room" onClick={e => { e.stopPropagation(); navigate(`/match/${match._id}`); }}>
          রুম ডিটেইলস 🔑
        </button>
        {isJoined
          ? <button className="btn-joined" disabled>যোগ দিয়েছেন ✅</button>
          : isFull
          ? <button className="btn-full" disabled>ফুল 🚫</button>
          : <button className="btn-join" onClick={e => { e.stopPropagation(); navigate(`/match/${match._id}`); }}>
              যোগ দিন 🎮
            </button>
        }
      </div>

      {match.status === 'running' && isJoined && (
        <div style={{marginTop:'8px', padding:'8px', background:'rgba(96,165,250,0.1)', borderRadius:'8px', fontSize:'12px', color:'#60a5fa', textAlign:'center'}}>
          📸 ম্যাচ শেষে screenshot জমা দিন
        </div>
      )}
    </div>
  );
}
