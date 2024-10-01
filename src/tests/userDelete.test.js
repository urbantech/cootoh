// src/tests/userDelete.test.js
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const User = require('../models/user');

describe('DELETE /api/users/:id', () => {
    let user;

    beforeAll(async () => {
        await mongoose.connect('mongodb://localhost:27017/cootoh-test', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }); // Ensure DB connection before tests
    });

    beforeEach(async () => {
        await mongoose.connection.db.dropDatabase(); // Clear test DB
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
        await mongoose.disconnect(); // Close DB connection after tests
    });

    it('should delete a user and return status 200', async () => {
        const response = await request(app)
            .delete(`/api/users/${user._id}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'User deleted successfully');
    });

    it('should return 404 if user is not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .delete(`/api/users/${nonExistentId}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'User not found');
    });
});
afterAll(async () => {
    await mongoose.connection.close(); // Close the MongoDB connection after tests
  });
  