const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const User = require('../models/user');

describe('PUT /api/users/:id', () => {
  let user;

  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect('mongodb://localhost:27017/cootoh-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase(); // Clear the database before each test
    user = new User({
      email: 'test@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '1234567890'
    });
    await user.save();
  });

  afterAll(async () => {
    // Close the database connection after all tests are done
    await mongoose.connection.close();
  });

  it('should return 200 and update user profile', async () => {
    const response = await request(app)
      .put(`/api/users/${user._id}`)
      .send({ first_name: 'Jane', last_name: 'Smith', phone_number: '9876543210' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('first_name', 'Jane');
    expect(response.body).toHaveProperty('last_name', 'Smith');
    expect(response.body).toHaveProperty('phone_number', '9876543210');
  });

  it('should return 400 if required fields are missing', async () => {
    const response = await request(app)
      .put(`/api/users/${user._id}`)
      .send({ first_name: '', last_name: '', phone_number: '' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'All fields are required');
  });

  it('should return 404 if user is not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .put(`/api/users/${nonExistentId}`)
      .send({ first_name: 'Jane', last_name: 'Smith', phone_number: '9876543210' });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'User not found');
  });
});
afterAll(async () => {
    await mongoose.connection.close(); // Close the MongoDB connection after tests
  });
  