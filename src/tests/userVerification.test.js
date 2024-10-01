const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const User = require('../models/user');

describe('POST /api/users/verify', () => {
    let user;

    beforeEach(async () => {
        await mongoose.connection.db.dropDatabase(); // Clear the test DB before each test
        user = new User({
            email: 'test@example.com',
            password: 'password123',
            first_name: 'John',
            last_name: 'Doe',
            phone_number: '1234567890',
            otp: '123456', // OTP for verification
        });
        await user.save();
    });

    afterAll(async () => {
        await mongoose.connection.close(); // Close the MongoDB connection after all tests
    });

    it('should verify user with valid OTP and return status 200', async () => {
        const response = await request(app)
            .post('/api/users/verify')
            .send({ user_id: user._id, otp: '123456' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('verification_status', 'verified');
    });

    it('should return 400 for invalid OTP', async () => {
        const response = await request(app)
            .post('/api/users/verify')
            .send({ user_id: user._id, otp: '654321' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Invalid OTP');
    });

    it('should return 404 if user is not found', async () => {
        const response = await request(app)
            .post('/api/users/verify')
            .send({ user_id: 'nonexistentUserId', otp: '123456' });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'User not found');
    });
});
