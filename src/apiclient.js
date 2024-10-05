import axios from 'axios';

// API Base URL
const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://production-api-url.com' : 'http://localhost:3000';
console.log(`API Base URL: ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}`);

let authToken = null;

// Set auth token
export const setAuthToken = (token) => {
  console.log(`Setting auth token: ${token}`);
  authToken = token;
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('authToken', token);
  }
};

// Get auth token
export const getAuthToken = () => {
  const token = authToken || (typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('authToken') : null);
  console.log(`Retrieved auth token: ${token}`);
  return token;
};

// Clear auth token
export const clearAuthToken = () => {
  console.log('Clearing auth token');
  authToken = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('authToken');
  }
};

// Centralized error handler
const handleError = (error) => {
  console.error('API request failed:', error.response?.data || error.message);
  throw new Error(error.response?.data?.message || 'Something went wrong');
};

// Register a user
export const registerUser = async (email, password, firstName, lastName) => {
  console.log(`Registering user: ${email}`);
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/register`, {
      email,
      password,
      firstName,
      lastName,
    });
    console.log('Registration successful:', response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Login a user
export const loginUser = async (email, password) => {
  console.log(`Logging in user: ${email}`);
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
    const { token } = response.data;
    setAuthToken(token);
    return token;
  } catch (error) {
    handleError(error);
  }
};

// Get a user by ID
export const getUserById = async (userId) => {
  const token = getAuthToken();
  console.log(`Retrieving user with ID: ${userId}`);
  try {
    const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Update a user's profile
export const updateUserProfile = async (userId, profileData) => {
  const token = getAuthToken();
  console.log(`Updating profile for user ID: ${userId}`);
  try {
    const response = await axios.put(`${API_BASE_URL}/api/users/${userId}`, profileData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  console.log(`Resetting password with token: ${token}`);
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
      token,
      newPassword,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Verify a user with OTP
export const verifyUser = async (userId, otp) => {
  console.log(`Verifying user ID: ${userId} with OTP: ${otp}`);
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/verify`, { userId, otp });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Delete a user
export const deleteUser = async (userId) => {
  const token = getAuthToken();
  console.log(`Deleting user with ID: ${userId}`);
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
