// src/routes/authRoutes.js

const express = require('express');
const { loginUser, requestPasswordReset, resetPassword } = require('../controllers/authController'); // Correct import

const router = express.Router();

// Login route
router.post('/login', loginUser);

// Password reset request route
router.post('/forgot-password', requestPasswordReset);

// Reset password route
router.post('/reset-password', resetPassword);

module.exports = router;
