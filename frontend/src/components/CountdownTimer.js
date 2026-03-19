import { useState, useEffect } from 'react';
import { FaClock } from 'react-icons/fa';

export default function CountdownTimer({ matchTime, status }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const target = new Date(matchTime);
      const diff = target - now;

      if (diff <= 0 || status === 'running') {
        setTimeLeft('শুরু হয়েছে');
        return;
      }
      if (status === 'completed') { setTimeLeft('শেষ'); return; }
      if (status === 'cancelled') { setTimeLeft('বাতিল'); return; }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setUrgent(diff < 3600000); // less than 1 hour

      if (h > 0) setTimeLeft(`${h}ঘ ${m}মি`);
      else if (m > 0) setTimeLeft(`${m}মি ${s}সে`);
      else setTimeLeft(`${s}সে`);
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [matchTime, status]);

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      color: urgent ? '#ef4444' : 'var(--accent)',
      fontSize: '12px', fontWeight: '600'
    }}>
      <FaClock size={10}/>
      {timeLeft}
    </span>
  );
}
