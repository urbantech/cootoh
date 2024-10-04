// src/tests/userDelete.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');

// Define the tests for deleting a user
describe('DELETE /api/users/:id', () => {
  let user;

  // Set up a test database connection
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/cootoh-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Create a test user before each test
  beforeEach(async () => {
    user = new User({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      verificationStatus: 'verified',
    });
    await user.save();
  });

  // Clear the test database after each test
  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  // Disconnect the database after all tests are complete
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test for successfully deleting a user
  it('should delete a user and return status 200', async () => {
    const response = await request(app).delete(`/api/users/${user._id}`);
    
    expect(response.status).toBe(200);  // Ensure the status is 200
    expect(response.body).toHaveProperty('message', 'User deleted successfully');  // Check the success message

    // Check if the user is actually deleted from the database
    const deletedUser = await User.findById(user._id);
    expect(deletedUser).toBeNull();  // Ensure the user is no longer in the database
  });

  // Test for when the user is not found
  it('should return 404 if user is not found', async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId();  // Correctly instantiate ObjectId using 'new'
    const response = await request(app).delete(`/api/users/${nonExistentUserId}`);
    
    expect(response.status).toBe(404);  // Ensure the status is 404
    expect(response.body).toHaveProperty('message', 'User not found');  // Check the error message
  });
});
