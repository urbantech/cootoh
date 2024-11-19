const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user'); // Update the path for the User model

// Increase Jest timeout for longer-running tests
jest.setTimeout(30000); // 30 seconds

describe('PUT /api/users/:id', () => {
  let user;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/cootoh-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    // Create a test user
    user = new User({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      verificationStatus: 'verified',
    });
    await user.save();
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test case for updating the user profile successfully
  it('should return 200 and update user profile', async () => {
    console.log('Sending request to update profile...');

    const response = await request(app)
      .put(`/api/users/${user._id}`)
      .send({
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
        phoneNumber: '0987654321',
      });

    console.log('Response received for profile update:', response.body);
    console.log('Response status:', response.status);

    expect(response.status).toBe(200);
    expect(response.body.firstName).toBe('UpdatedFirstName');
    expect(response.body.lastName).toBe('UpdatedLastName');
    expect(response.body.phoneNumber).toBe('0987654321');
  });

  // Test case for handling missing required fields
  it('should return 400 if required fields are missing', async () => {
    console.log('Sending request with missing fields...');

    const response = await request(app)
      .put(`/api/users/${user._id}`)
      .send({
        phoneNumber: '0987654321', // Missing firstName and lastName
      });

    console.log('Response received for missing fields:', response.body);
    console.log('Response status:', response.status);

    expect(response.status).toBe(400); // Expect validation error
    expect(response.body.message).toContain('Missing required fields');
  });

  // Test case for non-existent user update
  it('should return 404 if user is not found', async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId();

    console.log('Sending request to update non-existent user...');

    const response = await request(app)
      .put(`/api/users/${nonExistentUserId}`)
      .send({
        firstName: 'NonExistent',
        lastName: 'User',
        phoneNumber: '1234567890',
      });

    console.log('Response received for non-existent user update:', response.body);
    console.log('Response status:', response.status);

    expect(response.status).toBe(404); // Expect not found error
    expect(response.body.message).toBe('User not found');
  });
});
