import { NavLink } from 'react-router-dom';
import { FaGamepad, FaBell, FaHistory, FaUser } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import API from '../utils/api';
import './Navbar.css';

export default function Navbar() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    API.get('/notifications/unread-count')
      .then(res => setUnread(res.data.count))
      .catch(() => {});
    const interval = setInterval(() => {
      API.get('/notifications/unread-count')
        .then(res => setUnread(res.data.count))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
        <FaGamepad size={22}/>
        <span>হোম</span>
      </NavLink>
      <NavLink to="/notifications" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
        <div style={{position:'relative'}}>
          <FaBell size={22}/>
          {unread > 0 && <span className="badge-dot">{unread}</span>}
        </div>
        <span>নোটিশ</span>
      </NavLink>
      <NavLink to="/match-history" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
        <FaHistory size={22}/>
        <span>হিস্টোরি</span>
      </NavLink>
      <NavLink to="/profile" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
        <FaUser size={22}/>
        <span>প্রোফাইল</span>
      </NavLink>
    </nav>
  );
}
