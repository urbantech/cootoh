const express = require('express');
const { registerUser, getUserById, deleteUser, updateUserById } = require('../controllers/userController'); // Ensure all functions are correctly imported
const router = express.Router();

// User registration route
router.post('/register', registerUser);

// Get user by ID route
router.get('/:id', getUserById);

// Delete user by ID route
router.delete('/:id', deleteUser); // Fixing the reference to deleteUser function

// Update user by ID route
router.put('/:id', updateUserById); // Adding updateUserById route

module.exports = router;
