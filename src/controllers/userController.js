const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const mongoose = require('mongoose');
require('dotenv').config();

// Register user function
exports.registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ email, password, firstName, lastName, phoneNumber });
    await user.save();

    console.log('New user registered:', user.email);
    res.status(201).json({ message: 'User registered successfully, please verify your email.' });
  } catch (error) {
    console.error('Error during user registration:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

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
    if (!user || user.verificationStatus !== 'verified') {
      console.log('Invalid login attempt for:', email);
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid password attempt for:', email);
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('User logged in:', email);
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Verify user function
exports.verifyUser = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    console.log('Verifying user:', userId);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid user ID format:', userId);
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found for verification:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate OTP (add expiration logic if applicable)
    if (String(user.otp) !== String(otp)) {
      console.log('Invalid OTP for user:', userId);
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark user as verified
    user.verificationStatus = 'verified';
    await user.save();

    console.log('User verified successfully:', userId);
    res.status(200).json({ verificationStatus: 'verified' });
  } catch (error) {
    console.error('Error during user verification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID function
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid user ID format:', id);
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find the user by ID
    const user = await User.findById(id).select('-password -otp');
    if (!user) {
      console.log('User not found:', id);
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile function
exports.updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Prevent updating sensitive fields
    delete updates.password;
    delete updates.otp;
    delete updates.verificationStatus;

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'phoneNumber'];
    const missingFields = requiredFields.filter((field) => !updates[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      context: 'query',
    }).select('-password -otp');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User updated successfully:', id);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user function
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User deleted:', id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
