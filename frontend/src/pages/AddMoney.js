import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Navbar from '../components/Navbar';
import { useSettings } from '../context/SettingsContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaCopy, FaCheckCircle } from 'react-icons/fa';

const METHODS = [
  { id: 'bkash', label: 'bKash', color: '#e2136e', emoji: '💳' },
  { id: 'nagad', label: 'Nagad', color: '#f7941d', emoji: '💰' },
  { id: 'rocket', label: 'Rocket', color: '#8b1fa9', emoji: '🚀' },
];

export default function AddMoney() {
  const [method, setMethod] = useState('bkash');
  const [amount, setAmount] = useState('');
  const [txId, setTxId] = useState('');
  const [fromNumber, setFromNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { settings } = useSettings();
  const navigate = useNavigate();

  const getNumber = () => {
    if (method === 'bkash') return settings.bkashNumber;
    if (method === 'nagad') return settings.nagadNumber;
    return settings.rocketNumber;
  };

  const copyNumber = () => {
    navigator.clipboard.writeText(getNumber());
    toast.success('নম্বর কপি হয়েছে!');
  };

  const handleSubmit = async () => {
    if (!amount || parseInt(amount) < (settings.minAddMoney || 20))
      return toast.error(`সর্বনিম্ন ${settings.minAddMoney || 20} টাকা যোগ করুন`);
    if (!txId.trim()) return toast.error('Transaction ID দিন');
    if (!fromNumber.trim()) return toast.error('আপনার নম্বর দিন');
    setLoading(true);
    try {
      await API.post('/wallet/addmoney', { amount: parseInt(amount), paymentMethod: method, transactionId: txId, accountNumber: fromNumber });
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'অনুরোধ ব্যর্থ হয়েছে');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="pb-nav">
      <TopBar/>
      <div style={{padding:'40px 24px', textAlign:'center'}}>
        <FaCheckCircle size={60} color="var(--accent2)" style={{marginBottom:'16px'}}/>
        <h2 style={{fontFamily:'Rajdhani', fontSize:'22px', marginBottom:'8px'}}>অনুরোধ পাঠানো হয়েছে!</h2>
        <p style={{color:'var(--text-secondary)', fontSize:'14px', marginBottom:'24px'}}>
          Admin অনুমোদন করলে আপনার Gaming Balance এ টাকা যোগ হবে।
        </p>
        <button className="btn-primary" onClick={() => navigate('/')}>হোমে ফিরুন</button>
      </div>
      <Navbar/>
    </div>
  );

  return (
    <div className="pb-nav animate-fade">
      <TopBar/>
      <div style={{padding:'16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px'}}>
          <button onClick={() => navigate(-1)} style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'8px', padding:'8px 10px', color:'white', cursor:'pointer'}}>
            <FaArrowLeft size={14}/>
          </button>
          <h2 style={{fontFamily:'Rajdhani', fontSize:'20px', fontWeight:700}}>Add Money</h2>
        </div>

        {/* Method selection */}
        <p style={{fontSize:'14px', color:'var(--text-secondary)', marginBottom:'10px'}}>Payment Method:</p>
        <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
          {METHODS.map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)} style={{
              flex:1, padding:'12px 8px', borderRadius:10, border:'2px solid',
              borderColor: method === m.id ? m.color : 'var(--border)',
              background: method === m.id ? `${m.color}20` : 'var(--bg-card)',
              color: method === m.id ? m.color : 'var(--text-secondary)',
              cursor:'pointer', fontWeight:700, fontSize:'13px',
              fontFamily:'Hind Siliguri, sans-serif', transition:'all 0.2s'
            }}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>

        {/* Send to number */}
        <div style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'14px', marginBottom:'16px'}}>
          <p style={{fontSize:'13px', color:'var(--text-secondary)', marginBottom:'6px'}}>• Send Money:</p>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <span style={{fontSize:'18px', fontWeight:700, fontFamily:'Rajdhani', color:'#f87171'}}>{getNumber()}</span>
            <button onClick={copyNumber} style={{display:'flex', alignItems:'center', gap:'5px', background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:6, padding:'6px 12px', color:'var(--text-primary)', cursor:'pointer', fontSize:'12px', fontFamily:'Hind Siliguri'}}>
              <FaCopy size={11}/> Copy
            </button>
          </div>
          <p style={{fontSize:'12px', color:'var(--accent)', marginTop:'6px'}}>সর্বনিম্ন {settings.minAddMoney || 20} টাকা</p>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px'}}>
          <input className="input-field" type="number" placeholder="পরিমাণ (টাকা)"
            value={amount} onChange={e => setAmount(e.target.value)}/>
          <input className="input-field" type="text" placeholder="Transaction ID"
            value={txId} onChange={e => setTxId(e.target.value)}/>
          <input className="input-field" type="tel" placeholder="আপনার নম্বর"
            value={fromNumber} onChange={e => setFromNumber(e.target.value)}/>
        </div>

        <div style={{background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.2)', borderRadius:8, padding:'10px 12px', marginBottom:'16px', fontSize:'13px', color:'#60a5fa'}}>
          💡 Payment করার পরে Transaction ID এখানে দিন, তারপর Submit করুন।
        </div>

        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ পাঠানো হচ্ছে...' : 'SUBMIT'}
        </button>
      </div>
      <Navbar/>
    </div>
  );
}
