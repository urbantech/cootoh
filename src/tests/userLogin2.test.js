// src/tests/userLogin2.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // Adjust the path if necessary
const User = require('../models/user');
const nodemailer = require('nodemailer');

// Mock nodemailer
jest.mock('nodemailer');
const sendMailMock = jest.fn().mockResolvedValue(true);
nodemailer.createTransport.mockReturnValue({
  sendMail: sendMailMock,
});

describe('User Login API', () => {
  let user;

  beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect('mongodb://localhost:27017/cootoh-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    // Clear the database before each test
    await mongoose.connection.db.dropDatabase();

    // Create a verified test user with plaintext password
    user = new User({
      email: 'test@example.com',
      password: 'password123', // Plaintext password
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      verificationStatus: 'verified',
    });

    await user.save();
    console.log('Test user created:', user);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should login a user with valid credentials and return a token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    console.log('Response:', response.body);

    // Check for success
    expect(response.status).toBe(200); // Ensure the login is successful
    expect(response.body).toHaveProperty('token'); // Ensure a token is returned
    expect(typeof response.body.token).toBe('string'); // Token should be a string
  });

  it('should return 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    console.log('Response:', response.body);

    // Check for invalid credentials
    expect(response.status).toBe(401); // Should return 401 for invalid credentials
    expect(response.body).toHaveProperty('message', 'Invalid email or password.');
  });

  it('should return 401 if the user is not verified', async () => {
    const unverifiedUser = new User({
      email: 'unverified@example.com',
      password: 'password123', // Plaintext password
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '1234567891',
      verificationStatus: 'pending', // Unverified user
    });

    await unverifiedUser.save();
    console.log('Unverified user created:', unverifiedUser);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'unverified@example.com', password: 'password123' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid email or password.');
  });

  it('should return 400 if email is missing in the login request', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' }); // No email provided

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Email and password are required.');
  });

  it('should return 400 if password is missing in the login request', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' }); // No password provided

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Email and password are required.');
  });

  it('should request a password reset for a verified user', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'test@example.com' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Password reset token sent.');
    expect(sendMailMock).toHaveBeenCalled(); // Ensure the mock email function was called
  });
});
