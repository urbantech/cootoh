cat <<EOF > README.md
# Cootoh API Client Library

This library provides simple functions for interacting with the Cootoh API. It abstracts the API calls for user registration, login, profile updates, password resets, and more.

## Installation

To install, clone the repo and install the dependencies:

\`\`\`
npm install
\`\`\`

## Usage

1. **Register a User**

\`\`\`js
import { registerUser } from './src/apiClient';

const response = await registerUser('email@example.com', 'password', 'FirstName', 'LastName');
console.log(response);  // User registered successfully
\`\`\`

2. **Login a User**

\`\`\`js
import { loginUser } from './src/apiClient';

const token = await loginUser('email@example.com', 'password');
console.log(token);  // JWT token
\`\`\`

3. **Get User by ID**

\`\`\`js
import { getUserById } from './src/apiClient';

const user = await getUserById('userId');
console.log(user);  // User object
\`\`\`

## Available Functions

- \`registerUser(email, password, firstName, lastName)\`
- \`loginUser(email, password)\`
- \`getUserById(userId)\`
- \`updateUserProfile(userId, profileData)\`
- \`resetPassword(token, newPassword)\`
- \`verifyUser(userId, otp)\`
- \`deleteUser(userId)\`

## Token Management

You can use the following helper functions to manage authentication tokens:

- \`setAuthToken(token)\`
- \`getAuthToken()\`
- \`clearAuthToken()\`
\`\`\`
EOF
