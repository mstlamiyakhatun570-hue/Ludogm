const router = require('express').Router();
const GameCategory = require('../models/GameCategory');
const Match = require('../models/Match');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadToCloudinary } = require('../utils/cloudinary');

// GET all active categories (user)
router.get('/', auth, async (req, res) => {
  try {
    const categories = await GameCategory.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all categories (admin)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const categories = await GameCategory.find().sort({ order: 1, createdAt: 1 });
    const result = await Promise.all(categories.map(async (cat) => {
      const count = await Match.countDocuments({ game: cat.game, gameMode: cat.name, status: 'upcoming' });
      return { ...cat.toObject(), matchCount: count };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create category (admin)
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, game, order } = req.body;
    if (!name?.trim() || !game?.trim())
      return res.status(400).json({ message: 'নাম ও game দিন' });

    let image = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'tournament-guru/categories');
      image = result.secure_url;
    }

    const category = await GameCategory.create({
      name: name.trim(), game: game.trim(),
      image, order: parseInt(order) || 0
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update category (admin)
router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, game, order, isActive } = req.body;
    const update = {};
    if (name !== undefined) update.name = name.trim();
    if (game !== undefined) update.game = game.trim();
    if (order !== undefined) update.order = parseInt(order) || 0;
    if (isActive !== undefined) update.isActive = isActive === 'true' || isActive === true;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'tournament-guru/categories');
      update.image = result.secure_url;
    }

    const category = await GameCategory.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE category (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await GameCategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST seed default categories (admin)
router.post('/seed', adminAuth, async (req, res) => {
  try {
    const existing = await GameCategory.countDocuments();
    if (existing > 0) return res.json({ message: 'Categories already exist' });

    const defaults = [
      { name: 'Classic Match', game: 'FreeFire', order: 0 },
      { name: 'Clash Squad', game: 'FreeFire', order: 1 },
      { name: 'CS 1 VS 1', game: 'FreeFire', order: 2 },
      { name: 'Lone Wolf', game: 'FreeFire', order: 3 },
      { name: 'FullMap', game: 'FreeFire', order: 4 },
      { name: 'Classic', game: 'PUBG', order: 5 },
      { name: 'TDM', game: 'PUBG', order: 6 },
    ];
    await GameCategory.insertMany(defaults);
    res.json({ message: 'Default categories seeded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
