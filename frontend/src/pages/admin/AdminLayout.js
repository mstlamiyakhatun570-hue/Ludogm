import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { FaTachometerAlt, FaGamepad, FaPlusCircle, FaMoneyBillWave, FaUsers, FaImages, FaBell, FaCog, FaSignOutAlt, FaThLarge } from 'react-icons/fa';
import './Admin.css';

const navItems = [
  { to: '/admin', icon: <FaTachometerAlt/>, label: 'Dashboard', exact: true },
  { to: '/admin/categories', icon: <FaThLarge/>, label: 'Categories' },
  { to: '/admin/matches', icon: <FaGamepad/>, label: 'Matches' },
  { to: '/admin/addmoney', icon: <FaPlusCircle/>, label: 'Add Money' },
  { to: '/admin/withdraw', icon: <FaMoneyBillWave/>, label: 'Withdraw' },
  { to: '/admin/users', icon: <FaUsers/>, label: 'Users' },
  { to: '/admin/sliders', icon: <FaImages/>, label: 'Sliders' },
  { to: '/admin/notifications', icon: <FaBell/>, label: 'Notifications' },
  { to: '/admin/settings', icon: <FaCog/>, label: 'Settings' },
];

export default function AdminLayout({ children, title }) {
  const { logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <span className="admin-logo">🏆 {settings.appName}</span>
        <span style={{fontSize:'13px', color:'var(--text-secondary)'}}>Admin Panel</span>
        <button onClick={handleLogout} className="admin-logout-btn"><FaSignOutAlt size={14}/></button>
      </header>

      <nav className="admin-nav">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.exact}
            className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <main className="admin-main">
        {title && <h1 className="admin-page-title">{title}</h1>}
        {children}
      </main>
    </div>
  );
}
