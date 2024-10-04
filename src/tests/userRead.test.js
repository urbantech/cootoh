const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');

describe('GET /api/users/:id', () => {
  // Increase Jest timeout to prevent timeout issues
  jest.setTimeout(10000); // 10 seconds

  let user;

  beforeAll(async () => {
    // Ensure Mongoose is connected before starting the test
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  });

  beforeEach(async () => {
    // Log that we're starting the beforeEach hook
    console.log('Starting beforeEach hook: Creating test user and clearing users collection.');

    // Clear data before each test to ensure test isolation
    await User.deleteMany({}).catch((err) => console.error('Error clearing users:', err));

    // Create a test user
    user = new User({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
    });

    await user.save().catch((err) => console.error('Error creating test user:', err));
    console.log('Test user created:', user._id);
  });

  afterEach(async () => {
    // Log that we're starting the afterEach hook
    console.log('Starting afterEach hook: Deleting all users.');
    await User.deleteMany({}).catch((err) => console.error('Error deleting users:', err));
  });

  afterAll(async () => {
    // Close Mongoose connection after all tests are done
    await mongoose.connection.close();
  });

  it('should fetch a user by ID and return status 200', async () => {
    console.log('Sending request to fetch user by ID:', user._id);

    const response = await request(app).get(`/api/users/${user._id}`);
    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id', String(user._id));
  });

  it('should return a 404 error if the user is not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId(); // Generate a new ObjectId
    console.log('Sending request for non-existent user ID:', nonExistentId);

    const response = await request(app).get(`/api/users/${nonExistentId}`);
    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'User not found');
  });
});
