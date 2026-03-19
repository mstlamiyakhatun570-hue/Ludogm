const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate promo code
const generatePromoCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 10; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    if (!name?.trim() || !phone?.trim() || !password)
      return res.status(400).json({ message: 'সব তথ্য দিন' });
    if (password.length < 6)
      return res.status(400).json({ message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' });

    const cleanPhone = phone.trim();
    const exists = await User.findOne({ phone: cleanPhone });
    if (exists) return res.status(400).json({ message: 'এই ফোন নম্বর ইতিমধ্যে নিবন্ধিত' });

    const hashed = await bcrypt.hash(password, 10);
    let promoCode;
    let attempts = 0;
    do {
      promoCode = generatePromoCode();
      attempts++;
    } while (await User.findOne({ promoCode }) && attempts < 10);

    const user = new User({ name: name.trim(), phone: cleanPhone, password: hashed, promoCode });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone?.trim() || !password)
      return res.status(400).json({ message: 'ফোন নম্বর ও পাসওয়ার্ড দিন' });

    const user = await User.findOne({ phone: phone.trim() });
    if (!user) return res.status(400).json({ message: 'ফোন নম্বর বা পাসওয়ার্ড ভুল' });
    if (!user.isActive) return res.status(403).json({ message: 'আপনার অ্যাকাউন্ট সাসপেন্ড করা হয়েছে' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'ফোন নম্বর বা পাসওয়ার্ড ভুল' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/auth/setup - One time admin setup (only works if no admin exists)
router.get('/setup', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists! This route is disabled.' });
    }

    const adminPhone = process.env.ADMIN_PHONE;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPhone || !adminPassword) {
      return res.status(400).json({ message: 'ADMIN_PHONE and ADMIN_PASSWORD env variables not set!' });
    }

    const hashed = await bcrypt.hash(adminPassword, 10);
    const admin = new User({
      name: 'Admin',
      phone: adminPhone,
      password: hashed,
      role: 'admin',
      promoCode: 'ADMIN00001',
    });
    await admin.save();

    // Seed default settings
    const Settings = require('../models/Settings');
    const defaults = {
      appName: 'Tournament Guru',
      appLogo: '',
      appDescription: 'বাংলাদেশের সেরা গেমিং টুর্নামেন্ট প্ল্যাটফর্ম',
      bkashNumber: '01776469016',
      nagadNumber: '01983626780',
      rocketNumber: '019836267807',
      socialYoutube: '',
      socialTelegram: '',
      socialWhatsapp: '',
      socialFacebook: '',
      minAddMoney: 20,
      minWithdraw: 50,
      announcement: 'Tournament Guru তে আপনাকে স্বাগতম! 🎮',
      footerText: '© 2025 Tournament Guru. All rights reserved.',
      heroText: 'খেলো, জিতো, উপভোগ করো!',
      banner_freefire_classic: '',
      banner_freefire_clash: '',
      banner_freefire_1v1: '',
      banner_freefire_lonewolf: '',
      banner_pubg_classic: '',
      banner_pubg_tdm: '',
    };
    for (const [key, value] of Object.entries(defaults)) {
      await Settings.findOneAndUpdate({ key }, { value }, { upsert: true });
    }

    res.json({
      message: '✅ Admin created successfully! Default settings seeded.',
      phone: adminPhone,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').auth, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
