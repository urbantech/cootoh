// src/models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Unique constraint
  phone_number: { type: String, required: true },
  password: { type: String, required: true },
  verification_status: { type: String, default: 'pending' }
});

// Ensure the unique index is created
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
