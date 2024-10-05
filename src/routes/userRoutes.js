const express = require('express');
const {
  registerUser,
  loginUser,
  verifyUser, // You are already importing verifyUser here
  getUserById,
  updateUserProfile,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

// User registration
router.post('/register', registerUser);

// User login
router.post('/login', loginUser);

// User verification
router.post('/verify', verifyUser); // This is the correct route for verification

// Get user by ID
router.get('/:id', getUserById);

// Update user profile
router.put('/:id', updateUserProfile);

// Delete user
router.delete('/:id', deleteUser);

module.exports = router;
