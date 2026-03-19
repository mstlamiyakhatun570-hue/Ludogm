import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FaCheck, FaTimes } from 'react-icons/fa';

export default function AdminWithdraw() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [processing, setProcessing] = useState(null);

  const fetch = () => {
    setLoading(true);
    API.get(`/wallet/admin/withdraw?status=${filter}`).then(res => setRequests(res.data)).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [filter]);

  const approve = async (id) => {
    setProcessing(id);
    try { await API.post(`/wallet/admin/withdraw/${id}/approve`); toast.success('Approved! Money sent.'); fetch(); }
    catch { toast.error('Error'); } finally { setProcessing(null); }
  };

  const reject = async (id) => {
    const note = prompt('Rejection কারণ:') || 'Admin rejected';
    setProcessing(id);
    try { await API.post(`/wallet/admin/withdraw/${id}/reject`, { note }); toast.success('Rejected & Refunded'); fetch(); }
    catch { toast.error('Error'); } finally { setProcessing(null); }
  };

  const METHOD_COLOR = { bkash: '#e2136e', nagad: '#f7941d', rocket: '#8b1fa9' };

  return (
    <AdminLayout title="Withdraw Requests">
      <div style={{display:'flex', gap:'8px', marginBottom:'14px'}}>
        {['pending','approved','rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding:'6px 14px', borderRadius:20, border:'none', cursor:'pointer',
            background: filter === s ? 'var(--purple)' : 'var(--bg-card)',
            color: filter === s ? 'white' : 'var(--text-secondary)',
            fontSize:'12px', fontWeight:600, fontFamily:'Hind Siliguri, sans-serif'
          }}>{s}</button>
        ))}
      </div>
      {loading ? <div className="page-loader"><div className="spinner"/></div>
      : requests.length === 0 ? <div className="empty-state"><p>কোনো রিকোয়েস্ট নেই</p></div>
      : requests.map(r => (
        <div key={r._id} className="request-card">
          <div className="request-card-header">
            <div>
              <span style={{fontSize:'13px', fontWeight:700, color: METHOD_COLOR[r.paymentMethod] || 'white'}}>{r.paymentMethod?.toUpperCase()}</span>
              <h3 style={{fontFamily:'Rajdhani', fontSize:'20px', fontWeight:700, color:'var(--danger)', margin:'2px 0'}}>-৳{r.amount}</h3>
              <p style={{fontSize:'12px', color:'var(--text-secondary)'}}>{r.user?.name} ({r.user?.phone})</p>
              <p style={{fontSize:'13px', marginTop:'2px'}}>Send to: <strong style={{color:'var(--accent)'}}>{r.accountNumber}</strong></p>
            </div>
            <div style={{textAlign:'right'}}>
              <span style={{fontSize:'11px', color: r.status==='approved'?'var(--accent2)':r.status==='rejected'?'var(--danger)':'var(--accent)'}}>{r.status}</span>
              <p style={{fontSize:'11px', color:'var(--text-muted)', marginTop:'2px'}}>{format(new Date(r.createdAt), 'dd/MM/yy HH:mm')}</p>
            </div>
          </div>
          {r.status === 'pending' && (
            <div style={{display:'flex', gap:'8px'}}>
              <button className="btn-success" style={{flex:1}} onClick={() => approve(r._id)} disabled={processing===r._id}><FaCheck size={11}/> Approve</button>
              <button className="btn-danger" style={{flex:1}} onClick={() => reject(r._id)} disabled={processing===r._id}><FaTimes size={11}/> Reject & Refund</button>
            </div>
          )}
        </div>
      ))}
    </AdminLayout>
  );
}
