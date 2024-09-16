// src/controllers/userController.js
const User = require('../models/userModel');

exports.registerUser = async (req, res) => {
  const { first_name, last_name, email, phone_number, password } = req.body;

  // Validate input
  if (!first_name || !last_name || !email || !phone_number || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Create new user
    const newUser = new User({
      first_name,
      last_name,
      email,
      phone_number,
      password, // Note: In a real-world scenario, hash the password
    });

    await newUser.save();
    res.status(201).json({ user_id: newUser._id, verification_status: newUser.verification_status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
