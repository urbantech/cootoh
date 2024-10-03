// src/controllers/userController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const mongoose = require('mongoose');
require('dotenv').config();

// Register user function
exports.registerUser = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phoneNumber } = req.body;

    // Validate input
    if (!email || !password || !first_name || !last_name || !phoneNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      first_name,
      last_name,
      phoneNumber,
    });

    await user.save();

    // TODO: Implement OTP generation and sending

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

    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists and is verified
    if (!user || user.verification_status !== 'verified') {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with the token
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Verify user function
exports.verifyUser = async (req, res) => {
  try {
    const { user_id, otp } = req.body;

    // Ensure user_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find the user by ID
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure OTPs are compared as strings
    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark user as verified
    user.verification_status = 'verified';
    await user.save();

    // Respond with success
    return res.status(200).json({ verification_status: 'verified' });
  } catch (error) {
    console.error('Error during user verification:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID function
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find the user by ID
    const user = await User.findById(id).select('-password -otp'); // Exclude sensitive fields
    if (!user) {
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
    delete updates.verification_status;

    // **Add validation for required fields**
    const requiredFields = ['first_name', 'last_name', 'phoneNumber'];
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
      context: 'query', // Necessary for validation in update operations
    }).select('-password -otp');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

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

    // Ensure id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
