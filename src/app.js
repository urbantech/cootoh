// src/app.js

const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const connectToDatabase = require('./db'); // Assuming db connection logic is in db.js

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Connect to database
connectToDatabase();

module.exports = app;
