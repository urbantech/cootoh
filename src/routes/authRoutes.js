// src/routes/authRoutes.js

const express = require('express');
const { loginUser, requestPasswordReset, resetPassword } = require('../controllers/authController');

const router = express.Router();

// Login route
router.post('/login', loginUser);

// Password reset request route
router.post('/reset-password-request', requestPasswordReset);

// Reset password route
router.post('/reset-password', resetPassword);

module.exports = router;
