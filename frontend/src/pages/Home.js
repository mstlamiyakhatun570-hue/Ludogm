import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import { useSettings } from '../context/SettingsContext';
import { FaBullhorn } from 'react-icons/fa';
import './Home.css';

const GAME_MODES = [
  { id: 'freefire-classic', game: 'FreeFire', mode: 'Classic Match', settingsKey: 'banner_freefire_classic', label: 'Classic Match' },
  { id: 'freefire-clash', game: 'FreeFire', mode: 'Clash Squad', settingsKey: 'banner_freefire_clash', label: 'Clash Squad' },
  { id: 'freefire-1v1', game: 'FreeFire', mode: 'CS 1 VS 1', settingsKey: 'banner_freefire_1v1', label: 'CS 1 VS 1' },
  { id: 'freefire-lonewolf', game: 'FreeFire', mode: 'Lone Wolf', settingsKey: 'banner_freefire_lonewolf', label: 'Lone Wolf' },
  { id: 'pubg-classic', game: 'PUBG', mode: 'Classic', settingsKey: 'banner_pubg_classic', label: 'PUBG Classic' },
  { id: 'pubg-tdm', game: 'PUBG', mode: 'TDM', settingsKey: 'banner_pubg_tdm', label: 'PUBG TDM' },
];

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${(process.env.REACT_APP_API_URL || '/api').replace('/api', '')}${url}`;
};

export default function Home() {
  const [sliders, setSliders] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [matchCounts, setMatchCounts] = useState({});
  const [categories, setCategories] = useState([]);
  const { settings } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/settings/sliders').then(res => setSliders(res.data)).catch(() => {});
    API.get('/categories').then(res => setCategories(res.data)).catch(() => {});
    API.get('/matches?status=upcoming').then(res => {
      const counts = {};
      res.data.forEach(m => {
        const key = `${m.game}__${m.gameMode}`;
        counts[key] = (counts[key] || 0) + 1;
      });
      setMatchCounts(counts);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const t = setInterval(() => setCurrentSlide(c => (c + 1) % sliders.length), 4000);
    return () => clearInterval(t);
  }, [sliders]);

  return (
    <div className="home-page pb-nav">
      <TopBar/>

      {/* Announcement */}
      {settings.announcement && (
        <div className="announcement-bar">
          <FaBullhorn size={13} color="var(--accent)"/>
          <span>{settings.announcement}</span>
        </div>
      )}

      {/* Slider */}
      {sliders.length > 0 && (
        <div className="slider-container">
          <div className="slider-track" style={{transform: `translateX(-${currentSlide * 100}%)`}}>
            {sliders.map((s, i) => {
              const imgSrc = s.image?.startsWith('http') ? s.image :
                `${(process.env.REACT_APP_API_URL||'/api').replace('/api','')}${s.image}`;
              return (
                <div className="slide" key={i} onClick={() => s.link && window.open(s.link, '_blank')}>
                  <img src={imgSrc} alt={s.title || `Slide ${i+1}`}
                    onError={e => { e.target.style.display='none'; }}/>
                </div>
              );
            })}
          </div>
          {sliders.length > 1 && (
            <div className="slider-dots">
              {sliders.map((_, i) => (
                <div key={i} className={`dot ${i === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(i)}/>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Daily Matches */}
      <div className="section-header">
        <h2>Daily Matches</h2>
      </div>

      <div className="game-grid">
        {categories.length > 0 ? categories.map(cat => {
          const count = matchCounts[`${cat.game}__${cat.name}`] || 0;
          const imgUrl = getImageUrl(cat.image);
          return (
            <div className="game-card" key={cat._id}
              onClick={() => navigate(`/matches/${cat.game}?mode=${cat.name}`)}>
              <div className="game-card-img">
                {imgUrl
                  ? <img src={imgUrl} alt={cat.name} onError={e => { e.target.style.display = 'none'; }} />
                  : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a35, #2d1b69)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                    {cat.game === 'FreeFire' ? '🔥' : cat.game === 'PUBG' ? '🎯' : '🎮'}
                  </div>
                }
                <div className="game-card-overlay" />
              </div>
              <div className="game-card-info">
                <span className="game-card-name">{cat.name}</span>
                <span className={`game-card-count ${count > 0 ? 'active' : ''}`}>
                  {count > 0 ? `${count} Match Found` : 'No Matches Found'}
                </span>
              </div>
            </div>
          );
        }) : GAME_MODES.map(gm => {
          // Fallback if no categories loaded yet
          const count = matchCounts[`${gm.game}__${gm.mode}`] || 0;
          return (
            <div className="game-card" key={gm.id}
              onClick={() => navigate(`/matches/${gm.game}?mode=${gm.mode}`)}>
              <div className="game-card-img">
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a35, #2d1b69)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                  {gm.game === 'FreeFire' ? '🔥' : gm.game === 'PUBG' ? '🎯' : '🎮'}
                </div>
                <div className="game-card-overlay" />
              </div>
              <div className="game-card-info">
                <span className="game-card-name">{gm.label}</span>
                <span className={`game-card-count ${count > 0 ? 'active' : ''}`}>
                  {count > 0 ? `${count} Match Found` : 'No Matches Found'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Social Links */}
      {(settings.socialYoutube || settings.socialTelegram || settings.socialWhatsapp || settings.socialFacebook) && (
        <div className="social-links">
          {settings.socialYoutube && (
            <a href={settings.socialYoutube} target="_blank" rel="noreferrer" className="social-btn youtube">
              ▶ YouTube
            </a>
          )}
          {settings.socialTelegram && (
            <a href={settings.socialTelegram} target="_blank" rel="noreferrer" className="social-btn telegram">
              ✈ Telegram
            </a>
          )}
          {settings.socialWhatsapp && (
            <a href={settings.socialWhatsapp} target="_blank" rel="noreferrer" className="social-btn whatsapp">
              💬 WhatsApp
            </a>
          )}
          {settings.socialFacebook && (
            <a href={settings.socialFacebook} target="_blank" rel="noreferrer" className="social-btn facebook">
              f Facebook
            </a>
          )}
        </div>
      )}
      <Navbar/>
    </div>
  );
}
