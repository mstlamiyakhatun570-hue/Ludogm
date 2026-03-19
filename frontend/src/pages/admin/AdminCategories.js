import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaCheck, FaTimes } from 'react-icons/fa';

const GAMES = ['FreeFire', 'PUBG', 'COD', 'অন্যান্য'];

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // null = new, object = edit
  const [form, setForm] = useState({ name: '', game: 'FreeFire', order: 0 });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    API.get('/categories/admin/all')
      .then(res => setCategories(res.data))
      .catch(() => toast.error('লোড হয়নি'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const getImgUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${(process.env.REACT_APP_API_URL || '/api').replace('/api', '')}${url}`;
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', game: 'FreeFire', order: categories.length });
    setImageFile(null);
    setImagePreview('');
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, game: cat.game, order: cat.order });
    setImageFile(null);
    setImagePreview(cat.image ? getImgUrl(cat.image) : '');
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('নাম দিন');
    if (!form.game.trim()) return toast.error('Game সিলেক্ট করুন');
    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', form.name.trim());
      data.append('game', form.game.trim());
      data.append('order', form.order);
      if (imageFile) data.append('image', imageFile);

      if (editing) {
        await API.put(`/categories/${editing._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('আপডেট হয়েছে!');
      } else {
        await API.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category তৈরি হয়েছে!');
      }
      setShowForm(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally { setSaving(false); }
  };

  const toggleActive = async (cat) => {
    try {
      const data = new FormData();
      data.append('isActive', !cat.isActive);
      await API.put(`/categories/${cat._id}`, data);
      fetch();
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('এই category delete করবেন? এই category র ম্যাচগুলো প্রভাবিত হবে না।')) return;
    try {
      await API.delete(`/categories/${id}`);
      toast.success('Deleted!');
      fetch();
    } catch { toast.error('Error'); }
  };

  const seedDefaults = async () => {
    try {
      await API.post('/categories/seed');
      toast.success('Default categories যোগ হয়েছে!');
      fetch();
    } catch { toast.error('Error'); }
  };

  return (
    <AdminLayout title="Game Categories">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px' }} onClick={openNew}>
          <FaPlus size={12} /> নতুন Category
        </button>
        {categories.length === 0 && (
          <button className="btn-secondary" onClick={seedDefaults}>
            🔄 Default Categories যোগ করুন
          </button>
        )}
      </div>

      {loading ? <div className="page-loader"><div className="spinner" /></div>
        : categories.length === 0 ? (
          <div className="empty-state">
            <p style={{ marginBottom: '12px' }}>কোনো category নেই</p>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 20px' }} onClick={seedDefaults}>
              🔄 Default Categories যোগ করুন
            </button>
          </div>
        ) : categories.map(cat => {
          const imgUrl = getImgUrl(cat.image);
          return (
            <div key={cat._id} style={{
              background: 'var(--bg-card)', border: `1px solid ${cat.isActive ? 'var(--border)' : 'rgba(239,68,68,0.2)'}`,
              borderRadius: 10, padding: '12px', marginBottom: '10px',
              opacity: cat.isActive ? 1 : 0.6, display: 'flex', gap: '10px', alignItems: 'center'
            }}>
              {/* Image */}
              <div style={{ width: 60, height: 50, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-card2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {imgUrl
                  ? <img src={imgUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                  : <span style={{ fontSize: '20px' }}>{cat.game === 'FreeFire' ? '🔥' : cat.game === 'PUBG' ? '🎯' : '🎮'}</span>
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '15px', fontWeight: 700 }}>{cat.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {cat.game} • Order: {cat.order}
                  {cat.matchCount > 0 && <span style={{ color: 'var(--accent2)', marginLeft: '6px' }}>• {cat.matchCount} match</span>}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => openEdit(cat)} style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 8px', color: 'var(--purple-light)', cursor: 'pointer' }}>
                  <FaEdit size={12} />
                </button>
                <button onClick={() => toggleActive(cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: cat.isActive ? 'var(--accent2)' : 'var(--text-muted)' }}>
                  {cat.isActive ? <FaToggleOn /> : <FaToggleOff />}
                </button>
                <button onClick={() => handleDelete(cat._id)} className="btn-danger" style={{ padding: '6px 8px' }}>
                  <FaTrash size={11} />
                </button>
              </div>
            </div>
          );
        })}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
              {editing ? '✏️ Category Edit' : '➕ নতুন Category'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Image Upload */}
              <label style={{ cursor: 'pointer' }}>
                <div style={{ border: '2px dashed var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--bg-card2)', position: 'relative' }}>
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                    : <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '24px' }}>🖼</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Category Image আপলোড করুন</span>
                    </div>
                  }
                  <div style={{ padding: '6px', background: 'rgba(0,0,0,0.6)', position: 'absolute', bottom: 0, left: 0, right: 0, fontSize: '10px', color: '#ccc', textAlign: 'center' }}>
                    📷 ক্লিক করে image সিলেক্ট করুন
                  </div>
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Category নাম *</label>
                <input className="input-field" placeholder="e.g. Classic Match" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Game *</label>
                <select className="input-field" value={form.game} onChange={e => setForm({ ...form, game: e.target.value })}>
                  {GAMES.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Order (ক্রম)</label>
                <input className="input-field" type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
                  <FaTimes size={11} /> বাতিল
                </button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={handleSave} disabled={saving}>
                  {saving ? '⏳...' : <><FaCheck size={11} /> {editing ? 'আপডেট করুন' : 'তৈরি করুন'}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
