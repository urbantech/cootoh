// src/routes/userRoutes.js
const express = require('express');
const { registerUser, getUserById } = require('../controllers/userController'); // Ensure getUserById is correctly imported
const router = express.Router();

// User registration route
router.post('/register', registerUser);

// Get user by ID route
router.get('/:id', getUserById); // This should be correctly mapped now

module.exports = router;
