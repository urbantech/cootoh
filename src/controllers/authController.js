const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

// Login user function
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

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

    // Define the JWT secret key
    const JWT_SECRET = 'f44741b58cec9470159b849208262973a8ca844f84f9f6433863472828a6a952dcf6c4af630d6950daf50f228e03e43033190e4d0c77b2d8fecd278d96e5890c';

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
