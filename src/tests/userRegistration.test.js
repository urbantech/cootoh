// src/tests/userRegistration.test.js
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const User = require('../models/user');

describe('POST /api/users/register', () => {
  beforeEach(async () => {
    // Clear data before each test to ensure test isolation
    await User.deleteMany({});
  });

  it('should register a new user and return status 201', async () => {
    const response = await request(app).post('/api/users/register').send({
      email: 'test@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '1234567890',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user_id');
    expect(response.body.verification_status).toBe('pending');
  });

  it('should return a 400 error if input data is invalid', async () => {
    const response = await request(app).post('/api/users/register').send({
      email: 'invalid-email', // Invalid email format
      password: '',
      first_name: 'John',
      last_name: 'Doe',
    });

    expect(response.status).toBe(400); // Ensure it returns a bad request
    expect(response.body).toHaveProperty('message');
  });

  it('should return a 409 error if email is already registered', async () => {
    // First, register a user
    await request(app).post('/api/users/register').send({
      email: 'test@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '1234567890',
    });

    // Try to register with the same email again
    const response = await request(app).post('/api/users/register').send({
      email: 'test@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '1234567890',
    });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('message');
  });
});
afterAll(async () => {
  await mongoose.connection.close(); // Close the MongoDB connection after tests
});
