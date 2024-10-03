// src/app.js

require('dotenv').config();
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev')); // Request logging
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS

// Routes
app.use('/api/auth', authRoutes); // Use authentication routes
app.use('/api/users', userRoutes); // Use user routes

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
