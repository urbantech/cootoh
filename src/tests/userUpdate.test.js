const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app'); // Your Express app
const User = require('../models/user'); // User model

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
        // Create a test user
        user = new User({
            email: 'test@example.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '1234567890',
        });
        await user.save();
    });

    afterEach(async () => {
        // Clean up after each test
        await User.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should update a user and return status 200', async () => {
        const updatedData = {
            firstName: 'UpdatedJohn',
            lastName: 'UpdatedDoe',
            phoneNumber: '0987654321',
        };

        const response = await request(app)
            .put(`/api/users/${user._id}`)
            .send(updatedData);

        expect(response.status).toBe(200);
        expect(response.body.firstName).toBe(updatedData.firstName);
        expect(response.body.lastName).toBe(updatedData.lastName);
        expect(response.body.phoneNumber).toBe(updatedData.phoneNumber);
    });

    it('should return 404 if user is not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .put(`/api/users/${nonExistentId}`)
            .send({
                firstName: 'TestFirst',
                lastName: 'TestLast',
                phoneNumber: '1234567890',
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });
});
