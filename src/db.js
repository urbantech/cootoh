// src/db.js
const mongoose = require('mongoose');

const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 0) { // Only connect if not already connected
    try {
      await mongoose.connect('mongodb://localhost:27017/cootoh-test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Connected to database');
    } catch (error) {
      console.error('Error connecting to database:', error);
    }
  }
};

module.exports = connectToDatabase;
