const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthDate: { type: Date, required: true },
  nationality: { type: String, required: true },
  biography: { type: String, required: true },
  website: { type: String },
  awards: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});
authorSchema.index({ firstName: 'text', lastName: 'text' });

module.exports = mongoose.model('Author', authorSchema);