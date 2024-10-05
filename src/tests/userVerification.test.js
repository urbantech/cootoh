const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app'); // Correct path to your Express app
const User = require('../models/user'); // Correct path to User model

describe('POST /api/users/verify', () => {
  beforeAll(async () => {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB.');
  });

  afterEach(async () => {
    console.log('Cleaning up test data...');
    await User.deleteMany({});
  });

  afterAll(async () => {
    console.log('Closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  });

  it('should verify user with valid OTP and return status 200', async () => {
    const otp = '123456'; // Explicitly set the OTP

    console.log('Creating test user with pending status...');
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      verificationStatus: 'pending',
      otp, // Set the OTP explicitly in the user object
    });

    await user.save();
    console.log('Test user created:', user);

    console.log('Expected OTP:', otp);
    console.log('User OTP in DB:', user.otp); // Confirm that the OTP is set correctly

    console.log('Verifying user:', user._id);
    const response = await request(app)
      .post('/api/users/verify')
      .send({ userId: user._id, otp }); // Send the correct OTP

    console.log('Response:', response.body);

    expect(response.status).toBe(200); // Expecting successful verification
    expect(response.body.verificationStatus).toBe('verified');
  });

  it('should return 400 for invalid OTP', async () => {
    const otp = '123456'; // Set correct OTP

    console.log('Creating test user with pending status...');
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      verificationStatus: 'pending',
      otp,
    });

    await user.save();
    console.log('Test user created:', user);

    const response = await request(app)
      .post('/api/users/verify')
      .send({ userId: user._id, otp: '654321' }); // Send incorrect OTP

    console.log('Response:', response.body);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid OTP');
  });

  it('should return 404 if user is not found', async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId();
    console.log('Sending request for non-existent user ID:', nonExistentUserId);

    const response = await request(app)
      .post('/api/users/verify')
      .send({ userId: nonExistentUserId, otp: '123456' });

    console.log('Response:', response.body);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});
