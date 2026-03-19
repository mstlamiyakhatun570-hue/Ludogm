import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import { FaArrowLeft } from 'react-icons/fa';
import { format } from 'date-fns';

const TYPE_LABELS = {
  addmoney: { label: 'Add Money', color: 'var(--accent2)', sign: '+' },
  withdraw: { label: 'Withdraw', color: 'var(--danger)', sign: '-' },
  match_fee: { label: 'Match Fee', color: 'var(--danger)', sign: '-' },
  prize: { label: 'Prize', color: 'var(--accent2)', sign: '+' },
  refund: { label: 'Refund', color: '#60a5fa', sign: '+' },
  admin_adjust: { label: 'Admin Adjust', color: 'var(--accent)', sign: '~' },
};

const STATUS_LABELS = { pending: '⏳ Pending', approved: '✅ Approved', rejected: '❌ Rejected' };

export default function Transactions() {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = filter ? `?type=${filter}` : '';
    API.get(`/wallet/transactions${params}`).then(res => setTxs(res.data)).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="pb-nav animate-fade">
      <TopBar/>
      <div style={{padding:'16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px'}}>
          <button onClick={() => navigate(-1)} style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'8px', padding:'8px 10px', color:'white', cursor:'pointer'}}>
            <FaArrowLeft size={14}/>
          </button>
          <h2 style={{fontFamily:'Rajdhani', fontSize:'20px', fontWeight:700}}>Transactions</h2>
        </div>

        <div style={{display:'flex', gap:'8px', marginBottom:'14px', overflowX:'auto', paddingBottom:'4px'}}>
          {[['', 'সব'], ['addmoney', 'Add Money'], ['withdraw', 'Withdraw'], ['prize', 'Prize'], ['match_fee', 'Match Fee'], ['refund', 'Refund']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding:'6px 12px', borderRadius:'20px', border:'none', cursor:'pointer', whiteSpace:'nowrap',
              background: filter === val ? 'var(--purple)' : 'var(--bg-card)',
              color: filter === val ? 'white' : 'var(--text-secondary)',
              fontSize:'12px', fontWeight:600, fontFamily:'Hind Siliguri, sans-serif'
            }}>{label}</button>
          ))}
        </div>

        {loading ? <div className="page-loader"><div className="spinner"/></div>
        : txs.length === 0 ? <div className="empty-state"><p>কোনো লেনদেন নেই</p></div>
        : txs.map(tx => {
          const t = TYPE_LABELS[tx.type] || { label: tx.type, color: 'white', sign: '' };
          return (
            <div key={tx._id} style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'14px', marginBottom:'10px'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                  <span style={{fontSize:'14px', fontWeight:600}}>{t.label}</span>
                  {tx.paymentMethod && <span style={{fontSize:'11px', color:'var(--text-muted)', marginLeft:'6px'}}>{tx.paymentMethod.toUpperCase()}</span>}
                  {tx.transactionId && <p style={{fontSize:'11px', color:'var(--text-muted)', marginTop:'2px'}}>TxID: {tx.transactionId}</p>}
                  {tx.note && <p style={{fontSize:'12px', color:'var(--text-secondary)', marginTop:'2px'}}>{tx.note}</p>}
                  <p style={{fontSize:'11px', color:'var(--text-muted)', marginTop:'4px'}}>{format(new Date(tx.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'18px', fontWeight:700, fontFamily:'Rajdhani', color: t.color}}>
                    {t.sign}{tx.amount}৳
                  </div>
                  <div style={{fontSize:'11px', marginTop:'2px'}}>{STATUS_LABELS[tx.status]}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Navbar/>
    </div>
  );
}
