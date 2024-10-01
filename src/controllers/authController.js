const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Hardcoded JWT Secret Token
const JWT_SECRET = 'f44741b58cec9470159b849208262973a8ca844f84f9f6433863472828a6a952dcf6c4af630d6950daf50f228e03e43033190e4d0c77b2d8fecd278d96e5890c';

// Login user function
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Sign a JWT token using the secret
    const token = jwt.sign(
      { user_id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Return the token
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Request password reset function
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email input
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const token = jwt.sign({ userId: user._id, resetToken }, JWT_SECRET, { expiresIn: '1h' });

    // Send email with the token using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@example.com',
        pass: 'your-email-password',
      },
    });

    const mailOptions = {
      from: 'your-email@example.com',
      to: user.email,
      subject: 'Password Reset Request',
      text: `Your password reset token: ${token}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset token sent' });
  } catch (error) {
    console.error('Error sending password reset token:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password function
exports.resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    // Validate input
    if (!token || !new_password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(new_password, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};
