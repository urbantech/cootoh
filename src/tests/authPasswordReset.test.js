const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Mock nodemailer to avoid real email sending during tests
jest.mock('nodemailer');
const sendMailMock = jest.fn();
nodemailer.createTransport.mockReturnValue({
  sendMail: sendMailMock,
});

// Increase Jest timeout to handle longer-running tests
jest.setTimeout(30000); // 30 seconds

describe('Password Reset API with Enhanced Logging', () => {
  let user;
  let resetToken;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/cootoh-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    user = new User({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      verificationStatus: 'verified',
    });

    resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Logging the generated token
    console.log('Generated Token (Plain):', resetToken);
    console.log('Hashed Token (Stored in DB):', user.passwordResetToken);
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should send a password reset token via email and return status 200', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: user.email });

    expect(response.status).toBe(200);
    expect(sendMailMock).toHaveBeenCalled(); // Ensure email was sent
  });

  it('should reset the password and return status 200', async () => {
    console.log('Reset Token being sent in the request:', resetToken);

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken, // Send the correct reset token
        new_password: 'newPassword123',
      });

    // Log the response status
    console.log('Response Status:', response.status);

    // Ensure the status is 200
    expect(response.status).toBe(200);

    // Fetch the updated user and log details
    const updatedUser = await User.findOne({ email: user.email });
    console.log('Updated User fetched from DB:', updatedUser);

    // Verify the password is updated
    const isMatch = await updatedUser.comparePassword('newPassword123');
    console.log('Password comparison result:', isMatch);
    expect(isMatch).toBe(true); // Ensure the password was updated
  });

  it('should return 400 if the token is invalid or expired', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: 'invalidToken123',
        new_password: 'newPassword123',
      });

    expect(response.status).toBe(400);
  });

  it('should return 404 if the user is not found', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'notfound@example.com' });

    expect(response.status).toBe(404);
  });
});
