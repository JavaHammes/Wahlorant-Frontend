import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import votingStationService from '../../requests/votingStationService';

describe('votingStationService', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should throw an error when login fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Login fehlgeschlagen' }),
      });

      await expect(votingStationService.login('invalid', 'wrong-pass'))
        .rejects.toThrow('Login fehlgeschlagen');
    });

    it('should store token and station details on successful login', async () => {
      const mockResponse = {
        votingstation: {
          token: 'fake-token',
          votingId: '123',
          name: 'Station A',
          voterCount: 100,
          firstSubmitTime: '2025-03-15T12:00:00Z',
          lastSubmitTime: '2025-03-16T12:00:00Z',
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await votingStationService.login('station123', 'password');

      expect(result).toEqual(mockResponse.votingstation);
      expect(localStorage.getItem('token')).toBe('fake-token');
      expect(localStorage.getItem('votingId')).toBe('123');
      expect(localStorage.getItem('stationName')).toBe('Station A');
      expect(localStorage.getItem('voterCount')).toBe('100');
      expect(localStorage.getItem('firstSubmitTime')).toBe('2025-03-15T12:00:00Z');
      expect(localStorage.getItem('lastSubmitTime')).toBe('2025-03-16T12:00:00Z');
    });
  });

  describe('submitVotes', () => {
    it('should throw an error when no voting ID is found', async () => {
      localStorage.clear();
      await expect(votingStationService.submitVotes({})).rejects.toThrow('No authentication token found. Please log in again.');
    });

    it('should submit votes successfully and update submission times', async () => {
      localStorage.setItem('token', 'fake-token');
      localStorage.setItem('votingId', '123');

      const mockResponse = {
        votingstation: {
          firstSubmitTime: '2025-03-17T12:00:00Z',
          lastSubmitTime: '2025-03-18T12:00:00Z',
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await votingStationService.submitVotes({ votes: [1, 2, 3] });

      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('firstSubmitTime')).toBe('2025-03-17T12:00:00Z');
      expect(localStorage.getItem('lastSubmitTime')).toBe('2025-03-18T12:00:00Z');
    });

    it('should throw an error when vote submission fails', async () => {
      localStorage.setItem('token', 'fake-token');
      localStorage.setItem('votingId', '123');

      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Fehler beim Übermitteln der Ergebnisse' }),
      });

      await expect(votingStationService.submitVotes({ votes: [1, 2, 3] }))
        .rejects.toThrow('Fehler beim Übermitteln der Ergebnisse');
    });
  });
});
