const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  promoCode: { type: String, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  gamingBalance: { type: Number, default: 0 },
  winningBalance: { type: Number, default: 0 },
  totalWin: { type: Number, default: 0 },
  totalKills: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  avatar: { type: String, default: '' },
  fcmToken: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
