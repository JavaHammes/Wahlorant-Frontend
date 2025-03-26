import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isAdmin } from '../../requests/authService';
import { API_URL, USER_ENDPOINT } from '../../constants/api';

describe('authService', () => {
  describe('isAdmin', () => {
    beforeEach(() => {
      // Clear previous mocks
      global.fetch.mockClear();
    });

    it('should return false when no token exists', async () => {
      // Ensure no token exists
      localStorage.clear();

      const result = await isAdmin();

      // Verify no fetch call was made
      expect(global.fetch).not.toHaveBeenCalled();
      // Check the result
      expect(result).toBe(false);
    });

    it('should return true when user is admin', async () => {
      // Set up token
      localStorage.setItem('token', 'fake-token');

      // Mock successful fetch response with admin role
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { role: 'admin' } }),
      });

      const result = await isAdmin();

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}${USER_ENDPOINT}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer fake-token'
        }
      });

      // Check the result
      expect(result).toBe(true);
    });

    it('should return false when user is not admin', async () => {
      // Set up token
      localStorage.setItem('token', 'fake-token');

      // Mock successful fetch response with non-admin role
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { role: 'user' } }),
      });

      const result = await isAdmin();

      // Check the result
      expect(result).toBe(false);
    });

    it('should return false when API response is not ok', async () => {
      // Set up token
      localStorage.setItem('token', 'fake-token');

      // Mock failed fetch response
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await isAdmin();

      // Check the result
      expect(result).toBe(false);
    });

    it('should return false when API call throws an error', async () => {
      // Set up token
      localStorage.setItem('token', 'fake-token');

      // Mock fetch that throws an error
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await isAdmin();

      // Check the result
      expect(result).toBe(false);
    });
  });
});