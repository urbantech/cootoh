// src/tests/userRead.test.js

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/user');

describe('GET /api/users/:id', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb://localhost:27017/cootoh-test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  });

  beforeEach(async () => {
    // Clear the specific collection before each test instead of dropping the entire database
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Close the database connection after all tests
    await mongoose.connection.close();
  });

  it('should fetch a user by ID and return status 200', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '1234567890',
    });
    await user.save();

    const response = await request(app).get(`/api/users/${user._id}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email', 'test@example.com');
  });

  it('should return a 404 error if the user is not found', async () => {
    const nonExistentId = mongoose.Types.ObjectId();
    const response = await request(app).get(`/api/users/${nonExistentId}`);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'User not found');
  });
});
afterAll(async () => {
  await mongoose.connection.close(); // Close the MongoDB connection after tests
});
