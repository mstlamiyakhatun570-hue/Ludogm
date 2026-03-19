import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';

export default function AdminMatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [resultForms, setResultForms] = useState({});

  const fetchMatch = () => {
    API.get(`/matches/${id}`).then(res => {
      setMatch(res.data);
      const forms = {};
      res.data.players.forEach(p => {
        const uid = (p.user?._id || p.user)?.toString();
        if (uid) {
          forms[uid] = { kills: p.kills || 0, position: p.position || 0, prize: p.prize || 0 };
        }
      });
      setResultForms(forms);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMatch(); }, [id]);

  const handleApprove = async (userId) => {
    setApproving(userId);
    try {
      await API.post(`/matches/${id}/players/${userId}/approve`, resultForms[userId]);
      toast.success('Result Approved! Prize added.');
      fetchMatch();
    } catch { toast.error('Error'); }
    finally { setApproving(null); }
  };

  const handleRefund = async (userId, name) => {
    const amount = prompt(`${name} কে কত টাকা refund দেবেন?`);
    if (!amount) return;
    try {
      await API.post(`/matches/${id}/players/${userId}/refund`, { amount: parseInt(amount) });
      toast.success('Refunded!');
    } catch { toast.error('Error'); }
  };

  if (loading) return <div className="page-loader"><div className="spinner"/></div>;
  if (!match) return null;

  return (
    <AdminLayout title={`Match #${match.matchNumber}`}>
      <div style={{marginBottom:'16px'}}>
        <button onClick={() => navigate('/admin/matches')} style={{display:'flex', alignItems:'center', gap:'6px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', color:'var(--text-primary)', cursor:'pointer', fontSize:'13px', marginBottom:'12px'}}>
          <FaArrowLeft size={12}/> Matches
        </button>
        <div style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'14px'}}>
          <h2 style={{fontFamily:'Rajdhani', fontSize:'20px', marginBottom:'8px'}}>{match.title}</h2>
          <div style={{display:'flex', flexWrap:'wrap', gap:'12px', fontSize:'13px', color:'var(--text-secondary)'}}>
            <span>Game: <strong style={{color:'var(--text-primary)'}}>{match.game}</strong></span>
            <span>Mode: <strong style={{color:'var(--text-primary)'}}>{match.gameMode}</strong></span>
            <span>Map: <strong style={{color:'var(--text-primary)'}}>{match.map}</strong></span>
            <span>Fee: <strong style={{color:'var(--accent)'}}>{match.entryFee}৳</strong></span>
            <span>Prize: <strong style={{color:'var(--accent2)'}}>{match.totalPrize}৳</strong></span>
            <span>Slots: <strong>{match.players.length}/{match.maxSlots}</strong></span>
            <span>Time: <strong>{format(new Date(match.matchTime), 'dd/MM/yyyy hh:mm a')}</strong></span>
          </div>
        </div>
      </div>

      <h3 style={{fontFamily:'Rajdhani', fontSize:'16px', fontWeight:700, marginBottom:'10px'}}>Players ({match.players.length})</h3>

      {match.players.length === 0 ? <div className="empty-state"><p>কোনো player নেই</p></div>
      : match.players.map(p => {
        const uid = (p.user?._id || p.user)?.toString();
        const name = p.user?.name || 'Unknown';
        const rf = resultForms[uid] || { kills: 0, position: 0, prize: 0 };

        return (
          <div key={uid} style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'14px', marginBottom:'10px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
              <div>
                <strong style={{fontSize:'15px'}}>{name}</strong>
                <p style={{fontSize:'12px', color:'var(--text-secondary)'}}>{p.user?.phone}</p>
              </div>
              <span style={{fontSize:'12px', fontWeight:700, color:
                p.resultStatus === 'approved' ? 'var(--accent2)' :
                p.resultStatus === 'submitted' ? 'var(--accent)' :
                p.resultStatus === 'rejected' ? 'var(--danger)' : 'var(--text-muted)'
              }}>
                {p.resultStatus === 'approved' ? '✅ Approved' :
                 p.resultStatus === 'submitted' ? '📸 Screenshot' :
                 p.resultStatus === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
              </span>
            </div>

            {p.resultScreenshot && (
              <a href={`${(process.env.REACT_APP_API_URL || '/api').replace('/api', '')}${p.resultScreenshot}`} target="_blank" rel="noreferrer"
                style={{display:'block', marginBottom:'8px', fontSize:'12px', color:'var(--purple-light)'}}>
                📷 Screenshot দেখুন
              </a>
            )}

            {p.resultStatus === 'submitted' && (
              <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                <div className="form-row">
                  <div><label className="form-label">Kills</label>
                    <input className="input-field" type="number" style={{padding:'6px 10px'}}
                      value={rf.kills} onChange={e => setResultForms(f => ({...f, [uid]: {...(f[uid]||{}), kills: parseInt(e.target.value)||0}}))}/>
                  </div>
                  <div><label className="form-label">Position</label>
                    <input className="input-field" type="number" style={{padding:'6px 10px'}}
                      value={rf.position} onChange={e => setResultForms(f => ({...f, [uid]: {...(f[uid]||{}), position: parseInt(e.target.value)||0}}))}/>
                  </div>
                </div>
                <div><label className="form-label">Prize (৳)</label>
                  <input className="input-field" type="number" style={{padding:'6px 10px'}}
                    value={rf.prize} onChange={e => setResultForms(f => ({...f, [uid]: {...(f[uid]||{}), prize: parseInt(e.target.value)||0}}))}/>
                </div>
                <div style={{display:'flex', gap:'8px'}}>
                  <button className="btn-success" style={{flex:1}} onClick={() => handleApprove(uid)} disabled={approving === uid}>
                    <FaCheck size={11}/> Approve & Add Prize
                  </button>
                  <button className="btn-danger" style={{flex:1}} onClick={() => handleRefund(uid, name)}>
                    Refund
                  </button>
                </div>
              </div>
            )}

            {p.resultStatus === 'approved' && (
              <div style={{fontSize:'13px', color:'var(--accent2)'}}>
                Kills: {p.kills} | Position: {p.position} | Prize: {p.prize}৳
              </div>
            )}

            {(p.resultStatus === 'pending' || !p.resultStatus) && (
              <button className="btn-danger" style={{fontSize:'12px'}} onClick={() => handleRefund(uid, name)}>
                Manual Refund
              </button>
            )}
          </div>
        );
      })}
    </AdminLayout>
  );
}
