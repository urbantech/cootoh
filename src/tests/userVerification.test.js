const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app'); // Import your express app
const User = require('../models/user'); // Import the user model

// Set Jest timeout to 30 seconds
jest.setTimeout(30000);

describe('POST /api/users/verify', () => {
  let user;
  const otp = '123456'; // Mock OTP for verification

  beforeAll(async () => {
    // Connect to MongoDB test database
    await mongoose.connect('mongodb://localhost:27017/cootoh-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  });

  beforeEach(async () => {
    // Clear the test database to ensure each test runs in isolation
    await mongoose.connection.db.dropDatabase();

    // Create a mock user with OTP
    user = new User({
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      otp: otp,
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '1234567890',
      verification_status: 'pending',
    });
    await user.save();
  });

  afterAll(async () => {
    // Close the MongoDB connection after tests
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  });

  it('should verify user with valid OTP and return status 200', async () => {
    const response = await request(app)
      .post('/api/users/verify')
      .send({ user_id: user._id.toString(), otp: '123456' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('verification_status', 'verified');
  });

  it('should return 400 for invalid OTP', async () => {
    const response = await request(app)
      .post('/api/users/verify')
      .send({ user_id: user._id.toString(), otp: '654321' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Invalid OTP');
  });

  it('should return 404 if user is not found', async () => {
    const nonExistentId = mongoose.Types.ObjectId();
    const response = await request(app)
      .post('/api/users/verify')
      .send({ user_id: nonExistentId, otp: '123456' });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'User not found');
  });
});
