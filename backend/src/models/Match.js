const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  game: { type: String, required: true },
  gameMode: { type: String, required: true },
  map: { type: String, default: 'Bermuda' },
  entryType: { type: String, enum: ['Solo', 'Duo', 'Squad'], default: 'Solo' },
  entryFee: { type: Number, required: true, min: 0 },
  totalPrize: { type: Number, required: true, min: 0 },
  perKillPrize: { type: Number, default: 0 },
  prizeNote: { type: String, default: '' },
  maxSlots: { type: Number, required: true, default: 20 },
  matchTime: { type: Date, required: true },
  roomId: { type: String, default: '' },
  roomPassword: { type: String, default: '' },
  roomNote: { type: String, default: '' },
  banner: { type: String, default: '' },
  status: {
    type: String,
    enum: ['upcoming', 'running', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    resultScreenshot: { type: String, default: '' },
    kills: { type: Number, default: 0 },
    position: { type: Number, default: 0 },
    prize: { type: Number, default: 0 },
    resultStatus: {
      type: String,
      enum: ['pending', 'submitted', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  matchNumber: { type: Number, unique: true },
}, { timestamps: true });

// Auto increment match number safely
matchSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const lastMatch = await mongoose.model('Match').findOne().sort({ matchNumber: -1 }).select('matchNumber');
      this.matchNumber = lastMatch?.matchNumber ? lastMatch.matchNumber + 1 : 1001;
    } catch {
      this.matchNumber = Date.now(); // fallback
    }
  }
  next();
});

matchSchema.index({ game: 1, gameMode: 1, status: 1 });

module.exports = mongoose.model('Match', matchSchema);
