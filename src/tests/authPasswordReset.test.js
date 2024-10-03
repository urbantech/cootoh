// src/tests/authPasswordReset.test.js

const mongoose = require('mongoose');
const request = require('supertest');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const app = require('../app');
const User = require('../models/user');

// Mock nodemailer
jest.mock('nodemailer');
const sendMailMock = jest.fn();
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

// Hardcoded JWT Secret Key (same as in authController.js)
const JWT_SECRET = 'f44741b58cec9470159b849208262973a8ca844f84f9f6433863472828a6a952dcf6c4af630d6950daf50f228e03e43033190e4d0c77b2d8fecd278d96e5890c';

describe('Password Reset API', () => {
  let user;
  let resetToken;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/cootoh-test');
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();

    const hashedPassword = await bcrypt.hash('password123', 10);
    user = new User({
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      verificationStatus: 'verified',
    });
    await user.save();

    // Clear the mock email sending
    sendMailMock.mockClear();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should send a password reset token via email and return status 200', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: user.email });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Password reset token sent.');
    expect(sendMailMock).toHaveBeenCalled(); // Ensure the mock email function was called
  });

  it('should reset the password and return status 200', async () => {
    // Generate a reset token as the controller does
    resetToken = user.generatePasswordResetToken();
    await user.save();

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: resetToken, new_password: 'newPassword123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Password reset successful.');

    // Verify that the password has been updated
    const updatedUser = await User.findOne({ email: user.email });
    const isMatch = await updatedUser.comparePassword('newPassword123');
    expect(isMatch).toBe(true);
  });

  it('should return 400 if the token is invalid or expired', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'invalid-token', new_password: 'newPassword123' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Invalid or expired token.');
  });

  it('should return 404 if the user is not found', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'User not found.');
  });
});

afterAll(async () => {
  await mongoose.connection.close(); // Close the MongoDB connection after tests
});