const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app'); // Assuming your Express app is exported from this file
const User = require('../models/user');

jest.setTimeout(30000); // Set a longer timeout for all tests

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
  console.log('Starting afterEach hook: Deleting all users.');
  await User.deleteMany({}).then(() => console.log('All users deleted.')).catch((err) => console.error('Error deleting users:', err));
});

afterAll(async () => {
  console.log('Closing MongoDB connection...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
});

describe('GET /api/users/:id', () => {
  it('should fetch a user by ID and return status 200', async () => {
    console.log('Creating test user...');
    const user = new User({
      email: 'testuser@example.com',
      password: 'testpassword',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '1234567890',
    });
    await user.save();

    const response = await request(app).get(`/api/users/${user._id}`);
    console.log('Response:', response.body);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(user.email);
  });

  it('should return a 404 error if the user is not found', async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId();
    console.log('Testing with non-existent user ID:', nonExistentUserId);

    const response = await request(app).get(`/api/users/${nonExistentUserId}`);
    console.log('Response received for non-existent user:', response.body);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});
