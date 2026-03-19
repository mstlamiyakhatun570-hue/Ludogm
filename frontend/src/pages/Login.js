import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FaPhone, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ phone: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.token, res.data.user);
      toast.success('স্বাগতম! 🎮');
      navigate(res.data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'লগইন ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg"/>
      <div className="auth-container">
        <div className="auth-logo">🏆</div>
        <h1 className="auth-title">Tournament Guru</h1>
        <p className="auth-subtitle">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <FaPhone className="input-icon" size={14}/>
            <input
              type="tel"
              className="input-field"
              placeholder="ফোন নম্বর"
              value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" size={14}/>
            <input
              type={showPass ? 'text' : 'password'}
              className="input-field"
              placeholder="পাসওয়ার্ড"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              required
            />
            <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
              {showPass ? <FaEyeSlash size={14}/> : <FaEye size={14}/>}
            </button>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ লোড হচ্ছে...' : '🎮 লগইন করুন'}
          </button>
        </form>

        <p className="auth-link">
          অ্যাকাউন্ট নেই? <Link to="/register">রেজিস্ট্রেশন করুন</Link>
        </p>
      </div>
    </div>
  );
}
