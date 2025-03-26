import { API_URL, VOTING_ENDPOINT, CREATE_VOTING_ENDPOINT } from '../constants/api';

/**
 * Helper function to get authentication headers
 * @returns {Object} Headers object with Authorization token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Service for handling voting-related API calls and data processing
 */
const votingService = {
  /**
   * Fetches all voting events from the API
   * @returns {Promise<Array>} - Array of voting objects
   */
  getAllVotings: async () => {
    try {
      const headers = getAuthHeaders();

      const response = await fetch(`${API_URL}${VOTING_ENDPOINT}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Error fetching votings: ${response.status}`);
      }

      const data = await response.json();
      return data.votings || [];
    } catch (error) {
      console.error('Failed to fetch votings:', error);
      throw error;
    }
  },

  /**
   * Gets the total count of all votings
   * @returns {Promise<number>} - Total number of votings
   */
  getVotingCount: async () => {
    try {
      const votings = await votingService.getAllVotings();
      return votings.length;
    } catch (error) {
      console.error('Failed to get voting count:', error);
      throw error;
    }
  },

  /**
   * Gets all active votings (not ended)
   * @returns {Promise<Array>} - Array of active voting objects
   */
  getActiveVotings: async () => {
    try {
      const votings = await votingService.getAllVotings();
      const now = new Date();

      return votings.filter(voting => {
        const endDate = new Date(voting.endDate);
        return endDate > now;
      });
    } catch (error) {
      console.error('Failed to get active votings:', error);
      throw error;
    }
  },

  /**
   * Gets the count of active votings
   * @returns {Promise<number>} - Number of active votings
   */
  getActiveVotingCount: async () => {
    try {
      const activeVotings = await votingService.getActiveVotings();
      return activeVotings.length;
    } catch (error) {
      console.error('Failed to get active voting count:', error);
      throw error;
    }
  },

  /**
   * Gets all completed votings (end date has passed)
   * @returns {Promise<Array>} - Array of completed voting objects
   */
  getCompletedVotings: async () => {
    try {
      const votings = await votingService.getAllVotings();
      const now = new Date();

      return votings.filter(voting => {
        const endDate = new Date(voting.endDate);
        return endDate <= now;
      });
    } catch (error) {
      console.error('Failed to get completed votings:', error);
      throw error;
    }
  },

  /**
   * Gets detailed information for a specific voting by ID
   * @param {string} votingId - ID of the voting to retrieve
   * @returns {Promise<Object>} - Voting object with details
   */
  getVotingById: async (votingId) => {
    try {
      const headers = getAuthHeaders();

      const response = await fetch(`${API_URL}${VOTING_ENDPOINT}/${votingId}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Error fetching voting details: ${response.status}`);
      }

      const data = await response.json();
      return data.voting || null;
    } catch (error) {
      console.error(`Failed to get voting with ID ${votingId}:`, error);
      throw error;
    }
  },

  /**
   * Gets statistics about votings (total, active, completed)
   * @returns {Promise<Object>} - Object containing statistics
   */
  getVotingStatistics: async () => {
    try {
      const allVotings = await votingService.getAllVotings();
      const activeVotings = await votingService.getActiveVotings();

      return {
        total: allVotings.length,
        active: activeVotings.length,
        completed: allVotings.length - activeVotings.length
      };
    } catch (error) {
      console.error('Failed to get voting statistics:', error);
      throw error;
    }
  },

  /**
   * Calculates the total voter count across all votings
   * @returns {Promise<number>} - Total number of voters
   */
  getTotalVoterCount: async () => {
    try {
      const votings = await votingService.getAllVotings();

      return votings.reduce((total, voting) => {
        // Sum voter count from all voting stations
        const stationVoters = voting.votingStations.reduce((stationTotal, station) => {
          return stationTotal + (station.voterCount || 0);
        }, 0);

        return total + stationVoters;
      }, 0);
    } catch (error) {
      console.error('Failed to get total voter count:', error);
      throw error;
    }
  },

  /**
   * Creates a new voting
   * @param {Object} votingData - Voting data to create
   * @returns {Promise<Object>} - Created voting object
   */
  createVoting: async (votingData) => {
    try {
      const headers = getAuthHeaders();

      const response = await fetch(`${API_URL}${CREATE_VOTING_ENDPOINT}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(votingData)
      });

      if (!response.ok) {
        throw new Error(`Error creating voting: ${response.status}`);
      }

      const data = await response.json();
      return data.voting || null;
    } catch (error) {
      console.error('Failed to create voting:', error);
      throw error;
    }
  },

  /**
   * Updates an existing voting
   * @param {string} votingId - ID of the voting to update
   * @param {Object} votingData - Updated voting data
   * @returns {Promise<Object>} - Updated voting object
   */
  updateVoting: async (votingId, votingData) => {
    try {
      const headers = getAuthHeaders();

      const response = await fetch(`${API_URL}${VOTING_ENDPOINT}/${votingId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(votingData)
      });

      if (!response.ok) {
        throw new Error(`Error updating voting: ${response.status}`);
      }

      const data = await response.json();
      return data.voting || null;
    } catch (error) {
      console.error(`Failed to update voting with ID ${votingId}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a voting
   * @param {string} votingId - ID of the voting to delete
   * @returns {Promise<boolean>} - True if successful
   */
  deleteVoting: async (votingId) => {
    try {
      const headers = getAuthHeaders();

      const response = await fetch(`${API_URL}${VOTING_ENDPOINT}/${votingId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Error deleting voting: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Failed to delete voting with ID ${votingId}:`, error);
      throw error;
    }
  }
};

export default votingService;