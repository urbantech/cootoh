import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  registerUser,
  loginUser,
  getUserById,
  updateUserProfile,
  resetPassword,
  verifyUser,
  deleteUser,
  setAuthToken,
  clearAuthToken,
  getAuthToken,
} from '../apiclient'; // Ensure the correct path

// Mock localStorage for the Node environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => store[key] = value.toString(),
    removeItem: (key) => delete store[key],
    clear: () => store = {},
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('apiclient', () => {
  let mock;

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
    clearAuthToken();
  });

  afterAll(() => {
    mock.restore();
  });

  test('registerUser - should register a user successfully', async () => {
    const mockResponse = { message: 'User registered successfully' };
    mock.onPost('http://localhost:3000/api/users/register').reply(201, mockResponse); // Use full path

    const response = await registerUser('test@example.com', 'password', 'John', 'Doe');
    expect(response).toEqual(mockResponse);
  });

  test('registerUser - should handle registration failure', async () => {
    mock.onPost('http://localhost:3000/api/users/register').reply(400, { message: 'Registration failed' });

    await expect(registerUser('test@example.com', 'password', 'John', 'Doe')).rejects.toThrow(
      'Registration failed'
    );
  });

  test('loginUser - should login successfully and store the token', async () => {
    const mockResponse = { token: 'mock-token' };
    mock.onPost('http://localhost:3000/api/auth/login').reply(200, mockResponse); // Use full path

    const token = await loginUser('test@example.com', 'password');
    expect(token).toBe(mockResponse.token);
    expect(getAuthToken()).toBe(mockResponse.token);
  });

  test('loginUser - should handle login failure', async () => {
    mock.onPost('http://localhost:3000/api/auth/login').reply(401, { message: 'Login failed' });

    await expect(loginUser('test@example.com', 'wrongpassword')).rejects.toThrow('Login failed');
  });

  test('getUserById - should retrieve user data successfully', async () => {
    const mockResponse = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };
    mock.onGet('http://localhost:3000/api/users/1').reply(200, mockResponse); // Use full path

    const userData = await getUserById('1');
    expect(userData).toEqual(mockResponse);
  });

  test('getUserById - should handle user not found', async () => {
    mock.onGet('http://localhost:3000/api/users/1').reply(404, { message: 'User not found' });

    await expect(getUserById('1')).rejects.toThrow('User not found');
  });

  test('updateUserProfile - should update user profile successfully', async () => {
    const mockResponse = { message: 'User profile updated successfully' };
    mock.onPut('http://localhost:3000/api/users/1').reply(200, mockResponse); // Use full path

    const response = await updateUserProfile('1', {
      firstName: 'UpdatedFirstName',
      lastName: 'UpdatedLastName',
    });
    expect(response).toEqual(mockResponse);
  });

  test('resetPassword - should reset password successfully', async () => {
    const mockResponse = { message: 'Password reset successfully' };
    mock.onPost('http://localhost:3000/api/auth/reset-password').reply(200, mockResponse); // Use full path

    const response = await resetPassword('mock-token', 'newPassword');
    expect(response).toEqual(mockResponse);
  });

  test('verifyUser - should verify user with OTP successfully', async () => {
    const mockResponse = { verificationStatus: 'verified' };
    mock.onPost('http://localhost:3000/api/users/verify').reply(200, mockResponse); // Use full path

    const response = await verifyUser('1', '123456');
    expect(response).toEqual(mockResponse);
  });

  test('deleteUser - should delete user successfully', async () => {
    const mockResponse = { message: 'User deleted successfully' };
    mock.onDelete('http://localhost:3000/api/users/1').reply(200, mockResponse); // Use full path

    const response = await deleteUser('1');
    expect(response).toEqual(mockResponse);
  });

  test('setAuthToken - should set and retrieve auth token', () => {
    setAuthToken('mock-token');
    expect(getAuthToken()).toBe('mock-token');
  });

  test('clearAuthToken - should clear auth token', () => {
    setAuthToken('mock-token');
    clearAuthToken();
    expect(getAuthToken()).toBeNull();
  });
});
