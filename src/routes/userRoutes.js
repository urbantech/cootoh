// src/routes/userRoutes.js
const express = require('express');
const { registerUser, getUserById, updateUserProfile, deleteUser, verifyUser } = require('../controllers/userController');

const router = express.Router();

router.post('/register', registerUser);
router.get('/:id', getUserById);
router.put('/:id', updateUserProfile);
router.delete('/:id', deleteUser);
router.post('/verify', verifyUser);

module.exports = router;
