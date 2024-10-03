const express = require('express');
const {
  registerUser,
  loginUser,
  verifyUser,
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
router.post('/verify', verifyUser);

// Get user by ID
router.get('/:id', getUserById);

// Update user profile
router.put('/:id', updateUserProfile);

// Delete user
router.delete('/:id', deleteUser);

module.exports = router;
