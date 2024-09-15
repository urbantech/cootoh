// src/tests/userRegistration.test.js
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const chai = require('chai');
const expect = chai.expect;

describe('POST /api/users/register', () => {
  before((done) => {
    mongoose.connect('mongodb://localhost:27017/cootoh-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }, () => done());
  });

  after((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(() => done());
    });
  });

  it('should register a new user and return status 201', (done) => {
    request(app)
      .post('/api/users/register')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '1234567890',
        password: 'password123'
      })
      .expect('Content-Type', /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('user_id');
        expect(res.body.verification_status).to.equal('pending');
        done();
      });
  });

  it('should return a 400 error if input data is invalid', (done) => {
    request(app)
      .post('/api/users/register')
      .send({
        first_name: '',
        email: 'not-an-email',
        phone_number: '1234567890'
      })
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('message');
        done();
      });
  });

  it('should return a 409 error if email is already registered', (done) => {
    // First register the user
    request(app)
      .post('/api/users/register')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '1234567890',
        password: 'password123'
      })
      .end(() => {
        // Attempt to register the same email again
        request(app)
          .post('/api/users/register')
          .send({
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'john.doe@example.com',
            phone_number: '0987654321',
            password: 'password456'
          })
          .expect(409)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.have.property('message');
            done();
          });
      });
  });
});
