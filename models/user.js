const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: function() {
      return !this.githubId; // Email required only for non-GitHub users
    },
    unique: true,
    sparse: true
  },
  password: { 
    type: String, 
    required: function() {
      return !this.githubId; // Password required only for non-GitHub users
    }
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);