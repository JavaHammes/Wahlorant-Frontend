// src/utils/auth.js

import { API_URL, USER_ENDPOINT } from '../constants/api';

/**
 * Check if the user is an admin by verifying their role with the server
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
    return data.user && data.user.role === 'admin';
  } catch (error) {
    console.error('Admin check failed:', error);
    return false;
  }
};

/**
 * Check if the user is a regular user (not an admin)
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
    return data.user && data.user.role !== 'admin';
  } catch (error) {
    console.error('User check failed:', error);
    return false;
  }
};

/**
 * Log out the current user by removing their tokens
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
};