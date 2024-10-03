// src/tests/userLogin.test.js

const mongoose = require('mongoose');
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const User = require('../models/user');

describe('User Login API', () => {
  let user;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/cootoh-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();

    // Hash the test user's password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create a test user with a properly hashed password
    user = new User({
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      verificationStatus: 'verified',
    });

    await user.save();

    console.log('Test user created:', user); // Log the created user for debugging
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should login a user with valid credentials and return a token', async () => {
    const loginCredentials = {
      email: 'test@example.com',
      password: 'password123', // Use the same password as saved in the user
    };

    const response = await request(app)
      .post('/api/users/login')
      .send(loginCredentials);

    console.log('Response:', response.body); // Log response for debugging

    // Ensure login succeeds and a token is returned
    expect(response.status).toBe(200);  // Check for successful login
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
  });
});
