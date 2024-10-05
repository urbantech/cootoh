const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app'); // Assuming your Express app is exported from this file
const User = require('../models/user');

jest.setTimeout(30000); // Extend Jest timeout to 30 seconds

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cootoh-test';
  console.log('MONGO_URI:', mongoUri);

  if (mongoose.connection.readyState === 0) {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).catch((error) => console.error('Error connecting to MongoDB:', error));
    console.log('Connected to MongoDB.');
  }
});

afterEach(async () => {
  console.log('Cleaning up users collection after test');
  await User.deleteMany({}).catch((err) => console.error('Error cleaning up users:', err));
});

afterAll(async () => {
  console.log('Closing MongoDB connection...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
});

describe('POST /api/users/register', () => {
  it('should register a new user and return status 201', async () => {
    const newUser = {
      email: 'testuser@example.com',
      password: 'testpassword',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '1234567890',
    };

    const response = await request(app).post('/api/users/register').send(newUser);
    console.log('Response:', response.body);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully, please verify your email.');
  });

  it('should return a 400 error if input data is invalid', async () => {
    const invalidUser = {
      email: 'invalidemail.com',
      password: 'short',
      firstName: '',
      lastName: '',
      phoneNumber: '12345',
    };

    const response = await request(app).post('/api/users/register').send(invalidUser);
    console.log('Response:', response.body);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('All fields are required');
  });

  it('should return a 409 error if email is already registered', async () => {
    // First, create a user
    const existingUser = new User({
      email: 'duplicateuser@example.com',
      password: 'testpassword',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '1234567890',
    });
    await existingUser.save();

    // Try registering the same user again
    const response = await request(app).post('/api/users/register').send({
      email: 'duplicateuser@example.com',
      password: 'testpassword',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '1234567890',
    });
    console.log('Response:', response.body);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('User already exists');
  });
});
