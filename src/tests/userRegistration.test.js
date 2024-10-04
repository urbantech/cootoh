const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');

describe('POST /api/users/register', () => {
  // Increase the Jest timeout
  jest.setTimeout(30000); // Set timeout to 30 seconds

  beforeAll(async () => {
    // Ensure the MongoDB connection is established before starting the tests
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
    }
  });

  beforeEach(async () => {
    // Clear the data before each test
    console.log('Clearing users collection before test');
    await User.deleteMany({}).catch((err) => console.error('Error clearing users:', err));
  });

  afterEach(async () => {
    // Clean up after each test
    console.log('Cleaning up users collection after test');
    await User.deleteMany({}).catch((err) => console.error('Error cleaning up users:', err));
  });

  afterAll(async () => {
    // Close MongoDB connection after all tests are done
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  });

  it('should register a new user and return status 201', async () => {
    console.log('Starting user registration test');
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
    };

    const response = await request(app).post('/api/users/register').send(userData);
    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully, please verify your email.');
  });

  it('should return a 400 error if input data is invalid', async () => {
    console.log('Starting invalid input data test');
    const userData = {
      email: '',
      password: '',
    };

    const response = await request(app).post('/api/users/register').send(userData);
    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All fields are required');
  });

  it('should return a 409 error if email is already registered', async () => {
    console.log('Starting duplicate email registration test');
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
    };

    // Register the user for the first time
    await new User(userData).save().catch((err) => console.error('Error saving user:', err));
    console.log('User registered for the first time');

    // Try to register the same user again
    const response = await request(app).post('/api/users/register').send(userData);
    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('User already exists');
  });
});
