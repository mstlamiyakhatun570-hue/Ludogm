import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCWwLBxLh9AKUMXSD8ggNmMnJ37BAwCquk",
  authDomain: "tournament-a877c.firebaseapp.com",
  projectId: "tournament-a877c",
  storageBucket: "tournament-a877c.firebasestorage.app",
  messagingSenderId: "585409221109",
  appId: "1:585409221109:web:7c77fc5283238f439550bc"
};

const VAPID_KEY = "BOCm4ZxGWwz_bZS-wOrFYjKlfQtz2u5Oy-xn_f4NZTdHdCvTi1EVPUOurD5eQ1Yq6WZKBTyx_apNHno1qnkbWSQ";

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Messaging initialized lazily to avoid crash
let messagingInstance = null;

const getMessagingInstance = async () => {
  if (messagingInstance) return messagingInstance;
  try {
    const supported = await isSupported();
    if (!supported) return null;
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch {
    return null;
  }
};

export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) return null;
    if (!('serviceWorker' in navigator)) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const msg = await getMessagingInstance();
    if (!msg) return null;

    let registration;
    try {
      registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
    } catch {
      try { registration = await navigator.serviceWorker.ready; }
      catch { return null; }
    }

    const token = await getToken(msg, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    return token || null;
  } catch (err) {
    console.log('FCM permission error:', err.message);
    return null;
  }
};

export const onForegroundMessage = (callback) => {
  // Return unsubscribe function immediately, setup async
  let unsubscribe = null;
  getMessagingInstance().then(msg => {
    if (!msg) return;
    try {
      unsubscribe = onMessage(msg, payload => callback(payload));
    } catch {}
  });
  return () => { if (unsubscribe) unsubscribe(); };
};

export default app;
