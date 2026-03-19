const admin = require('firebase-admin');

let messaging = null;

try {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: "googleapis.com"
  };

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  messaging = admin.messaging();
  console.log('✅ Firebase Admin initialized');
} catch (err) {
  console.error('⚠️ Firebase Admin init failed:', err.message);
  console.log('Push notifications will be disabled');
}

// Send push notification to a single token
const sendToToken = async (token, title, body, data = {}) => {
  if (!messaging || !token) return false;
  try {
    await messaging.send({
      token,
      notification: { title, body },
      data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
      webpush: {
        notification: {
          title,
          body,
          icon: '/logo192.png',
          badge: '/logo192.png',
          vibrate: [200, 100, 200],
        },
        fcmOptions: { link: '/' }
      }
    });
    return true;
  } catch (err) {
    console.error('FCM send error:', err.message);
    return false;
  }
};

// Send push notification to multiple tokens
const sendToMultiple = async (tokens, title, body, data = {}) => {
  if (!messaging || !tokens || tokens.length === 0) return;
  try {
    const messages = tokens.map(token => ({
      token,
      notification: { title, body },
      data,
      webpush: {
        notification: {
          title,
          body,
          icon: '/logo192.png',
          vibrate: [200, 100, 200],
        },
        fcmOptions: { link: '/' }
      }
    }));
    const response = await messaging.sendEach(messages);
    console.log(`✅ Sent: ${response.successCount}, Failed: ${response.failureCount}`);
    return response;
  } catch (err) {
    console.error('FCM multicast error:', err.message);
  }
};

// Send to all users (topic)
const sendToAll = async (title, body, data = {}) => {
  if (!messaging) return false;
  try {
    await messaging.send({
      topic: 'all-users',
      notification: { title, body },
      data,
      webpush: {
        notification: {
          title,
          body,
          icon: '/logo192.png',
          vibrate: [200, 100, 200],
        },
        fcmOptions: { link: '/' }
      }
    });
    return true;
  } catch (err) {
    console.error('FCM topic error:', err.message);
    return false;
  }
};

module.exports = { sendToToken, sendToMultiple, sendToAll, messaging: () => messaging };
