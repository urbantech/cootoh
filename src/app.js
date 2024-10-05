require('dotenv').config();
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// src/app.js
require('dotenv').config(); // Ensure dotenv is loaded

console.log('MONGO_URI:', process.env.MONGODB_URI); // Check if the variable is loaded

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is undefined. Check your .env file.');
}

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

// Export the app for testing or server start
module.exports = app;

// If not testing, start the server
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
