import { API_URL, USER_ENDPOINT, VOTING_STATION_ENDPOINT } from '../constants/api';

/**
 * Helper function to get authentication headers
 * @param {string} tokenKey - The localStorage key where the token is stored (defaults to 'token')
 * @returns {Object} Headers object with Authorization token
 */
export const getAuthHeaders = (tokenKey = 'token') => {
  const token = localStorage.getItem(tokenKey);

  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Check if the current token belongs to an admin user
 * @returns {Promise<boolean>} True if the user is an admin
 */
export const isAdmin = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}${USER_ENDPOINT}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return Boolean(data.user && data.user.role === 'admin');
  } catch (error) {
    console.error('Admin check failed:', error);
    return false;
  }
};

/**
 * Check if the current token belongs to a regular user (not an admin)
 * @returns {Promise<boolean>} True if the user is a regular user
 */
export const isUser = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}${USER_ENDPOINT}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    // Check that user exists and role is NOT admin
    return Boolean(data.user && data.user.role !== 'admin');
  } catch (error) {
    console.error('User check failed:', error);
    return false;
  }
};

/**
 * Check if the current token belongs to a voting station
 * @returns {Promise<boolean>} True if the token belongs to a voting station
 */
export const isVotingStation = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}${VOTING_STATION_ENDPOINT}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    // Check that votingstation exists in the response
    return Boolean(data.status === 'success' && data.votingstation);
  } catch (error) {
    console.error('Voting station check failed:', error);
    return false;
  }
};

/**
 * Determines what type of entity is currently logged in
 * @returns {Promise<string>} 'admin', 'user', 'station', or 'none'
 */
export const getCurrentIdentityType = async () => {
  if (await isAdmin()) {
    return 'admin';
  } else if (await isUser()) {
    return 'user';
  } else if (await isVotingStation()) {
    return 'station';
  } else {
    return 'none';
  }
};

/**
 * Log out the current entity based on its type
 * This function determines whether a user or a voting station is logged in
 * and clears the appropriate localStorage items
 * @returns {Promise<boolean>} True if logout was successful
 */
export const logout = async () => {
  try {
    // Clear token which is common to all identity types
    localStorage.removeItem('token');

    const identityType = await getCurrentIdentityType();

    switch (identityType) {
      case 'admin':
      case 'user':
        // Clear user-specific data
        localStorage.removeItem('username');
        break;

      case 'station':
        // Clear voting station-specific data
        localStorage.removeItem('votingId');
        localStorage.removeItem('stationName');
        localStorage.removeItem('voterCount');
        localStorage.removeItem('firstSubmitTime');
        localStorage.removeItem('lastSubmitTime');
        break;

      default:
        // Clear everything just to be safe if we can't determine the type
        localStorage.clear();
        break;
    }

    return true;
  } catch (error) {
    console.error('Logout failed:', error);
    // Still attempt to clear the token as a fallback
    localStorage.removeItem('token');
    return false;
  }
};