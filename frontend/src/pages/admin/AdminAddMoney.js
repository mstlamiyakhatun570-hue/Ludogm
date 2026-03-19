import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FaCheck, FaTimes } from 'react-icons/fa';

export default function AdminAddMoney() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [processing, setProcessing] = useState(null);

  const fetch = () => {
    setLoading(true);
    API.get(`/wallet/admin/addmoney?status=${filter}`).then(res => setRequests(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [filter]);

  const approve = async (id) => {
    setProcessing(id);
    try { await API.post(`/wallet/admin/addmoney/${id}/approve`); toast.success('Approved!'); fetch(); }
    catch { toast.error('Error'); } finally { setProcessing(null); }
  };

  const reject = async (id) => {
    const note = prompt('Rejection কারণ (optional):') || 'Admin rejected';
    setProcessing(id);
    try { await API.post(`/wallet/admin/addmoney/${id}/reject`, { note }); toast.success('Rejected'); fetch(); }
    catch { toast.error('Error'); } finally { setProcessing(null); }
  };

  const METHOD_COLOR = { bkash: '#e2136e', nagad: '#f7941d', rocket: '#8b1fa9' };

  return (
    <AdminLayout title="Add Money Requests">
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
              <span style={{fontSize:'13px', fontWeight:700, color: METHOD_COLOR[r.paymentMethod] || 'white'}}>
                {r.paymentMethod?.toUpperCase()}
              </span>
              <h3 style={{fontFamily:'Rajdhani', fontSize:'20px', fontWeight:700, color:'var(--accent2)', margin:'2px 0'}}>
                ৳{r.amount}
              </h3>
              <p style={{fontSize:'12px', color:'var(--text-secondary)'}}>
                {r.user?.name} ({r.user?.phone})
              </p>
            </div>
            <div style={{textAlign:'right'}}>
              <span style={{fontSize:'11px', color:
                r.status === 'approved' ? 'var(--accent2)' :
                r.status === 'rejected' ? 'var(--danger)' : 'var(--accent)'
              }}>{r.status}</span>
              <p style={{fontSize:'11px', color:'var(--text-muted)', marginTop:'2px'}}>
                {format(new Date(r.createdAt), 'dd/MM/yy HH:mm')}
              </p>
            </div>
          </div>

          <div style={{fontSize:'13px', marginBottom:'10px', display:'flex', flexDirection:'column', gap:'3px'}}>
            <span>Tx ID: <strong style={{color:'var(--accent)', fontFamily:'monospace'}}>{r.transactionId}</strong></span>
            {r.accountNumber && <span>From: <strong>{r.accountNumber}</strong></span>}
          </div>

          {r.status === 'pending' && (
            <div style={{display:'flex', gap:'8px'}}>
              <button className="btn-success" style={{flex:1}} onClick={() => approve(r._id)} disabled={processing === r._id}>
                <FaCheck size={11}/> Approve
              </button>
              <button className="btn-danger" style={{flex:1}} onClick={() => reject(r._id)} disabled={processing === r._id}>
                <FaTimes size={11}/> Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </AdminLayout>
  );
}
