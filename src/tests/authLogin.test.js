const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');

// Increase Jest timeout for longer tests
jest.setTimeout(30000);

describe('User Login API', () => {
  let user;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/cootoh-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    user = new User({
      email: 'test@example.com',
      password: 'password123',  // Plain text password
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      verificationStatus: 'verified',
    });

    // Save user with hashed password
    await user.save();
    console.log('Test user created:', user);
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase(); // Clean up after each test
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should login a user with valid credentials and return a token', async () => {
    const response = await request(app)
      .post('/api/auth/login') // Ensure the correct login route
      .send({
        email: 'test@example.com',
        password: 'password123',  // Ensure this matches the plain text used in user creation
      });

    console.log('Response:', response.body);

    // Ensure login succeeds and a token is returned
    expect(response.status).toBe(200);  // Check for successful login
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
  });
});
