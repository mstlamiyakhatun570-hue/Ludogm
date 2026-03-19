import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FaPlus, FaEdit, FaTrash, FaBan, FaEye } from 'react-icons/fa';

const STATUS_COLOR = { upcoming:'var(--accent)', running:'#60a5fa', completed:'var(--accent2)', cancelled:'var(--danger)' };

export default function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const navigate = useNavigate();

  const fetchMatches = () => {
    setLoading(true);
    API.get(`/matches?status=${filter}`).then(res => setMatches(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMatches(); }, [filter]);

  const handleDelete = async (id) => {
    if (!window.confirm('ম্যাচ ডিলিট করবেন? সব player কে refund দেওয়া হবে।')) return;
    try { await API.delete(`/matches/${id}`); toast.success('Deleted!'); fetchMatches(); }
    catch { toast.error('Error'); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('ম্যাচ বাতিল করবেন? সব player কে refund দেওয়া হবে।')) return;
    try { await API.post(`/matches/${id}/cancel`); toast.success('Cancelled & Refunded!'); fetchMatches(); }
    catch { toast.error('Error'); }
  };

  const handleStatusChange = async (id, status) => {
    try { await API.put(`/matches/${id}`, { status }); toast.success('Status updated!'); fetchMatches(); }
    catch { toast.error('Error'); }
  };

  return (
    <AdminLayout title="Matches">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px', flexWrap:'wrap', gap:'10px'}}>
        <div style={{display:'flex', gap:'6px', flexWrap:'wrap'}}>
          {['upcoming','running','completed','cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding:'5px 12px', borderRadius:20, border:'none', cursor:'pointer',
              background: filter === s ? 'var(--purple)' : 'var(--bg-card)',
              color: filter === s ? 'white' : 'var(--text-secondary)',
              fontSize:'12px', fontWeight:600, fontFamily:'Hind Siliguri, sans-serif'
            }}>{s}</button>
          ))}
        </div>
        <button className="btn-primary" style={{width:'auto', padding:'8px 16px'}} onClick={() => navigate('/admin/matches/new')}>
          <FaPlus size={12}/> নতুন Match
        </button>
      </div>

      {loading ? <div className="page-loader"><div className="spinner"/></div>
      : matches.length === 0 ? <div className="empty-state"><p>কোনো ম্যাচ নেই</p></div>
      : matches.map(m => (
        <div key={m._id} className="request-card">
          <div className="request-card-header">
            <div>
              <span style={{fontSize:'10px', background:'var(--purple-glow)', color:'var(--purple-light)', padding:'2px 6px', borderRadius:4, fontWeight:600}}>{m.game}</span>
              <h3 style={{fontFamily:'Rajdhani', fontSize:'16px', fontWeight:700, margin:'4px 0'}}>#{m.matchNumber} {m.title}</h3>
              <span style={{fontSize:'12px', color:'var(--text-secondary)'}}>{format(new Date(m.matchTime), 'dd/MM/yyyy hh:mm a')}</span>
            </div>
            <span style={{fontSize:'12px', fontWeight:700, color: STATUS_COLOR[m.status]}}>{m.status}</span>
          </div>

          <div style={{display:'flex', gap:'12px', fontSize:'12px', marginBottom:'10px', flexWrap:'wrap'}}>
            <span>ফি: <strong>{m.entryFee}৳</strong></span>
            <span>Prize: <strong>{m.totalPrize}৳</strong></span>
            <span>Slots: <strong>{m.players?.length}/{m.maxSlots}</strong></span>
            <span>Map: <strong>{m.map}</strong></span>
          </div>

          {/* Status change */}
          {m.status !== 'cancelled' && m.status !== 'completed' && (
            <div style={{marginBottom:'8px'}}>
              <select className="input-field" style={{padding:'6px 10px', fontSize:'12px'}}
                value={m.status} onChange={e => handleStatusChange(m._id, e.target.value)}>
                <option value="upcoming">upcoming</option>
                <option value="running">running</option>
                <option value="completed">completed</option>
              </select>
            </div>
          )}

          <div className="admin-actions">
            <button className="btn-secondary" style={{flex:1, fontSize:'12px', padding:'7px'}} onClick={() => navigate(`/admin/matches/${m._id}`)}>
              <FaEye size={11}/> Details
            </button>
            <button className="btn-secondary" style={{flex:1, fontSize:'12px', padding:'7px'}} onClick={() => navigate(`/admin/matches/${m._id}/edit`)}>
              <FaEdit size={11}/> Edit
            </button>
            {m.status !== 'cancelled' && m.status !== 'completed' && (
              <button className="btn-danger" style={{flex:1, fontSize:'12px'}} onClick={() => handleCancel(m._id)}>
                <FaBan size={11}/> Cancel
              </button>
            )}
            <button className="btn-danger" style={{flex:1, fontSize:'12px'}} onClick={() => handleDelete(m._id)}>
              <FaTrash size={11}/> Delete
            </button>
          </div>
        </div>
      ))}
    </AdminLayout>
  );
}
