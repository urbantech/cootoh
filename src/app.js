// src/app.js
const express = require('express');
const connectToDatabase = require('./db'); // Import the database connection function
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Connect to MongoDB
connectToDatabase('mongodb://localhost:27017/cootoh');

module.exports = app;
