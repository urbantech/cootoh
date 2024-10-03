// src/tests/userLogin.test.js

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const User = require('../models/user'); // Ensure correct path and capitalization

describe('User Login API', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/cootoh-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();

    const user = new User({
      email: 'test@example.com',
      password: 'password123', // Provide plaintext password
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      verificationStatus: 'verified',
    });
    await user.save();

    console.log('Test user created:', user);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should login a user with valid credentials and return a token', async () => {
    const response = await request(app)
      .post('/api/auth/login') // Ensure the correct route
      .send({ email: 'test@example.com', password: 'password123' });

    console.log('Response:', response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
  });

  it('should return 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid email or password.');
  });
});
