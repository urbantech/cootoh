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
      index: true, // Adding index for performance optimization
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
    otp: { 
      type: String 
    }, // Add OTP field to store OTP
    otpExpires: { 
      type: Date 
    }, // OTP expiration date
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true } // Automatic createdAt and updatedAt fields
);

// Pre-save hook to hash the password before saving
userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      console.log('Hashing password for user:', this.email); // Log for debugging
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error); // Ensure next is called with an error in case of issues
  }
});

// Method to generate a password reset token
userSchema.methods.generatePasswordResetToken = function () {
  console.log('Generating password reset token for user:', this.email);
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hashing the token before storing it in the database
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 3600000; // Token valid for 1 hour

  console.log('Generated password reset token:', resetToken);
  return resetToken; // Return the raw reset token to be sent to the user
};

// Method to generate OTP and set expiration
userSchema.methods.generateOTP = function () {
  console.log('Generating OTP for user:', this.email);
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
  this.otp = otp;
  this.otpExpires = Date.now() + 300000; // OTP valid for 5 minutes
  console.log('Generated OTP:', otp);
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function (submittedOtp) {
  console.log('Verifying OTP for user:', this.email);
  if (this.otp === submittedOtp && this.otpExpires > Date.now()) {
    console.log('OTP verified successfully');
    return true;
  } else {
    console.log('OTP verification failed');
    return false;
  }
};

// Method to compare passwords during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password comparison result for user:', this.email, isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error comparing password for user:', this.email, error);
    throw error;
  }
};

// Indexes for optimized querying
userSchema.index({ email: 1, phoneNumber: 1 }); // Compound index for email and phone number

// Handle model creation and export
const User = mongoose.model('User', userSchema);
module.exports = User;
