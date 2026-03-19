const router = require('express').Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

// POST request add money
router.post('/addmoney', auth, async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId, accountNumber } = req.body;
    const amtNum = parseInt(amount);
    if (!amtNum || amtNum < 20) return res.status(400).json({ message: 'সর্বনিম্ন ২০ টাকা যোগ করুন' });
    if (!paymentMethod || !transactionId?.trim()) return res.status(400).json({ message: 'Payment তথ্য দিন' });

    const existing = await Transaction.findOne({ transactionId: transactionId.trim(), type: 'addmoney' });
    if (existing) return res.status(400).json({ message: 'এই Transaction ID ইতিমধ্যে ব্যবহার হয়েছে' });

    const tx = await Transaction.create({
      user: req.user._id, type: 'addmoney', amount: amtNum,
      balanceType: 'gaming', paymentMethod, transactionId: transactionId.trim(), accountNumber,
      status: 'pending', note: `${paymentMethod.toUpperCase()} থেকে ${amtNum} টাকা যোগের অনুরোধ`
    });
    res.status(201).json({ message: 'অনুরোধ পাঠানো হয়েছে। Admin অনুমোদন করলে balance যোগ হবে।', tx });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST request withdraw
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, paymentMethod, accountNumber } = req.body;
    const amtNum = parseInt(amount);
    if (!amtNum || amtNum < 50) return res.status(400).json({ message: 'সর্বনিম্ন ৫০ টাকা উত্তোলন করুন' });
    if (!paymentMethod || !accountNumber?.trim()) return res.status(400).json({ message: 'Payment তথ্য দিন' });

    const user = await User.findById(req.user._id);
    if (user.winningBalance < amtNum) return res.status(400).json({ message: 'পর্যাপ্ত Winning Balance নেই' });

    // Deduct first, then create request
    user.winningBalance -= amtNum;
    await user.save();

    const tx = await Transaction.create({
      user: req.user._id, type: 'withdraw', amount: amtNum,
      balanceType: 'winning', paymentMethod, accountNumber: accountNumber.trim(),
      status: 'pending', note: `${paymentMethod.toUpperCase()} - ${accountNumber.trim()} এ ${amtNum} টাকা উত্তোলনের অনুরোধ`
    });
    res.status(201).json({ message: 'উত্তোলনের অনুরোধ পাঠানো হয়েছে।', tx });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET user transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;
    const txs = await Transaction.find(filter).sort({ createdAt: -1 }).populate('match', 'title matchNumber');
    res.json(txs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET user transactions by userId (admin only)
router.get('/transactions/user/:userId', adminAuth, async (req, res) => {
  try {
    const txs = await Transaction.find({ user: req.params.userId }).sort({ createdAt: -1 }).populate('match', 'title matchNumber');
    res.json(txs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== ADMIN ROUTES =====

// GET all pending addmoney requests
router.get('/admin/addmoney', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { type: 'addmoney' };
    if (status) filter.status = status;
    const txs = await Transaction.find(filter).populate('user', 'name phone').sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all pending withdraw requests
router.get('/admin/withdraw', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { type: 'withdraw' };
    if (status) filter.status = status;
    const txs = await Transaction.find(filter).populate('user', 'name phone').sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST approve addmoney (admin)
router.post('/admin/addmoney/:id/approve', adminAuth, async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id).populate('user');
    if (!tx || tx.type !== 'addmoney') return res.status(404).json({ message: 'Not found' });
    if (tx.status !== 'pending') return res.status(400).json({ message: 'Already processed' });

    tx.status = 'approved';
    tx.processedBy = req.user._id;
    tx.processedAt = new Date();
    await tx.save();

    await User.findByIdAndUpdate(tx.user._id, { $inc: { gamingBalance: tx.amount } });
    res.json({ message: 'Approved! Balance added.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST reject addmoney (admin)
router.post('/admin/addmoney/:id/reject', adminAuth, async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ message: 'Not found' });
    tx.status = 'rejected';
    tx.note = req.body.note || 'Admin rejected';
    tx.processedBy = req.user._id;
    tx.processedAt = new Date();
    await tx.save();
    res.json({ message: 'Rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST approve withdraw (admin)
router.post('/admin/withdraw/:id/approve', adminAuth, async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx || tx.type !== 'withdraw') return res.status(404).json({ message: 'Not found' });
    if (tx.status !== 'pending') return res.status(400).json({ message: 'Already processed' });

    tx.status = 'approved';
    tx.processedBy = req.user._id;
    tx.processedAt = new Date();
    await tx.save();
    res.json({ message: 'Withdraw approved!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST reject withdraw (admin) - refund winning balance
router.post('/admin/withdraw/:id/reject', adminAuth, async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ message: 'Not found' });
    tx.status = 'rejected';
    tx.note = req.body.note || 'Admin rejected';
    tx.processedBy = req.user._id;
    tx.processedAt = new Date();
    await tx.save();

    // Refund winning balance
    await User.findByIdAndUpdate(tx.user, { $inc: { winningBalance: tx.amount } });
    res.json({ message: 'Rejected and refunded to winning balance' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
