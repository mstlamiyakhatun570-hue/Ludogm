const router = require('express').Router();
const Settings = require('../models/Settings');
const Slider = require('../models/Slider');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadToCloudinary } = require('../utils/cloudinary');

// GET all public settings
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.find();
    const obj = {};
    settings.forEach(s => obj[s.key] = s.value);
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET sliders (public)
router.get('/sliders', async (req, res) => {
  try {
    const sliders = await Slider.find({ isActive: true }).sort({ order: 1 });
    res.json(sliders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all sliders (admin)
router.get('/admin/sliders', adminAuth, async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ order: 1 });
    res.json(sliders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST update settings (admin)
router.post('/update', adminAuth, async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await Settings.findOneAndUpdate({ key }, { value }, { upsert: true });
    }
    res.json({ message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST upload image to Cloudinary (admin)
router.post('/upload', adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    const result = await uploadToCloudinary(req.file.buffer, 'tournament-guru/settings');
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add slider (admin)
router.post('/sliders', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, link, order } = req.body;
    let image = req.body.image || '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'tournament-guru/sliders');
      image = result.secure_url;
    }
    if (!image) return res.status(400).json({ message: 'Image দিন' });
    const slider = await Slider.create({ title: title || '', image, link: link || '', order: parseInt(order) || 0 });
    res.status(201).json(slider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update slider (admin)
router.put('/sliders/:id', adminAuth, async (req, res) => {
  try {
    const slider = await Slider.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(slider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE slider (admin)
router.delete('/sliders/:id', adminAuth, async (req, res) => {
  try {
    await Slider.findByIdAndDelete(req.params.id);
    res.json({ message: 'Slider deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST seed default settings
router.post('/seed', adminAuth, async (req, res) => {
  try {
    const defaults = {
      appName: 'Tournament Guru', appLogo: '',
      appDescription: 'বাংলাদেশের সেরা গেমিং টুর্নামেন্ট প্ল্যাটফর্ম',
      bkashNumber: '01776469016', nagadNumber: '01983626780', rocketNumber: '019836267807',
      socialYoutube: '', socialTelegram: '', socialWhatsapp: '', socialFacebook: '',
      minAddMoney: 20, minWithdraw: 50, announcement: '',
      footerText: 'Tournament Guru. All rights reserved.',
      heroText: 'খেলো, জিতো, উপভোগ করো!',
      banner_freefire_classic: '', banner_freefire_clash: '',
      banner_freefire_1v1: '', banner_freefire_lonewolf: '',
      banner_pubg_classic: '', banner_pubg_tdm: '',
    };
    for (const [key, value] of Object.entries(defaults)) {
      await Settings.findOneAndUpdate({ key }, { value }, { upsert: true });
    }
    res.json({ message: 'Default settings seeded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
