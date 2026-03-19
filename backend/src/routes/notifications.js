const router = require('express').Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const { sendToToken, sendToMultiple } = require('../utils/firebase');

// GET user notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { type: 'global' },
        { type: 'personal', targetUser: req.user._id }
      ]
    }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      $or: [
        { type: 'global' },
        { type: 'personal', targetUser: req.user._id }
      ],
      readBy: { $ne: req.user._id }
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST save FCM token
router.post('/fcm-token', auth, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token required' });
    await User.findByIdAndUpdate(req.user._id, { fcmToken: token });
    res.json({ message: 'FCM token saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST mark as read
router.post('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      $addToSet: { readBy: req.user._id }
    });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST mark all as read
router.post('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        $or: [{ type: 'global' }, { type: 'personal', targetUser: req.user._id }],
        readBy: { $ne: req.user._id }
      },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create & send notification (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title, message, type, targetUser } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Title ও message দিন' });

    // Save to DB
    const notification = await Notification.create({
      title, message, type, targetUser: targetUser || null
    });

    // Send FCM push notification
    if (type === 'global') {
      // Get ALL users with FCM tokens
      const users = await User.find({ fcmToken: { $ne: '' }, isActive: true }).select('fcmToken');
      const tokens = users.map(u => u.fcmToken).filter(Boolean);
      if (tokens.length > 0) {
        await sendToMultiple(tokens, title, message);
        console.log(`📤 Sent to ${tokens.length} users`);
      }
    } else if (type === 'personal' && targetUser) {
      const user = await User.findById(targetUser).select('fcmToken');
      if (user?.fcmToken) {
        await sendToToken(user.fcmToken, title, message);
      }
    }

    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update notification (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { title, message } = req.body;
    const notification = await Notification.findByIdAndUpdate(
      req.params.id, { title, message }, { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE notification (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
