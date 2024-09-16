// src/tests/userRegistration.test.js
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/userModel'); // Import the User model

describe('POST /api/users/register', () => {
  // Connect to the test database once before running all tests
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/cootoh-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  // Clear the 'users' collection before each test to ensure test isolation
  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) { // 1 means connected
      await mongoose.connection.db.collection('users').deleteMany({});
      await mongoose.connection.db.collection('users').dropIndexes();
    }
  });

  // Close the database connection after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should register a new user and return status 201', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '1234567890',
        password: 'password123'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user_id');
    expect(response.body.verification_status).toBe('pending');
  });

  it('should return a 400 error if input data is invalid', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        first_name: '',
        email: 'not-an-email',
        phone_number: '1234567890'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  it('should return a 409 error if email is already registered', async () => {
    // First register the user
    await request(app)
      .post('/api/users/register')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '1234567890',
        password: 'password123'
      });

    // Attempt to register the same email again
    const response = await request(app)
      .post('/api/users/register')
      .send({
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'john.doe@example.com',
        phone_number: '0987654321',
        password: 'password456'
      });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('message');
  });
});
