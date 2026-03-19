import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FaEye, FaBan, FaCheck } from 'react-icons/fa';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/admin/users').then(res => setUsers(res.data)).finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (id, current) => {
    try {
      await API.put(`/admin/users/${id}/status`, { isActive: !current });
      setUsers(u => u.map(x => x._id === id ? {...x, isActive: !current} : x));
      toast.success(current ? 'Suspended!' : 'Activated!');
    } catch { toast.error('Error'); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.promoCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Users Management">
      <input className="input-field" placeholder="🔍 নাম, ফোন বা প্রোমো কোড দিয়ে খুঁজুন..."
        value={search} onChange={e => setSearch(e.target.value)} style={{marginBottom:'14px'}}/>

      <p style={{fontSize:'12px', color:'var(--text-secondary)', marginBottom:'10px'}}>মোট {filtered.length} জন user</p>

      {loading ? <div className="page-loader"><div className="spinner"/></div>
      : filtered.map(u => (
        <div key={u._id} style={{background:'var(--bg-card)', border:`1px solid ${u.isActive ? 'var(--border)' : 'rgba(239,68,68,0.3)'}`, borderRadius:10, padding:'14px', marginBottom:'8px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px'}}>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                <strong style={{fontSize:'15px'}}>{u.name}</strong>
                {!u.isActive && <span style={{fontSize:'10px', background:'rgba(239,68,68,0.2)', color:'var(--danger)', padding:'1px 6px', borderRadius:4}}>Suspended</span>}
              </div>
              <p style={{fontSize:'12px', color:'var(--text-secondary)'}}>{u.phone} • {u.promoCode}</p>
              <p style={{fontSize:'11px', color:'var(--text-muted)'}}>Joined: {format(new Date(u.createdAt), 'dd/MM/yyyy')}</p>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:'13px', color:'var(--accent2)'}}>G: ৳{u.gamingBalance}</div>
              <div style={{fontSize:'13px', color:'var(--accent)'}}>W: ৳{u.winningBalance}</div>
            </div>
          </div>
          <div style={{display:'flex', gap:'8px'}}>
            <button className="btn-secondary" style={{flex:1, fontSize:'12px', padding:'7px'}} onClick={() => navigate(`/admin/users/${u._id}`)}>
              <FaEye size={11}/> Details
            </button>
            <button className={u.isActive ? 'btn-danger' : 'btn-success'} style={{flex:1, fontSize:'12px'}} onClick={() => toggleStatus(u._id, u.isActive)}>
              {u.isActive ? <><FaBan size={11}/> Suspend</> : <><FaCheck size={11}/> Activate</>}
            </button>
          </div>
        </div>
      ))}
    </AdminLayout>
  );
}
