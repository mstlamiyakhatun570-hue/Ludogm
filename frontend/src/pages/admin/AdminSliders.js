import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { FaTrash, FaToggleOn, FaToggleOff, FaPlus } from 'react-icons/fa';

export default function AdminSliders() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', link: '', order: 0 });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');

  const fetch = () => {
    API.get('/settings/admin/sliders').then(res => setSliders(res.data)).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleAdd = async () => {
    if (!file && !form.imageUrl) return toast.error('Image বেছে নিন');
    setUploading(true);
    try {
      const data = new FormData();
      if (file) data.append('image', file);
      data.append('title', form.title);
      data.append('link', form.link);
      data.append('order', form.order);
      await API.post('/settings/sliders', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Slider যোগ হয়েছে!');
      setForm({ title: '', link: '', order: 0 });
      setFile(null);
      setPreview('');
      fetch();
    } catch { toast.error('Error'); }
    finally { setUploading(false); }
  };

  const toggleActive = async (id, current) => {
    try {
      await API.put(`/settings/sliders/${id}`, { isActive: !current });
      fetch();
    } catch { toast.error('Error'); }
  };

  const deleteSlider = async (id) => {
    if (!window.confirm('Delete করবেন?')) return;
    try { await API.delete(`/settings/sliders/${id}`); toast.success('Deleted!'); fetch(); }
    catch { toast.error('Error'); }
  };

  return (
    <AdminLayout title="Slider Management">
      {/* Add new slider */}
      <div style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'16px', marginBottom:'16px'}}>
        <h3 style={{fontFamily:'Rajdhani', fontSize:'16px', fontWeight:700, marginBottom:'12px'}}>➕ নতুন Slider যোগ করুন</h3>

        <label style={{display:'block', border:'2px dashed var(--border)', borderRadius:10, overflow:'hidden', marginBottom:'10px', cursor:'pointer'}}>
          {preview
            ? <img src={preview} alt="preview" style={{width:'100%', height:'140px', objectFit:'cover'}}/>
            : <div style={{height:'140px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', gap:'8px'}}>
                <span style={{fontSize:'32px'}}>🖼</span>
                <span style={{fontSize:'13px'}}>Image সিলেক্ট করুন (JPG/PNG)</span>
              </div>
          }
          <input type="file" accept="image/*" onChange={handleFileChange} style={{display:'none'}}/>
        </label>

        <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
          <input className="input-field" placeholder="Title (optional)" value={form.title} onChange={e => setForm({...form, title: e.target.value})}/>
          <input className="input-field" placeholder="Link (optional, e.g. https://youtube.com/...)" value={form.link} onChange={e => setForm({...form, link: e.target.value})}/>
          <input className="input-field" type="number" placeholder="Order (0, 1, 2...)" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value)||0})}/>
          <button className="btn-primary" onClick={handleAdd} disabled={uploading || !file}>
            {uploading ? '⏳ আপলোড হচ্ছে...' : <><FaPlus size={12}/> Slider যোগ করুন</>}
          </button>
        </div>
      </div>

      {/* Existing sliders */}
      <h3 style={{fontFamily:'Rajdhani', fontSize:'16px', fontWeight:700, marginBottom:'10px'}}>
        বর্তমান Sliders ({sliders.length})
      </h3>

      {loading ? <div className="page-loader"><div className="spinner"/></div>
      : sliders.length === 0 ? <div className="empty-state"><p>কোনো slider নেই</p></div>
      : sliders.map(s => {
        const imgSrc = s.image?.startsWith('http') ? s.image :
          `${(process.env.REACT_APP_API_URL||'/api').replace('/api','')}${s.image}`;
        return (
        <div key={s._id} style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', marginBottom:'10px', opacity: s.isActive ? 1 : 0.5}}>
          <img src={imgSrc} alt={s.title} style={{width:'100%', height:'100px', objectFit:'cover'}}
            onError={e => { e.target.src = 'https://placehold.co/400x100/1a1a35/7C3AED?text=Image+Error'; }}/>
          <div style={{padding:'10px 12px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div>
              {s.title && <p style={{fontSize:'13px', fontWeight:600}}>{s.title}</p>}
              <p style={{fontSize:'11px', color:'var(--text-muted)'}}>Order: {s.order} • {s.isActive ? '✅ Active' : '❌ Inactive'}</p>
            </div>
            <div style={{display:'flex', gap:'8px'}}>
              <button onClick={() => toggleActive(s._id, s.isActive)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'20px', color: s.isActive ? 'var(--accent2)' : 'var(--text-muted)'}}>
                {s.isActive ? <FaToggleOn/> : <FaToggleOff/>}
              </button>
              <button className="btn-danger" style={{padding:'6px 10px', fontSize:'12px'}} onClick={() => deleteSlider(s._id)}>
                <FaTrash size={11}/>
              </button>
            </div>
          </div>
        </div>
        );
      })}
    </AdminLayout>
  );
}
