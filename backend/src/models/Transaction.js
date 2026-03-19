const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['addmoney', 'withdraw', 'match_fee', 'prize', 'refund', 'admin_adjust'], 
    required: true 
  },
  amount: { type: Number, required: true },
  balanceType: { type: String, enum: ['gaming', 'winning'], required: true },
  paymentMethod: { type: String, enum: ['bkash', 'nagad', 'rocket', ''], default: '' },
  transactionId: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  note: { type: String, default: '' },
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', default: null },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  processedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
