const express = require('express');
const { registerUser, getUserById, updateUserProfile, deleteUser } = require('../controllers/userController');
const router = express.Router();

// User registration route
router.post('/register', registerUser);

// Get user by ID route
router.get('/:id', getUserById);

// Update user profile route
router.put('/:id', updateUserProfile);

// Delete user by ID route
router.delete('/:id', deleteUser);

module.exports = router;
