// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Hardcoded JWT Secret Key (Use a placeholder or ensure it's securely stored in production)
const JWT_SECRET = 'f44741b58cec9470159b849208262973a8ca844f84f9f6433863472828a6a952dcf6c4af630d6950daf50f228e03e43033190e4d0c77b2d8fecd278d96e5890c';

require('dotenv').config();

// Login user function
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists and is verified
    if (!user || user.verificationStatus !== 'verified') {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare passwords using method from user model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const payload = { userId: user._id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // Return the token
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Request password reset function
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email input
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token and set expiration
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = Date.now() + 3600000; // Token valid for 1 hour

    await user.save();

    // Send email with the reset token
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password?token=${resetToken}`;
    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a POST request to: \n\n ${resetUrl}`;

    // Configure nodemailer using environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      text: message,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset token sent.' });
  } catch (error) {
    console.error('Error sending password reset token:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Reset password function
exports.resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    // Validate input
    if (!token || !new_password) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    // Hash the token
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by token and check if token is not expired
    const user = await User.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // Update password and ensure it gets hashed via pre-save hook
    user.password = new_password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
