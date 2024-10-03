// src/db.js

const mongoose = require('mongoose');

const connectToDatabase = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cootoh');

  // Wait for the connection to be established
  await mongoose.connection.asPromise();
  console.log('Connected to MongoDB');
};

module.exports = connectToDatabase;
