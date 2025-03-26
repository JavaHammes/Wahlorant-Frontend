import { describe, it, expect, beforeEach, vi } from 'vitest';
import votingService from '../../requests/votingService';
import { API_URL, VOTING_ENDPOINT, CREATE_VOTING_ENDPOINT } from '../../constants/api';

describe('votingService', () => {
  // Sample mock voting data for testing
  const mockVotings = [
    {
      id: '1',
      name: 'Presidential Election 2025',
      startDate: '2025-01-01T00:00:00Z',
      endDate: '2025-12-31T23:59:59Z',
      votingStations: [
        { id: 'vs1', name: 'Station 1', voterCount: 150 },
        { id: 'vs2', name: 'Station 2', voterCount: 120 }
      ]
    },
    {
      id: '2',
      name: 'Local Survey',
      startDate: '2025-02-01T00:00:00Z',
      endDate: '2025-02-28T23:59:59Z',
      votingStations: [
        { id: 'vs3', name: 'Station 3', voterCount: 75 }
      ]
    },
    {
      id: '3',
      name: 'Past Poll',
      startDate: '2024-01-15T00:00:00Z',
      endDate: '2024-04-15T23:59:59Z',
      votingStations: [
        { id: 'vs4', name: 'Station 4', voterCount: 200 },
        { id: 'vs5', name: 'Station 5', voterCount: 180 }
      ]
    }
  ];

  // Mock current date for consistent testing
  const mockCurrentDate = new Date('2025-03-15T12:00:00Z');
  let originalDate;

  beforeEach(() => {
    // Clear all mocks and localStorage before each test
    global.fetch.mockClear();
    localStorage.clear();

    // Mock Date to return consistent time for tests
    originalDate = global.Date;
    global.Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          return new originalDate(mockCurrentDate);
        }
        return new originalDate(...args);
      }

      static now() {
        return mockCurrentDate.getTime();
      }
    };
  });

  afterEach(() => {
    // Restore original Date object
    global.Date = originalDate;
  });

  describe('getAuthHeaders', () => {
    it('should throw an error when no token exists', async () => {
      // Ensure no token exists
      localStorage.clear();

      // Try to call a method that uses getAuthHeaders
      await expect(votingService.getAllVotings())
        .rejects
        .toThrow('No authentication token found. Please log in again.');

      // Verify no fetch call was made
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should include token in headers when token exists', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock successful response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ votings: [] }),
      });

      // Call a method that uses getAuthHeaders
      await votingService.getAllVotings();

      // Verify headers were set correctly
      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}${VOTING_ENDPOINT}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });
    });
  });

  describe('getAllVotings', () => {
    it('should fetch and return all votings', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock successful response with voting data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ votings: mockVotings }),
      });

      // Call the method
      const result = await votingService.getAllVotings();

      // Verify API was called correctly
      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}${VOTING_ENDPOINT}`, {
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      });

      // Verify result matches mock data
      expect(result).toEqual(mockVotings);
      expect(result.length).toBe(mockVotings.length);
    });

    it('should return empty array when no votings exist', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock successful response with no voting data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      // Call the method
      const result = await votingService.getAllVotings();

      // Verify result is an empty array
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should throw an error when API response is not ok', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock failed response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      // Call and expect error to be thrown
      await expect(votingService.getAllVotings())
        .rejects
        .toThrow('Error fetching votings: 403');
    });

    it('should throw an error when fetch throws a network error', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network failure'));

      // Call and expect error to be thrown
      await expect(votingService.getAllVotings())
        .rejects
        .toThrow('Network failure');
    });
  });

  describe('getVotingCount', () => {
    it('should return the total number of votings', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock successful response with voting data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ votings: mockVotings }),
      });

      // Call the method
      const result = await votingService.getVotingCount();

      // Verify result is the correct count
      expect(result).toBe(mockVotings.length);
    });

    it('should return 0 when no votings exist', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock successful response with no voting data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ votings: [] }),
      });

      // Call the method
      const result = await votingService.getVotingCount();

      // Verify result is 0
      expect(result).toBe(0);
    });

    it('should re-throw errors from getAllVotings', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network failure'));

      // Call and expect error to be thrown
      await expect(votingService.getVotingCount())
        .rejects
        .toThrow('Network failure');
    });
  });

  describe('getActiveVotings', () => {
    it('should return only active votings', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock successful response with voting data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ votings: mockVotings }),
      });

      // Call the method
      const result = await votingService.getActiveVotings();

      // Only the first two votings should be active based on our mock date
      const expectedActiveVotings = mockVotings.filter(v =>
        new Date(v.endDate) > mockCurrentDate
      );

      // Verify result only includes active votings
      expect(result.length).toBe(expectedActiveVotings.length);
      expect(result).toEqual(expectedActiveVotings);
    });

    it('should return empty array when no active votings exist', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Create mock data where all votings are completed
      const pastVotings = [
        {
          id: '1',
          name: 'Past Voting 1',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-02-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Past Voting 2',
          startDate: '2024-02-01T00:00:00Z',
          endDate: '2024-03-01T00:00:00Z',
        }
      ];

      // Mock successful response with past voting data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ votings: pastVotings }),
      });

      // Call the method
      const result = await votingService.getActiveVotings();

      // Verify result is an empty array
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should re-throw errors from getAllVotings', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network failure'));

      // Call and expect error to be thrown
      await expect(votingService.getActiveVotings())
        .rejects
        .toThrow('Network failure');
    });
  });

  describe('getActiveVotingCount', () => {
    it('should return the number of active votings', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Create active votings
      const activeVotings = mockVotings.filter(v =>
        new Date(v.endDate) > mockCurrentDate
      );

      // Mock getActiveVotings to return these active votings
      vi.spyOn(votingService, 'getActiveVotings').mockResolvedValueOnce(activeVotings);

      // Call the method
      const result = await votingService.getActiveVotingCount();

      // Verify result is the correct count
      expect(result).toBe(activeVotings.length);
    });

    it('should return 0 when no active votings exist', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock getActiveVotings to return empty array
      vi.spyOn(votingService, 'getActiveVotings').mockResolvedValueOnce([]);

      // Call the method
      const result = await votingService.getActiveVotingCount();

      // Verify result is 0
      expect(result).toBe(0);
    });

    it('should re-throw errors from getActiveVotings', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock getActiveVotings to throw an error
      vi.spyOn(votingService, 'getActiveVotings').mockRejectedValueOnce(new Error('Failed to get active votings'));

      // Call and expect error to be thrown
      await expect(votingService.getActiveVotingCount())
        .rejects
        .toThrow('Failed to get active votings');
    });
  });

  describe('getCompletedVotings', () => {
    it('should return only completed votings', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock successful response with voting data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ votings: mockVotings }),
      });

      // Call the method
      const result = await votingService.getCompletedVotings();

      // Only the last voting should be completed based on our mock date
      const expectedCompletedVotings = mockVotings.filter(v =>
        new Date(v.endDate) <= mockCurrentDate
      );

      // Verify result only includes completed votings
      expect(result.length).toBe(expectedCompletedVotings.length);
      expect(result).toEqual(expectedCompletedVotings);
    });

    it('should return empty array when no completed votings exist', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Create mock data where all votings are active
      const futureVotings = [
        {
          id: '1',
          name: 'Future Voting 1',
          startDate: '2025-01-01T00:00:00Z',
          endDate: '2025-12-31T00:00:00Z',
        },
        {
          id: '2',
          name: 'Future Voting 2',
          startDate: '2025-04-01T00:00:00Z',
          endDate: '2025-05-01T00:00:00Z',
        }
      ];

      // Mock successful response with future voting data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ votings: futureVotings }),
      });

      // Call the method
      const result = await votingService.getCompletedVotings();

      // Verify result is an empty array
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should re-throw errors from getAllVotings', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network failure'));

      // Call and expect error to be thrown
      await expect(votingService.getCompletedVotings())
        .rejects
        .toThrow('Network failure');
    });
  });

  describe('getVotingById', () => {
    it('should fetch and return a specific voting by ID', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      const votingId = '1';
      const mockVoting = mockVotings.find(v => v.id === votingId);

      // Mock successful response with specific voting data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ voting: mockVoting }),
      });

      // Call the method
      const result = await votingService.getVotingById(votingId);

      // Verify API was called correctly
      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}${VOTING_ENDPOINT}/${votingId}`, {
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      });

      // Verify result matches mock data
      expect(result).toEqual(mockVoting);
    });

    it('should return null when the voting does not exist', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      const votingId = 'non-existent-id';

      // Mock successful response but with no voting data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      // Call the method
      const result = await votingService.getVotingById(votingId);

      // Verify result is null
      expect(result).toBeNull();
    });

    it('should throw an error when API response is not ok', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      const votingId = '1';

      // Mock failed response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      // Call and expect error to be thrown
      await expect(votingService.getVotingById(votingId))
        .rejects
        .toThrow('Error fetching voting details: 404');
    });

    it('should throw an error when fetch throws a network error', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      const votingId = '1';

      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network failure'));

      // Call and expect error to be thrown
      await expect(votingService.getVotingById(votingId))
        .rejects
        .toThrow('Network failure');
    });
  });

  describe('getVotingStatistics', () => {
    it('should return correct statistics for votings', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Calculate expected active and completed counts
      const activeVotings = mockVotings.filter(v =>
        new Date(v.endDate) > mockCurrentDate
      );
      const completedCount = mockVotings.length - activeVotings.length;

      // Mock getAllVotings to return all mock votings
      vi.spyOn(votingService, 'getAllVotings').mockResolvedValueOnce(mockVotings);

      // Mock getActiveVotings to return active mock votings
      vi.spyOn(votingService, 'getActiveVotings').mockResolvedValueOnce(activeVotings);

      // Expected statistics
      const expectedStats = {
        total: mockVotings.length,
        active: activeVotings.length,
        completed: completedCount
      };

      // Call the method
      const result = await votingService.getVotingStatistics();

      // Verify result matches expected statistics
      expect(result).toEqual(expectedStats);
    });

    it('should return all zeros when no votings exist', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock getAllVotings to return empty array
      vi.spyOn(votingService, 'getAllVotings').mockResolvedValueOnce([]);

      // Mock getActiveVotings to return empty array
      vi.spyOn(votingService, 'getActiveVotings').mockResolvedValueOnce([]);

      // Expected statistics
      const expectedStats = {
        total: 0,
        active: 0,
        completed: 0
      };

      // Call the method
      const result = await votingService.getVotingStatistics();

      // Verify result matches expected statistics
      expect(result).toEqual(expectedStats);
    });

    it('should re-throw errors from getAllVotings', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock getAllVotings to throw an error
      vi.spyOn(votingService, 'getAllVotings').mockRejectedValueOnce(new Error('Failed to fetch votings'));

      // Call and expect error to be thrown
      await expect(votingService.getVotingStatistics())
        .rejects
        .toThrow('Failed to fetch votings');
    });

    it('should re-throw errors from getActiveVotings', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock getAllVotings to return mock votings
      vi.spyOn(votingService, 'getAllVotings').mockResolvedValueOnce(mockVotings);

      // Mock getActiveVotings to throw an error
      vi.spyOn(votingService, 'getActiveVotings').mockRejectedValueOnce(new Error('Failed to get active votings'));

      // Call and expect error to be thrown
      await expect(votingService.getVotingStatistics())
        .rejects
        .toThrow('Failed to get active votings');
    });
  });

  describe('getTotalVoterCount', () => {
    it('should calculate the total voter count across all votings', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Calculate expected voter count from mock data
      const expectedTotal = mockVotings.reduce((total, voting) => {
        // Sum voter count from all voting stations
        const stationVoters = voting.votingStations ? voting.votingStations.reduce((stationTotal, station) => {
          return stationTotal + (station.voterCount || 0);
        }, 0) : 0;

        return total + stationVoters;
      }, 0);

      // Mock getAllVotings to return mock votings
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ votings: mockVotings }),
      });

      // Call the method
      const result = await votingService.getTotalVoterCount();

      // Verify result matches expected total
      expect(result).toBe(expectedTotal);
    });

    it('should handle stations with undefined voter counts', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Create mock votings with some undefined voter counts
      const mockVotingsWithMixedVoters = [
        {
          id: '1',
          name: 'Voting 1',
          votingStations: [
            { id: 'vs1', voterCount: 100 },
            { id: 'vs2' } // undefined voterCount
          ]
        },
        {
          id: '2',
          name: 'Voting 2',
          votingStations: [
            { id: 'vs3', voterCount: 200 },
            { id: 'vs4', voterCount: null } // null voterCount
          ]
        }
      ];

      // Mock getAllVotings to return mock votings with mixed voter counts
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ votings: mockVotingsWithMixedVoters }),
      });

      // Expected total voter count (only the defined values)
      const expectedTotal = 100 + 0 + 200 + 0; // 300

      // Call the method
      const result = await votingService.getTotalVoterCount();

      // Verify result matches expected total
      expect(result).toBe(expectedTotal);
    });

    it('should return 0 when no votings or stations exist', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock getAllVotings to return empty array
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ votings: [] }),
      });

      // Call the method
      const result = await votingService.getTotalVoterCount();

      // Verify result is 0
      expect(result).toBe(0);
    });

    it('should re-throw errors from getAllVotings', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Failed to fetch votings'));

      // Call and expect error to be thrown
      await expect(votingService.getTotalVoterCount())
        .rejects
        .toThrow('Failed to fetch votings');
    });
  });

  describe('createVoting', () => {
    it('should create a new voting successfully', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Create voting data
      const votingData = {
        name: 'New Voting',
        startDate: '2025-04-01T00:00:00Z',
        endDate: '2025-05-01T00:00:00Z',
        votingStations: [
          { name: 'Station 1', voterCount: 100 }
        ]
      };

      // Create mock response with created voting
      const createdVoting = {
        id: 'new-id',
        ...votingData
      };

      // Mock successful response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ voting: createdVoting }),
      });

      // Call the method
      const result = await votingService.createVoting(votingData);

      // Verify API was called correctly
      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}${CREATE_VOTING_ENDPOINT}`, {
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        }),
        body: JSON.stringify(votingData)
      });

      // Verify result matches created voting
      expect(result).toEqual(createdVoting);
    });

    it('should return null when API returns no voting data', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Create voting data
      const votingData = {
        name: 'New Voting',
        startDate: '2025-04-01T00:00:00Z',
        endDate: '2025-05-01T00:00:00Z'
      };

      // Mock successful response but with no voting data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      // Call the method
      const result = await votingService.createVoting(votingData);

      // Verify result is null
      expect(result).toBeNull();
    });

    it('should throw an error when API response is not ok', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Create voting data
      const votingData = {
        name: 'New Voting',
        startDate: '2025-04-01T00:00:00Z',
        endDate: '2025-05-01T00:00:00Z'
      };

      // Mock failed response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      // Call and expect error to be thrown
      await expect(votingService.createVoting(votingData))
        .rejects
        .toThrow('Error creating voting: 400');
    });

    it('should throw an error when fetch throws a network error', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      // Create voting data
      const votingData = {
        name: 'New Voting',
        startDate: '2025-04-01T00:00:00Z',
        endDate: '2025-05-01T00:00:00Z'
      };

      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network failure'));

      // Call and expect error to be thrown
      await expect(votingService.createVoting(votingData))
        .rejects
        .toThrow('Network failure');
    });
  });

  describe('updateVoting', () => {
    it('should update an existing voting successfully', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      const votingId = '1';
      // Create voting update data
      const votingData = {
        name: 'Updated Voting',
        startDate: '2025-04-01T00:00:00Z',
        endDate: '2025-05-01T00:00:00Z'
      };

      // Create mock response with updated voting
      const updatedVoting = {
        id: votingId,
        ...votingData
      };

      // Mock successful response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ voting: updatedVoting }),
      });

      // Call the method
      const result = await votingService.updateVoting(votingId, votingData);

      // Verify API was called correctly
      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}${VOTING_ENDPOINT}/${votingId}`, {
        method: 'PUT',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        }),
        body: JSON.stringify(votingData)
      });

      // Verify result matches updated voting
      expect(result).toEqual(updatedVoting);
    });

    it('should return null when API returns no voting data', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      const votingId = '1';
      // Create voting update data
      const votingData = {
        name: 'Updated Voting',
        startDate: '2025-04-01T00:00:00Z',
        endDate: '2025-05-01T00:00:00Z'
      };

      // Mock successful response but with no voting data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      // Call the method
      const result = await votingService.updateVoting(votingId, votingData);

      // Verify result is null
      expect(result).toBeNull();
    });

    it('should throw an error when API response is not ok', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      const votingId = '1';
      // Create voting update data
      const votingData = {
        name: 'Updated Voting',
        startDate: '2025-04-01T00:00:00Z',
        endDate: '2025-05-01T00:00:00Z'
      };

      // Mock failed response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      // Call and expect error to be thrown
      await expect(votingService.updateVoting(votingId, votingData))
        .rejects
        .toThrow('Error updating voting: 404');
    });

    it('should throw an error when fetch throws a network error', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      const votingId = '1';
      // Create voting update data
      const votingData = {
        name: 'Updated Voting',
        startDate: '2025-04-01T00:00:00Z',
        endDate: '2025-05-01T00:00:00Z'
      };

      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network failure'));

      // Call and expect error to be thrown
      await expect(votingService.updateVoting(votingId, votingData))
        .rejects
        .toThrow('Network failure');
    });

    describe('deleteVoting', () => {
    it('should delete a voting successfully', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      const votingId = '1';

      // Mock successful response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      // Call the method
      const result = await votingService.deleteVoting(votingId);

      // Verify API was called correctly
      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}${VOTING_ENDPOINT}/${votingId}`, {
        method: 'DELETE',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      });

      // Verify result is true
      expect(result).toBe(true);
    });

    it('should throw an error when API response is not ok', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      const votingId = '1';

      // Mock failed response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      // Call and expect error to be thrown
      await expect(votingService.deleteVoting(votingId))
        .rejects
        .toThrow('Error deleting voting: 404');
    });

    it('should throw an error when fetch throws a network error', async () => {
      // Set up token
      localStorage.setItem('token', 'test-token');

      const votingId = '1';

      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network failure'));

      // Call and expect error to be thrown
      await expect(votingService.deleteVoting(votingId))
        .rejects
        .toThrow('Network failure');
      });
    });
  });
});
