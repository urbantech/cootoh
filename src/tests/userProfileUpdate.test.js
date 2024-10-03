const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const User = require('../models/user');

describe('PUT /api/users/:id', () => {
  let user;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/cootoh-test');
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();

    user = new User({
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      phoneNumber: '1234567890', // Use camelCase
      verification_status: 'verified',
    });

    await user.save();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should return 200 and update user profile', async () => {
    const updates = {
      first_name: 'Jane',
      last_name: 'Smith',
      phoneNumber: '0987654321', // Include phoneNumber
    };

    const response = await request(app)
      .put(`/api/users/${user._id}`)
      .send(updates);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      first_name: 'Jane',
      last_name: 'Smith',
      phoneNumber: '0987654321',
    });
  });

  it('should return 400 if required fields are missing', async () => {
    const updates = {
      first_name: 'Jane',
      // last_name and phoneNumber are missing
    };

    const response = await request(app)
      .put(`/api/users/${user._id}`)
      .send(updates);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  it('should return 404 if user is not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const updates = {
      first_name: 'Jane',
      last_name: 'Smith',
      phoneNumber: '0987654321',
    };

    const response = await request(app)
      .put(`/api/users/${nonExistentId}`)
      .send(updates);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'User not found');
  });
});
