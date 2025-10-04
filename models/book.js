const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String },
  averageRating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
bookSchema.index({ title: 'text', author: 'text' });

module.exports = mongoose.model('Book', bookSchema);