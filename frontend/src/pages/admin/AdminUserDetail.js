import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gaming, setGaming] = useState('');
  const [winning, setWinning] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get(`/admin/users/${id}`)
      .then(res => {
        setUser(res.data);
        setGaming(res.data.gamingBalance);
        setWinning(res.data.winningBalance);
      })
      .catch(() => toast.error('User not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const saveBalance = async () => {
    setSaving(true);
    try {
      const res = await API.put(`/admin/users/${id}/balance`, {
        gamingBalance: parseFloat(gaming),
        winningBalance: parseFloat(winning),
        note
      });
      setUser(res.data.user);
      toast.success('Balance updated!');
      setNote('');
    } catch { toast.error('Error'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="page-loader"><div className="spinner"/></div>;
  if (!user) return null;

  return (
    <AdminLayout title="User Details">
      <button onClick={() => navigate('/admin/users')} style={{display:'flex', alignItems:'center', gap:'6px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', color:'var(--text-primary)', cursor:'pointer', fontSize:'13px', marginBottom:'16px'}}>
        <FaArrowLeft size={12}/> Users
      </button>

      {/* User info */}
      <div style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'16px', marginBottom:'14px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px'}}>
          <div style={{width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg, var(--purple), var(--purple-dark))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:700}}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{fontFamily:'Rajdhani', fontSize:'18px', fontWeight:700}}>{user.name}</h3>
            <p style={{fontSize:'13px', color:'var(--text-secondary)'}}>{user.phone}</p>
            <p style={{fontSize:'12px', color:'var(--text-muted)'}}>Promo: {user.promoCode} • Joined: {format(new Date(user.createdAt), 'dd/MM/yyyy')}</p>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'8px'}}>
          {[
            { label: 'Gaming', value: `৳${user.gamingBalance}`, color: 'var(--purple-light)' },
            { label: 'Winning', value: `৳${user.winningBalance}`, color: 'var(--accent2)' },
            { label: 'Total Win', value: `৳${user.totalWin}`, color: 'var(--accent)' },
            { label: 'Total Kills', value: user.totalKills, color: 'var(--danger)' },
          ].map((s, i) => (
            <div key={i} style={{background:'var(--bg-card2)', borderRadius:8, padding:'10px', textAlign:'center'}}>
              <div style={{fontSize:'11px', color:'var(--text-secondary)'}}>{s.label}</div>
              <div style={{fontFamily:'Rajdhani', fontSize:'16px', fontWeight:700, color: s.color}}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Balance Edit */}
      <div style={{background:'var(--bg-card)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:10, padding:'16px', marginBottom:'14px'}}>
        <h3 style={{fontFamily:'Rajdhani', fontSize:'16px', fontWeight:700, marginBottom:'12px', color:'var(--purple-light)'}}>⚙️ Balance Edit</h3>
        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
          <div>
            <label style={{fontSize:'12px', color:'var(--text-secondary)', display:'block', marginBottom:'4px'}}>Gaming Balance (৳)</label>
            <input className="input-field" type="number" value={gaming} onChange={e => setGaming(e.target.value)}/>
          </div>
          <div>
            <label style={{fontSize:'12px', color:'var(--text-secondary)', display:'block', marginBottom:'4px'}}>Winning Balance (৳)</label>
            <input className="input-field" type="number" value={winning} onChange={e => setWinning(e.target.value)}/>
          </div>
          <div>
            <label style={{fontSize:'12px', color:'var(--text-secondary)', display:'block', marginBottom:'4px'}}>Note (optional)</label>
            <input className="input-field" placeholder="কারণ লিখুন..." value={note} onChange={e => setNote(e.target.value)}/>
          </div>
          <button className="btn-primary" onClick={saveBalance} disabled={saving}>
            <FaSave size={12}/> {saving ? 'Saving...' : 'Balance Save করুন'}
          </button>
        </div>
      </div>

      {/* Transaction History */}
      {txs.length > 0 && (
        <div style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'16px'}}>
          <h3 style={{fontFamily:'Rajdhani', fontSize:'16px', fontWeight:700, marginBottom:'12px'}}>📋 Transaction History</h3>
          {txs.slice(0,10).map(tx => (
            <div key={tx._id} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border-light)', fontSize:'13px'}}>
              <div>
                <span style={{fontWeight:600}}>{tx.type}</span>
                {tx.note && <p style={{fontSize:'11px', color:'var(--text-muted)'}}>{tx.note}</p>}
              </div>
              <span style={{fontFamily:'Rajdhani', fontWeight:700, color: ['prize','refund','addmoney'].includes(tx.type) ? 'var(--accent2)' : 'var(--danger)'}}>
                {tx.amount}৳ <span style={{fontSize:'10px', color: tx.status==='approved'?'var(--accent2)':'var(--accent)'}}>{tx.status}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
