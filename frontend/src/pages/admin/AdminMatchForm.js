import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { useSettings } from '../../context/SettingsContext';

const MAPS = ['Bermuda', 'Purgatory', 'Kalahari', 'Nextera', 'Erangel', 'Miramar', 'Sanhok', 'অন্যান্য'];
const ENTRY_TYPES = ['Solo', 'Duo', 'Squad'];

// Default game images mapping to settings keys
const DEFAULT_IMAGES = {
  'FreeFire': 'banner_freefire_classic',
  'PUBG': 'banner_pubg_classic',
  'COD': '',
  'অন্যান্য': '',
};

const defaultForm = {
  title: '', game: 'FreeFire', gameMode: 'Classic Match', map: 'Bermuda',
  entryType: 'Solo', entryFee: '', totalPrize: '', perKillPrize: '0',
  prizeNote: '', maxSlots: '20', matchTime: '',
  roomId: '', roomPassword: '', roomNote: '', banner: '', status: 'upcoming'
};

export default function AdminMatchForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filteredModes, setFilteredModes] = useState([]);

  useEffect(() => {
    // Load categories
    API.get('/categories/admin/all').then(res => {
      setCategories(res.data);
      if (!isEdit) {
        // New match - set modes for first game
        const games = [...new Set(res.data.map(c => c.game))];
        const firstGame = games[0] || 'FreeFire';
        const modes = res.data.filter(c => c.game === firstGame).map(c => c.name);
        setFilteredModes(modes);
      }
    }).catch(() => {});

    if (isEdit) {
      API.get(`/matches/${id}`).then(res => {
        const m = res.data;
        setForm({
          title: m.title, game: m.game, gameMode: m.gameMode, map: m.map,
          entryType: m.entryType, entryFee: m.entryFee, totalPrize: m.totalPrize,
          perKillPrize: m.perKillPrize, prizeNote: m.prizeNote || '',
          maxSlots: m.maxSlots, matchTime: new Date(m.matchTime).toISOString().slice(0,16),
          roomId: m.roomId || '', roomPassword: m.roomPassword || '',
          roomNote: m.roomNote || '', banner: m.banner || '', status: m.status
        });
        if (m.banner) setBannerPreview(
          m.banner.startsWith('http') ? m.banner :
          `${(process.env.REACT_APP_API_URL||'/api').replace('/api','')}${m.banner}`
        );
        // Set filtered modes based on match's game
        API.get('/categories/admin/all').then(catRes => {
          const modes = catRes.data.filter(c => c.game === m.game).map(c => c.name);
          setFilteredModes(modes.length > 0 ? modes : [m.gameMode]);
        }).catch(() => setFilteredModes([m.gameMode]));
      }).catch(() => toast.error('Match not found'));
    }
  }, [id]);

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleBannerChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setBannerFile(f);
    setBannerPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.entryFee || !form.totalPrize || !form.matchTime)
      return toast.error('সব প্রয়োজনীয় তথ্য দিন');
    setLoading(true);
    try {
      // Use settings default banner if no custom banner
      const settingsKey = DEFAULT_IMAGES[form.game];
      const settingsDefaultBanner = settingsKey ? (settings[settingsKey] || '') : '';
      let bannerUrl = form.banner || settingsDefaultBanner;

      // Upload banner if selected
      if (bannerFile) {
        setUploading(true);
        const data = new FormData();
        data.append('image', bannerFile);
        const res = await API.post('/settings/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        bannerUrl = res.data.url;
        setUploading(false);
      }

      const matchData = { ...form, banner: bannerUrl };

      if (isEdit) { await API.put(`/matches/${id}`, matchData); toast.success('Updated!'); }
      else { await API.post('/matches', matchData); toast.success('Match তৈরি হয়েছে!'); }
      navigate('/admin/matches');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); setUploading(false); }
  };

  return (
    <AdminLayout title={isEdit ? 'Match Edit' : 'নতুন Match'}>
      <div className="admin-form">
        <div className="form-group">
          <label className="form-label">ম্যাচের নাম *</label>
          <input className="input-field" placeholder="e.g. DEVELOPER X SAKIB" value={form.title} onChange={e => set('title', e.target.value)}/>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Game *</label>
            <select className="input-field" value={form.game} onChange={e => {
              const game = e.target.value;
              const modes = categories.filter(c => c.game === game).map(c => c.name);
              setFilteredModes(modes);
              set('game', game);
              if (modes.length > 0) set('gameMode', modes[0]);
            }}>
              {[...new Set(categories.map(c => c.game))].map(g => <option key={g}>{g}</option>)}
              {categories.length === 0 && ['FreeFire', 'PUBG', 'COD', 'অন্যান্য'].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Game Mode *</label>
            <select className="input-field" value={form.gameMode} onChange={e => set('gameMode', e.target.value)}>
              {(filteredModes.length > 0 ? filteredModes : ['Classic Match', 'Clash Squad', 'CS 1 VS 1', 'Lone Wolf', 'FullMap', 'TDM']).map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Map</label>
            <select className="input-field" value={form.map} onChange={e => set('map', e.target.value)}>
              {MAPS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Entry Type</label>
            <select className="input-field" value={form.entryType} onChange={e => set('entryType', e.target.value)}>
              {ENTRY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Entry Fee (৳) *</label>
            <input className="input-field" type="number" placeholder="20" value={form.entryFee} onChange={e => set('entryFee', e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Max Slots</label>
            <input className="input-field" type="number" placeholder="20" value={form.maxSlots} onChange={e => set('maxSlots', e.target.value)}/>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Total Prize (৳) *</label>
            <input className="input-field" type="number" value={form.totalPrize} onChange={e => set('totalPrize', e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Per Kill Prize (৳)</label>
            <input className="input-field" type="number" value={form.perKillPrize} onChange={e => set('perKillPrize', e.target.value)}/>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Prize Note (বিস্তারিত)</label>
          <textarea className="input-field" rows={2} placeholder="e.g. 1st: 100৳, 2nd: 50৳, 3rd: 30৳" value={form.prizeNote} onChange={e => set('prizeNote', e.target.value)}/>
        </div>

        <div className="form-group">
          <label className="form-label">Match Time *</label>
          <input className="input-field" type="datetime-local" value={form.matchTime} onChange={e => set('matchTime', e.target.value)}/>
        </div>

        {/* Banner Image Upload */}
        <div className="form-group">
          <label className="form-label">🖼 Match Banner Image</label>
          <label style={{display:'block', cursor:'pointer'}}>
            <div style={{border:'2px dashed var(--border)', borderRadius:10, overflow:'hidden', background:'var(--bg-card2)', position:'relative'}}>
              {(() => {
                const settingsKey = DEFAULT_IMAGES[form.game];
                const defaultImg = settingsKey ? (settings[settingsKey] || '') : '';
                const showImg = bannerPreview || (defaultImg ? (defaultImg.startsWith('http') ? defaultImg : `${(process.env.REACT_APP_API_URL||'/api').replace('/api','')}${defaultImg}`) : '');
                return showImg ? (
                  <img src={showImg} alt="banner"
                    style={{width:'100%', height:'120px', objectFit:'cover', display:'block'}}
                    onError={e => { e.target.style.display='none'; }}/>
                ) : (
                  <div style={{height:'80px', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'6px'}}>
                    <span style={{fontSize:'24px'}}>🖼</span>
                    <span style={{fontSize:'12px', color:'var(--text-muted)'}}>Banner Image আপলোড করুন</span>
                  </div>
                );
              })()}
              <div style={{padding:'8px 10px', background:'rgba(0,0,0,0.5)', position:'absolute', bottom:0, left:0, right:0, fontSize:'11px', color:'#ccc', textAlign:'center'}}>
                {bannerPreview ? '✅ নতুন image সিলেক্ট করা হয়েছে' : '📷 ক্লিক করে custom image দিন (না দিলে game এর default image ব্যবহার হবে)'}
              </div>
            </div>
            <input type="file" accept="image/*" onChange={handleBannerChange} style={{display:'none'}}/>
          </label>
        </div>

        <div style={{background:'var(--bg-card2)', borderRadius:10, padding:'14px'}}>
          <p style={{fontSize:'13px', color:'var(--purple-light)', fontWeight:600, marginBottom:'10px'}}>🔑 Room Details (শুধু joined players দেখতে পাবে)</p>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Room ID</label>
              <input className="input-field" value={form.roomId} onChange={e => set('roomId', e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Room Password</label>
              <input className="input-field" value={form.roomPassword} onChange={e => set('roomPassword', e.target.value)}/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Room Note</label>
            <input className="input-field" placeholder="Additional instructions..." value={form.roomNote} onChange={e => set('roomNote', e.target.value)}/>
          </div>
        </div>

        {isEdit && (
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="upcoming">upcoming</option>
              <option value="running">running</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
        )}

        <button className="btn-primary" onClick={handleSubmit} disabled={loading || uploading}>
          {uploading ? '⏳ Image আপলোড হচ্ছে...' : loading ? '⏳ সেভ হচ্ছে...' : isEdit ? '✅ আপডেট করুন' : '✅ Match তৈরি করুন'}
        </button>
      </div>
    </AdminLayout>
  );
}
