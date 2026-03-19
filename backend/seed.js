require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');
const Settings = require('./src/models/Settings');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB Connected');

  // Create admin
  const adminPhone = process.env.ADMIN_PHONE || '01700000000';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existing = await User.findOne({ phone: adminPhone });
  if (existing) {
    console.log('⚠️  Admin already exists:', adminPhone);
  } else {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await User.create({
      name: 'Admin',
      phone: adminPhone,
      password: hashed,
      role: 'admin',
      promoCode: 'ADMIN00001',
    });
    console.log('✅ Admin created:', adminPhone, '/', adminPassword);
  }

  // Seed default settings
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
  console.log('✅ Default settings seeded');

  await mongoose.disconnect();
  console.log('🎉 Seed complete!');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
