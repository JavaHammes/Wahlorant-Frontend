import { describe, it, expect, beforeEach, vi } from 'vitest';
import userService from '../../requests/userService';
import { API_URL, LOGIN_ENDPOINT, CREATE_USER_ENDPOINT } from '../../constants/api';

describe('userService', () => {
  beforeEach(() => {
    // Clear all mocks and localStorage before each test
    global.fetch.mockClear();
    localStorage.clear();
  });

  describe('login', () => {
    it('should call the API with correct credentials', async () => {
      // Mock successful login response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            username: 'testuser',
            token: 'test-token',
            role: 'user'
          }
        }),
      });

      // Call the login function
      await userService.login('testuser', 'password123');

      // Verify API was called correctly
      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}${LOGIN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123'
        }),
      });
    });

    it('should store user data in localStorage on successful login', async () => {
      // Mock successful login response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            username: 'testuser',
            token: 'test-token',
            role: 'user'
          }
        }),
      });

      // Call the login function
      const result = await userService.login('testuser', 'password123');

      // Verify localStorage was updated
      expect(localStorage.getItem('token')).toBe('test-token');
      expect(localStorage.getItem('username')).toBe('testuser');

      // Verify result contains user data
      expect(result).toEqual({
        username: 'testuser',
        token: 'test-token',
        role: 'user'
      });
    });

    it('should throw an error when login fails with error message from API', async () => {
      // Mock failed login response with specific error message
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      });

      // Call and expect error to be thrown with API message
      await expect(userService.login('wrong', 'password'))
        .rejects
        .toThrow('Invalid credentials');

      // Verify localStorage was not updated
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();
    });

    it('should throw a default error when login fails without specific message', async () => {
      // Mock failed login response without a message
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      // Call and expect default error to be thrown
      await expect(userService.login('wrong', 'password'))
        .rejects
        .toThrow('Login failed. Please check your credentials.');
    });

    it('should throw an error when fetch throws a network error', async () => {
      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network failure'));

      // Call and expect error to be thrown
      await expect(userService.login('testuser', 'password123'))
        .rejects
        .toThrow('Network failure');
    });

    it('should handle missing user data in response', async () => {
      // Mock response with missing user data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),  // No user data
      });

      // Call the login function
      const result = await userService.login('testuser', 'password123');

      // Verify localStorage was not updated
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();

      // Verify result is undefined or whatever the API returns
      expect(result).toBeUndefined();
    });
  });

  describe('registerUser', () => {
    it('should throw an error when no token exists', async () => {
      // Ensure no token exists
      localStorage.clear();

      const userData = {
        username: 'newuser',
        password: 'password123',
        role: 'user'
      };

      // Call and expect error to be thrown
      await expect(userService.registerUser(userData))
        .rejects
        .toThrow('No authentication token found. Please log in again.');

      // Verify no fetch call was made
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should call the API with correct user data and token', async () => {
      // Set up token
      localStorage.setItem('token', 'admin-token');

      const userData = {
        username: 'newuser',
        password: 'password123',
        role: 'user'
      };

      // Mock successful registration response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            username: 'newuser',
            role: 'user'
          }
        }),
      });

      // Call the register function
      await userService.registerUser(userData);

      // Verify API was called correctly
      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}${CREATE_USER_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify(userData),
      });
    });

    it('should return user data on successful registration', async () => {
      // Set up token
      localStorage.setItem('token', 'admin-token');

      const userData = {
        username: 'newuser',
        password: 'password123',
        role: 'user'
      };

      // Mock successful registration response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            id: 'user-123',
            username: 'newuser',
            role: 'user'
          }
        }),
      });

      // Call the register function
      const result = await userService.registerUser(userData);

      // Verify result contains user data
      expect(result).toEqual({
        id: 'user-123',
        username: 'newuser',
        role: 'user'
      });
    });

    it('should throw an error when registration fails with error message from API', async () => {
      // Set up token
      localStorage.setItem('token', 'admin-token');

      const userData = {
        username: 'existinguser',  // Simulate a username that already exists
        password: 'password123',
        role: 'user'
      };

      // Mock failed registration response with specific error message
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Username already exists' }),
      });

      // Call and expect error to be thrown with API message
      await expect(userService.registerUser(userData))
        .rejects
        .toThrow('Username already exists');
    });

    it('should throw a default error when registration fails without specific message', async () => {
      // Set up token
      localStorage.setItem('token', 'admin-token');

      const userData = {
        username: 'newuser',
        password: 'password123',
        role: 'user'
      };

      // Mock failed registration response without a message
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      // Call and expect default error to be thrown
      await expect(userService.registerUser(userData))
        .rejects
        .toThrow('Registration failed.');
    });

    it('should throw an error when fetch throws a network error', async () => {
      // Set up token
      localStorage.setItem('token', 'admin-token');

      const userData = {
        username: 'newuser',
        password: 'password123',
        role: 'user'
      };

      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network failure'));

      // Call and expect error to be thrown
      await expect(userService.registerUser(userData))
        .rejects
        .toThrow('Network failure');
    });
  });
});