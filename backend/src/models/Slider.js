const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  image: { type: String, required: true },
  link: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Slider', sliderSchema);
