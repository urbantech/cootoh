const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/cootoh-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase(); // Clean the database after each test
});

describe('POST /api/users/verify', () => {
  it('should verify a user with correct OTP', async () => {
    // Create a new user with an OTP
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      otp: '123456', // OTP set for the user
      verification_status: 'pending',
    });
    await user.save();

    console.log('User created:', user); // Log created user details

    // Send request to verify the user with the correct OTP
    const response = await request(app)
      .post('/api/users/verify')
      .send({
        user_id: user._id.toString(), // Correct user ID
        otp: '123456', // Correct OTP
      });

    console.log('Response for OTP verification:', response.body); // Log the response body
    console.log('Response status:', response.status); // Log the status

    // Expect the verification to succeed
    expect(response.status).toBe(200);
    expect(response.body.verificationStatus).toBe('verified');
  });

  it('should return 400 for invalid OTP', async () => {
    // Create a new user with an OTP
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      otp: '123456', // OTP set for the user
      verification_status: 'pending',
    });
    await user.save();

    console.log('User created for invalid OTP test:', user); // Log user details

    // Send request with an incorrect OTP
    const response = await request(app)
      .post('/api/users/verify')
      .send({
        user_id: user._id.toString(), // Correct user ID
        otp: 'wrongOtp', // Incorrect OTP
      });

    console.log('Response for invalid OTP:', response.body); // Log the response body
    console.log('Response status for invalid OTP:', response.status); // Log the status

    // Expect failure due to incorrect OTP
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid OTP');
  });
});
