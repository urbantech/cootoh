// src/tests/authPasswordReset.test.js

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const User = require('../models/user');

describe('POST /api/auth/reset-password-request', () => {
    let user;

    beforeEach(async () => {
        await mongoose.connection.db.dropDatabase();
        user = new User({ email: 'test@example.com', password: 'password123', first_name: 'John', last_name: 'Doe', phone_number: '1234567890' });
        await user.save();
    });

    it('should send a password reset token via email and return status 200', async () => {
        const response = await request(app)
            .post('/api/auth/reset-password-request')
            .send({ email: 'test@example.com' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Password reset token sent');
    });

    it('should return 404 if the user is not found', async () => {
        const response = await request(app)
            .post('/api/auth/reset-password-request')
            .send({ email: 'nonexistent@example.com' });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'User not found');
    });
});
// src/tests/authPasswordReset.test.js

describe('POST /api/auth/reset-password', () => {
    it('should reset the user\'s password if the token is valid and return status 200', async () => {
        const response = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'valid-token', new_password: 'newpassword123' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Password reset successful');
    });

    it('should return 400 if the token is invalid or expired', async () => {
        const response = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'invalid-token', new_password: 'newpassword123' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Invalid or expired token');
    });
});
afterAll(async () => {
    await mongoose.connection.close(); // Close the MongoDB connection after tests
  });
  