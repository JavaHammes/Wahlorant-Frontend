import { API_URL, VOTING_STATION_LOGIN_ENDPOINT, VOTING_STATION_SUBMISSION_ENDPOINT } from '../constants/api';
import { getAuthHeaders } from '../utils/request_auth';

/**
 * Service for handling voting station-related API calls and authentication
 */
const votingStationService = {
  /**
   * Logs in a voting station
   * @param {string} loginId - Station's unique login ID
   * @param {string} password - Station's password
   * @returns {Promise<Object>} - Station data including token
   */
  login: async (loginId, password) => {
    try {
      const response = await fetch(`${API_URL}${VOTING_STATION_LOGIN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login fehlgeschlagen. Bitte überprüfen Sie Ihre Zugangsdaten.');
      }

      // Store auth data in localStorage
      if (data.votingstation && data.votingstation.token) {
        localStorage.setItem('token', data.votingstation.token);
      }

      if (data.votingstation && data.votingstation.loginId) {
        localStorage.setItem('stationLoginId', data.votingstation.loginId);
      }

      if (data.votingstation && data.votingstation.name) {
        localStorage.setItem('stationName', data.votingstation.name);
      }

      return data.votingstation;
    } catch (error) {
      console.error('Wahllokal Login Fehler:', error);
      throw error;
    }
  },

  /**
   * Submits voting results from a station
   * @param {Object} votingData - Voting result data to submit
   * @returns {Promise<Object>} - Submission confirmation
   */
  submitVotes: async (votingData) => {
    try {
      const headers = getAuthHeaders();

      const response = await fetch(`${API_URL}${VOTING_STATION_SUBMISSION_ENDPOINT}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(votingData)
      });

      if (!response.ok) {
        throw new Error(`Fehler beim Übermitteln der Ergebnisse: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fehler bei der Stimmabgabe:', error);
      throw error;
    }
  },

  /**
   * Log out the current voting station by removing their tokens
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('stationLoginId');
    localStorage.removeItem('stationName');
  }
};

export default votingStationService;