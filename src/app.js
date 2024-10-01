// src/app.js

const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const connectToDatabase = require('./db'); // Assuming db connection logic is in db.js
const authRoutes = require('./routes/authRoutes'); // Add this line

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes); // Add this line for auth routes

// Connect to database
connectToDatabase();

module.exports = app;
