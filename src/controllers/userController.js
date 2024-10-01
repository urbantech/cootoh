// src/controllers/userController.js
const User = require('../models/user');

// Register user function (already defined)
exports.registerUser = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone_number } = req.body;

    if (!email || !password || !first_name || !last_name || !phone_number) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const newUser = new User({ email, password, first_name, last_name, phone_number });
    await newUser.save();

    res.status(201).json({ user_id: newUser._id, verification_status: 'pending' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID function
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
