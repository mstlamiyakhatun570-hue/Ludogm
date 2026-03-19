# 🏆 Tournament Guru

বাংলাদেশের সেরা গেমিং টুর্নামেন্ট প্ল্যাটফর্ম।

## Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas
- **Deploy:** Render.com

---

## 🚀 DEPLOY করার ধাপ

### ধাপ ১: MongoDB Atlas সেটআপ
1. https://mongodb.com/atlas এ যান
2. Free cluster তৈরি করুন
3. Database user তৈরি করুন (username + password)
4. Network Access → Allow from anywhere (0.0.0.0/0)
5. Connection string কপি করুন:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/tournament-guru
   ```

### ধাপ ২: GitHub এ Upload
1. GitHub এ নতুন repository তৈরি করুন
2. এই সব ফাইল upload করুন

### ধাপ ৩: Render এ Backend Deploy
1. https://render.com এ যান → New → Web Service
2. GitHub repository connect করুন
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Environment Variables যোগ করুন:
   ```
   MONGODB_URI = mongodb+srv://...
   JWT_SECRET = যেকোনো_লম্বা_random_string
   ADMIN_PHONE = 01XXXXXXXXX
   ADMIN_PASSWORD = আপনার_admin_পাসওয়ার্ড
   FRONTEND_URL = https://tournament-guru-frontend.onrender.com
   PORT = 5000
   ```
5. Deploy করুন ও URL নোট করুন (e.g. `https://tournament-guru-backend.onrender.com`)

### ধাপ ৪: Admin Account তৈরি (Seed)
Backend deploy হওয়ার পরে Render এর Shell থেকে:
```bash
npm run seed
```
অথবা Render Dashboard → Shell → `node seed.js`

### ধাপ ৫: Render এ Frontend Deploy
1. Render → New → Static Site
2. Settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
3. Environment Variables:
   ```
   REACT_APP_API_URL = https://tournament-guru-backend.onrender.com/api
   ```
4. Deploy করুন

---

## 📱 ব্যবহার

### User
- `/register` → নতুন account তৈরি
- `/login` → লগইন
- Home → Game modes → Match list → Join match
- Profile → Add Money / Withdraw

### Admin
- Admin phone ও password দিয়ে `/login` এ লগইন করুন
- `/admin` → Admin Dashboard

---

## ✨ Features
- ✅ User Registration/Login (Phone + Password)
- ✅ Match System (FreeFire, PUBG, অন্যান্য)
- ✅ Countdown Timer
- ✅ Add Money (bKash/Nagad/Rocket - Manual)
- ✅ Withdraw (Winning Balance)
- ✅ Refund System
- ✅ Match History
- ✅ Result System (Screenshot → Admin approve)
- ✅ Notifications
- ✅ Unlimited Sliders
- ✅ Admin Panel
- ✅ Balance Edit (Admin)
- ✅ Social Links
- ✅ Mobile-friendly Dark UI

---

## 💳 Payment Numbers (Default)
- bKash: 01776469016
- Nagad: 01983626780
- Rocket: 019836267807

Admin Settings থেকে যেকোনো সময় পরিবর্তন করা যাবে।

---

## 📞 Developer
Telegram: @Developer_Sakib_1
