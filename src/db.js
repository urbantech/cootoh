// src/db.js

const mongoose = require('mongoose');

const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 0) { // Ensure no multiple connections
    await mongoose.connect('mongodb://localhost:27017/cootoh-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  }
};

module.exports = connectToDatabase;
