import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FaTrash, FaBell, FaPlus, FaEdit, FaCheck, FaTimes, FaMobileAlt } from 'react-icons/fa';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', message: '', type: 'global', targetUser: '' });
  const [users, setUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', message: '' });
  const [fcmStats, setFcmStats] = useState({ total: 0, withToken: 0 });

  const fetch = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetch();
    API.get('/admin/users').then(res => {
      setUsers(res.data);
      const withToken = res.data.filter(u => u.fcmToken && u.fcmToken.length > 0).length;
      setFcmStats({ total: res.data.length, withToken });
    }).catch(() => {});
  }, []);

  const send = async () => {
    if (!form.title || !form.message) return toast.error('Title ও Message দিন');
    if (form.type === 'personal' && !form.targetUser) return toast.error('User বেছে নিন');
    setSending(true);
    try {
      await API.post('/notifications', form);
      toast.success('🔔 Notification পাঠানো হয়েছে!');
      setForm({ title: '', message: '', type: 'global', targetUser: '' });
      fetch();
    } catch { toast.error('Error'); }
    finally { setSending(false); }
  };

  const startEdit = (n) => {
    setEditingId(n._id);
    setEditForm({ title: n.title, message: n.message });
  };

  const saveEdit = async (id) => {
    try {
      await API.put(`/notifications/${id}`, editForm);
      toast.success('আপডেট হয়েছে!');
      setEditingId(null);
      fetch();
    } catch { toast.error('Error'); }
  };

  const deleteNotif = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      toast.success('Deleted');
      fetch();
    } catch { toast.error('Error'); }
  };

  return (
    <AdminLayout title="Push Notifications">
      {/* FCM Stats */}
      <div style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'12px', marginBottom:'14px', display:'flex', gap:'12px', alignItems:'center'}}>
        <FaMobileAlt size={20} color="var(--purple-light)"/>
        <div style={{flex:1}}>
          <p style={{fontSize:'13px', fontWeight:700, marginBottom:'2px'}}>Notification Status</p>
          <p style={{fontSize:'12px', color:'var(--text-secondary)'}}>
            মোট {fcmStats.total} জন user —
            <span style={{color: fcmStats.withToken > 0 ? 'var(--accent2)' : 'var(--danger)', marginLeft:'4px', fontWeight:700}}>
              {fcmStats.withToken} জন notification চালু করেছে
            </span>
          </p>
          {fcmStats.withToken === 0 && (
            <p style={{fontSize:'11px', color:'var(--accent)', marginTop:'4px'}}>
              ⚠️ কোনো user এখনো notification allow করেনি। User রা app এ ঢুকলে automatically permission চাইবে।
            </p>
          )}
        </div>
      </div>

      {/* Send form */}
      <div style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'16px', marginBottom:'16px'}}>
        <h3 style={{fontFamily:'Rajdhani', fontSize:'16px', fontWeight:700, marginBottom:'12px'}}>
          <FaBell size={14} color="var(--accent)"/> নতুন Notification পাঠান
        </h3>
        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
          <input className="input-field" placeholder="Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})}/>
          <textarea className="input-field" rows={3} placeholder="Message *" value={form.message} onChange={e => setForm({...form, message: e.target.value})}/>
          <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value, targetUser: ''})}>
            <option value="global">🌍 সবাইকে পাঠান ({fcmStats.withToken} জন পাবে)</option>
            <option value="personal">👤 নির্দিষ্ট User কে</option>
          </select>
          {form.type === 'personal' && (
            <select className="input-field" value={form.targetUser} onChange={e => setForm({...form, targetUser: e.target.value})}>
              <option value="">User বেছে নিন</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.phone}) {u.fcmToken ? '🔔' : '🔕'}</option>)}
            </select>
          )}
          <button className="btn-primary" onClick={send} disabled={sending}>
            {sending ? '⏳ পাঠানো হচ্ছে...' : <><FaPlus size={12}/> Notification পাঠান</>}
          </button>
        </div>
      </div>

      {/* History */}
      <h3 style={{fontFamily:'Rajdhani', fontSize:'16px', fontWeight:700, marginBottom:'10px'}}>
        History ({notifications.length})
      </h3>

      {loading ? <div className="page-loader"><div className="spinner"/></div>
      : notifications.length === 0 ? <div className="empty-state"><p>কোনো notification নেই</p></div>
      : notifications.map(n => (
        <div key={n._id} style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'12px', marginBottom:'8px'}}>
          {editingId === n._id ? (
            // Edit mode
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              <input className="input-field" style={{padding:'7px 10px'}} value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}/>
              <textarea className="input-field" rows={2} value={editForm.message} onChange={e => setEditForm({...editForm, message: e.target.value})}/>
              <div style={{display:'flex', gap:'8px'}}>
                <button className="btn-success" style={{flex:1}} onClick={() => saveEdit(n._id)}><FaCheck size={11}/> Save</button>
                <button className="btn-danger" style={{flex:1}} onClick={() => setEditingId(null)}><FaTimes size={11}/> Cancel</button>
              </div>
            </div>
          ) : (
            // View mode
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'10px'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px'}}>
                  <strong style={{fontSize:'14px', fontFamily:'Rajdhani'}}>{n.title}</strong>
                  <span style={{fontSize:'10px', background: n.type==='global'?'rgba(124,58,237,0.2)':'rgba(16,185,129,0.2)', color: n.type==='global'?'var(--purple-light)':'var(--accent2)', padding:'1px 6px', borderRadius:4}}>{n.type}</span>
                </div>
                <p style={{fontSize:'12px', color:'var(--text-secondary)', lineHeight:1.4}}>{n.message}</p>
                <p style={{fontSize:'11px', color:'var(--text-muted)', marginTop:'4px'}}>{format(new Date(n.createdAt), 'dd/MM/yyyy HH:mm')}</p>
              </div>
              <div style={{display:'flex', gap:'6px', flexShrink:0}}>
                <button onClick={() => startEdit(n)} style={{background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:6, padding:'6px 8px', color:'var(--purple-light)', cursor:'pointer'}}>
                  <FaEdit size={11}/>
                </button>
                <button className="btn-danger" style={{padding:'6px 8px'}} onClick={() => deleteNotif(n._id)}>
                  <FaTrash size={11}/>
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </AdminLayout>
  );
}
