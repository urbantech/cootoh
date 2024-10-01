// src/models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  phone_number: { type: String, required: true },
  verification_status: { type: String, default: 'pending' },
});

userSchema.index({ email: 1 }, { unique: true }); // Use createIndexes

const User = mongoose.model('User', userSchema);
module.exports = User;
