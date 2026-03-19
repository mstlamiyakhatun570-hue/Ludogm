import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Navbar from '../components/Navbar';
import CountdownTimer from '../components/CountdownTimer';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaMap, FaUsers, FaTrophy, FaSkull, FaLock, FaCamera } from 'react-icons/fa';
import { format } from 'date-fns';
import './MatchDetail.css';

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchMatch = () => {
    API.get(`/matches/${id}`).then(res => setMatch(res.data)).catch(() => toast.error('ম্যাচ পাওয়া যায়নি')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMatch(); }, [id]);

  const isJoined = match?.players?.some(p => {
    const pid = p.user?._id || p.user;
    return pid?.toString() === user?._id?.toString();
  });
  const myPlayer = match?.players?.find(p => {
    const pid = p.user?._id || p.user;
    return pid?.toString() === user?._id?.toString();
  });
  const isFull = match?.players?.length >= match?.maxSlots;

  const handleJoin = async () => {
    setJoining(true);
    try {
      await API.post(`/matches/${id}/join`);
      toast.success('সফলভাবে ম্যাচে যোগ দিয়েছেন! 🎮');
      refreshUser();
      fetchMatch();
      setShowConfirm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'যোগ দিতে ব্যর্থ হয়েছে');
    } finally {
      setJoining(false);
    }
  };

  const handleSubmitResult = async () => {
    if (!screenshot) return toast.error('Screenshot সিলেক্ট করুন');
    setUploading(true);
    const formData = new FormData();
    formData.append('screenshot', screenshot);
    try {
      await API.post(`/matches/${id}/result`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Screenshot জমা দেওয়া হয়েছে!');
      fetchMatch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'আপলোড ব্যর্থ হয়েছে');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner"/></div>;
  if (!match) return null;

  const statusMap = { upcoming:'আসছে', running:'চলছে', completed:'শেষ', cancelled:'বাতিল' };

  return (
    <div className="pb-nav animate-fade">
      <TopBar/>
      <div className="match-detail-page">
        {/* Header */}
        <div className="match-detail-header">
          <button className="back-btn" onClick={() => navigate(-1)}><FaArrowLeft size={14}/></button>
          <div className="match-detail-title">
            <span className="match-game-badge">{match.game}</span>
            <h2>{match.title}</h2>
            <span style={{fontSize:'13px', color:'var(--text-secondary)'}}>
              {format(new Date(match.matchTime), 'dd-MM-yyyy, hh:mm a')}
            </span>
          </div>
          <span className={`match-status-badge status-${match.status}`}>#{match.matchNumber}</span>
        </div>

        {/* Countdown */}
        {match.status === 'upcoming' && (
          <div className="countdown-banner">
            <span>ম্যাচ শুরু হতে বাকি:</span>
            <CountdownTimer matchTime={match.matchTime} status={match.status}/>
          </div>
        )}
        {match.status === 'running' && (
          <div className="countdown-banner running">🔴 ম্যাচ এখন চলছে!</div>
        )}

        {/* Tags */}
        <div className="match-tags" style={{padding:'0 16px', marginBottom:'12px'}}>
          <span className="match-tag blue"><FaMap size={10}/> {match.map}</span>
          <span className="match-tag orange"><FaUsers size={10}/> {match.entryType}</span>
          <span className="match-tag red">ফি: {match.entryFee}৳</span>
        </div>

        {/* Prize boxes */}
        <div className="prize-grid">
          <div className="prize-card">
            <FaTrophy size={20} color="var(--accent)"/>
            <span>মোট পুরস্কার</span>
            <strong>{match.totalPrize} TK</strong>
          </div>
          <div className="prize-card">
            <FaSkull size={20} color="var(--danger)"/>
            <span>প্রতি কিল</span>
            <strong>{match.perKillPrize} TK</strong>
          </div>
        </div>

        {/* Prize note */}
        {match.prizeNote && (
          <div className="info-box yellow" style={{margin:'0 16px 12px'}}>
            📋 {match.prizeNote}
          </div>
        )}

        {/* Slots */}
        <div className="slot-info">
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'6px'}}>
            <span style={{fontSize:'13px', color:'var(--text-secondary)'}}>স্লট</span>
            <span style={{fontSize:'13px', fontWeight:700}}>{match.players.length}/{match.maxSlots}</span>
          </div>
          <div className="slot-bar" style={{height:'6px'}}>
            <div className="slot-fill" style={{
              width:`${(match.players.length/match.maxSlots)*100}%`,
              background: isFull ? 'var(--danger)' : 'var(--purple)',
              height:'6px'
            }}/>
          </div>
        </div>

        {/* Room Details (only for joined players) */}
        {isJoined && (match.roomId || match.roomPassword || match.roomNote) && (
          <div className="room-details-card">
            <h3><FaLock size={13}/> রুম ডিটেইলস</h3>
            {match.roomId && <div className="room-row"><span>Room ID:</span><strong>{match.roomId}</strong></div>}
            {match.roomPassword && <div className="room-row"><span>Password:</span><strong>{match.roomPassword}</strong></div>}
            {match.roomNote && <div className="room-row"><span>নোট:</span><span style={{color:'var(--accent)'}}>{match.roomNote}</span></div>}
          </div>
        )}
        {!isJoined && (match.roomId || match.roomPassword) && (
          <div className="info-box purple" style={{margin:'0 16px 12px'}}>
            🔒 ম্যাচে যোগ দিলে রুম ডিটেইলস দেখা যাবে
          </div>
        )}

        {/* Note for result submission */}
        {isJoined && match.status === 'running' && (
          <div className="info-box blue" style={{margin:'0 16px 12px'}}>
            📸 ম্যাচ শেষে আপনার খেলার result এর screenshot Admin কে ইনবক্সে দিন
          </div>
        )}

        {/* Screenshot submit */}
        {isJoined && (match.status === 'running' || match.status === 'completed') && myPlayer?.resultStatus === 'pending' && (
          <div className="screenshot-section">
            <h3><FaCamera size={13}/> Result Screenshot জমা দিন</h3>
            <label className="screenshot-upload">
              {screenshot ? <span>📁 {screenshot.name}</span> : <span>📷 Screenshot বেছে নিন</span>}
              <input type="file" accept="image/*" onChange={e => setScreenshot(e.target.files[0])} style={{display:'none'}}/>
            </label>
            <button className="btn-primary" onClick={handleSubmitResult} disabled={uploading || !screenshot}>
              {uploading ? '⏳ আপলোড হচ্ছে...' : '📤 জমা দিন'}
            </button>
          </div>
        )}

        {myPlayer?.resultStatus === 'submitted' && (
          <div className="info-box yellow" style={{margin:'0 16px 12px'}}>⏳ Screenshot জমা দেওয়া হয়েছে। Admin রিভিউ করছেন।</div>
        )}
        {myPlayer?.resultStatus === 'approved' && (
          <div className="info-box green" style={{margin:'0 16px 12px'}}>
            ✅ Result অনুমোদিত! পুরস্কার: {myPlayer.prize} TK, কিল: {myPlayer.kills}, পজিশন: {myPlayer.position}
          </div>
        )}

        {/* Join button */}
        {!isJoined && match.status === 'upcoming' && !isFull && (
          <div style={{padding:'0 16px'}}>
            <button className="btn-primary pulse-glow" onClick={() => setShowConfirm(true)}>
              🎮 যোগ দিন (ফি: {match.entryFee}৳)
            </button>
          </div>
        )}
        {isFull && !isJoined && (
          <div style={{padding:'0 16px'}}>
            <button className="btn-primary" disabled style={{background:'var(--bg-card)', color:'var(--text-muted)'}}>
              🚫 ম্যাচ ফুল হয়ে গেছে
            </button>
          </div>
        )}
      </div>

      {/* Confirm Join Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle"/>
            <h3 style={{marginBottom:'12px', fontFamily:'Rajdhani', fontSize:'20px'}}>ম্যাচে যোগ দিন?</h3>
            <p style={{color:'var(--text-secondary)', marginBottom:'16px', fontSize:'14px'}}>
              আপনার Gaming Balance থেকে <strong style={{color:'var(--accent)'}}>{match.entryFee} টাকা</strong> কাটা হবে।
            </p>
            <div style={{display:'flex', gap:'10px'}}>
              <button className="btn-secondary" style={{flex:1}} onClick={() => setShowConfirm(false)}>বাতিল</button>
              <button className="btn-primary" style={{flex:1}} onClick={handleJoin} disabled={joining}>
                {joining ? '⏳...' : '✅ নিশ্চিত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar/>
    </div>
  );
}
