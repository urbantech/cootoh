const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const User = require('../models/user');

describe('PUT /api/users/:id', () => {
    let user;

    // Connect to the test database before running the tests
    beforeAll(async () => {
        await mongoose.connect('mongodb://localhost:27017/cootoh-test', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false // Add this to avoid the deprecation warning
        });
    });

    // Clear the test database before each test
    beforeEach(async () => {
        const db = mongoose.connection.db;
        if (db) {
            await db.dropDatabase(); // Ensure the test DB is cleared before each test
        }
        user = new User({ email: 'test@example.com', password: 'password123', first_name: 'John', last_name: 'Doe', phone_number: '1234567890' });
        await user.save(); // Save user before running tests
    });

    // Close the database connection after all tests
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should update a user and return status 200', async () => {
        const response = await request(app)
            .put(`/api/users/${user._id}`)
            .send({ email: 'updated@example.com', first_name: 'Updated', last_name: 'User', phone_number: '9876543210' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('email', 'updated@example.com');
    });

    it('should return 404 if user is not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .put(`/api/users/${nonExistentId}`)
            .send({ email: 'updated@example.com', first_name: 'Updated', last_name: 'User', phone_number: '9876543210' });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'User not found');
    });
});
