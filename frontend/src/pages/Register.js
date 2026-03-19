import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FaUser, FaPhone, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('পাসওয়ার্ড মিলছে না');
    if (form.password.length < 6) return toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
    setLoading(true);
    try {
      const res = await API.post('/auth/register', { name: form.name, phone: form.phone, password: form.password });
      login(res.data.token, res.data.user);
      toast.success('রেজিস্ট্রেশন সফল! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
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
        <p className="auth-subtitle">নতুন অ্যাকাউন্ট তৈরি করুন</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <FaUser className="input-icon" size={14}/>
            <input type="text" className="input-field" placeholder="আপনার নাম"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} required/>
          </div>
          <div className="input-group">
            <FaPhone className="input-icon" size={14}/>
            <input type="tel" className="input-field" placeholder="ফোন নম্বর"
              value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required/>
          </div>
          <div className="input-group">
            <FaLock className="input-icon" size={14}/>
            <input type={showPass ? 'text' : 'password'} className="input-field" placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required/>
            <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
              {showPass ? <FaEyeSlash size={14}/> : <FaEye size={14}/>}
            </button>
          </div>
          <div className="input-group">
            <FaLock className="input-icon" size={14}/>
            <input type="password" className="input-field" placeholder="পাসওয়ার্ড নিশ্চিত করুন"
              value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} required/>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ লোড হচ্ছে...' : '🎉 রেজিস্ট্রেশন করুন'}
          </button>
        </form>

        <p className="auth-link">
          অ্যাকাউন্ট আছে? <Link to="/login">লগইন করুন</Link>
        </p>
      </div>
    </div>
  );
}
