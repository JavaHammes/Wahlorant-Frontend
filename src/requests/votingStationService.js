import { API_URL, VOTING_STATION_LOGIN_ENDPOINT, VOTING_STATION_SUBMISSION_ENDPOINT } from '../constants/api';
import { getAuthHeaders } from './authService'

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

      // Store auth data and station information in localStorage
      if (data.votingstation) {
        const station = data.votingstation;

        if (station.token) {
          localStorage.setItem('token', station.token);
        }

        localStorage.setItem('votingId', station.votingId);
        localStorage.setItem('stationName', station.name);
        localStorage.setItem('voterCount', station.voterCount.toString());

        if (station.firstSubmitTime) {
          localStorage.setItem('firstSubmitTime', station.firstSubmitTime);
        }

        if (station.lastSubmitTime) {
          localStorage.setItem('lastSubmitTime', station.lastSubmitTime);
        }
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
      const votingId = localStorage.getItem('votingId');

      if (!votingId) {
        throw new Error('Voting ID not found. Please log in again.');
      }

      const response = await fetch(`${API_URL}${VOTING_STATION_SUBMISSION_ENDPOINT}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(votingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Fehler beim Übermitteln der Ergebnisse: ${response.status}`);
      }

      const data = await response.json();

      // Update submission times in localStorage if returned in response
      if (data.votingstation) {
        if (data.votingstation.firstSubmitTime) {
          localStorage.setItem('firstSubmitTime', data.votingstation.firstSubmitTime);
        }

        if (data.votingstation.lastSubmitTime) {
          localStorage.setItem('lastSubmitTime', data.votingstation.lastSubmitTime);
        }
      }

      return data;
    } catch (error) {
      console.error('Fehler bei der Stimmabgabe:', error);
      throw error;
    }
  },
};

export default votingStationService;