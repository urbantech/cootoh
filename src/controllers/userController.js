const User = require('../models/user');

// Register user function
exports.registerUser = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone_number } = req.body;

    // Check if all required fields are provided
    if (!email || !password || !first_name || !last_name || !phone_number) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Create and save the new user
    const newUser = new User({ email, password, first_name, last_name, phone_number });
    await newUser.save();

    res.status(201).json({ user_id: newUser._id, verification_status: 'pending' });
  } catch (error) {
    console.error('Error registering user:', error);
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
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user function
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user by ID function
exports.updateUserById = async (req, res) => {
  try {
    const { email, first_name, last_name, phone_number } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { email, first_name, last_name, phone_number },
      { new: true, runValidators: true } // Return the updated user and validate input
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
