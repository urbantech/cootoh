const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // Importing crypto for token generation

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified'],
      default: 'pending',
    },
    // Adding fields for password reset functionality
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);

// Pre-save hook to hash the password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    console.log('Hashing password for user:', this.email); // Debugging log
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 3600000; // 1 hour expiration

  return resetToken;
};

// Method to compare the password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
