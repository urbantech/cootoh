const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../app');
const User = require('../models/user');

const JWT_SECRET = 'f44741b58cec9470159b849208262973a8ca844f84f9f6433863472828a6a952dcf6c4af630d6950daf50f228e03e43033190e4d0c77b2d8fecd278d96e5890c';

describe('POST /api/auth/login', () => {
  let user;

  // Connect to the database before all tests
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/cootoh-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Clear the database before each test
  beforeEach(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }

    // Hash the password and create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    user = new User({
      email: 'test@example.com',
      password: hashedPassword,
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '1234567890',
    });
    await user.save();
  });

  // Close the database connection after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should login the user and return a JWT token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');

    // Validate the token
    const decoded = jwt.verify(response.body.token, JWT_SECRET);
    expect(decoded.email).toBe('test@example.com');
  });

  it('should return 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(401);
  });
});
afterAll(async () => {
    await mongoose.connection.close(); // Close the MongoDB connection after tests
  });
  