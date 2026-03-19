const mongoose = require('mongoose');

const gameCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  game: { type: String, required: true }, // FreeFire, PUBG, etc.
  image: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('GameCategory', gameCategorySchema);
