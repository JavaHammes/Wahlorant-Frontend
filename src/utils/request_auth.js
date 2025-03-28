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