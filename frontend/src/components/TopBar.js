import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { FaWallet } from 'react-icons/fa';
import './TopBar.css';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = (process.env.REACT_APP_API_URL || '/api').replace('/api', '');
  return `${base}${url}`;
};

export default function TopBar() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar-left">
        {settings.appLogo
          ? <img src={getImageUrl(settings.appLogo)} alt="logo" className="topbar-logo-img"/>
          : <div className="topbar-logo-icon">🏆</div>
        }
        <span className="topbar-name">{settings.appName || 'Tournament Guru'}</span>
      </div>
      <button className="topbar-wallet" onClick={() => navigate('/add-money')}>
        <FaWallet size={14}/>
        <span>৳{user?.gamingBalance || 0}</span>
      </button>
    </header>
  );
}
