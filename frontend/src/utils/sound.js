// Beautiful notification sound using Web Audio API
// No external file needed - generated programmatically

export const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    const playTone = (freq, startTime, duration, gainVal) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.2, startTime + duration * 0.3);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;

    // Beautiful 3-note notification chime: C5 → E5 → G5
    playTone(523.25, now, 0.3, 0.4);        // C5
    playTone(659.25, now + 0.15, 0.3, 0.35); // E5
    playTone(783.99, now + 0.30, 0.5, 0.3);  // G5

    // Subtle harmony
    playTone(1046.50, now + 0.30, 0.4, 0.1); // C6 (octave)

    // Close context after sound
    setTimeout(() => {
      try { ctx.close(); } catch {}
    }, 1500);

  } catch (err) {
    console.log('Sound error:', err.message);
  }
};
