import { API_URL, LOGIN_ENDPOINT, CREATE_USER_ENDPOINT } from '../constants/api';

/**
 * Service for handling user-related API calls and authentication
 */
const userService = {
  /**
   * Logs in a user
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise<Object>} - User data including token and role
   */
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_URL}${LOGIN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      // Store auth data in localStorage
      if (data.user && data.user.token) {
        localStorage.setItem('token', data.user.token);
      }

      if (data.user && data.user.username) {
        localStorage.setItem('username', data.user.username);
      }

      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Registers a new user
   * @param {Object} userData - User data for registration
   * @returns {Promise<Object>} - Created user data
   */
  registerUser: async (userData) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication required. Please login first.');
      }

      const response = await fetch(`${API_URL}${CREATE_USER_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      return data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
};

export default userService;