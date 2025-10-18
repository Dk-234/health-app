import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for API - should match backend server
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://10.50.69.225:3000/api';

// Create axios instance with JWT interceptor
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      AsyncStorage.removeItem('userToken');
      // Could trigger logout here
    }
    return Promise.reject(error);
  }
);

/**
 * Preferences Service
 * Handles all preference-related API calls
 */
const preferencesService = {
  /**
   * Get all user preferences
   * @returns {Promise} - User preferences object
   */
  getPreferences: async () => {
    try {
      const response = await apiClient.get('/auth/preferences');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to get preferences');
    } catch (error) {
      console.error('Error getting preferences:', error);
      throw error;
    }
  },

  /**
   * Initialize default preferences for user
   * @returns {Promise} - Initialized preferences object
   */
  initializePreferences: async () => {
    try {
      const response = await apiClient.post('/auth/preferences/init');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to initialize preferences');
    } catch (error) {
      console.error('Error initializing preferences:', error);
      throw error;
    }
  },

  /**
   * Update a single preference
   * @param {string} key - Preference key (e.g., 'dataSharing', 'analyticsEnabled')
   * @param {boolean} value - New preference value
   * @returns {Promise} - Updated preference
   */
  updatePreference: async (key, value) => {
    try {
      if (typeof value !== 'boolean') {
        throw new Error('Preference value must be a boolean');
      }

      const response = await apiClient.put(`/auth/preferences/${key}`, {
        value,
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to update preference');
    } catch (error) {
      console.error('Error updating preference:', error);
      throw error;
    }
  },

  /**
   * Reset a preference to its default value
   * @param {string} key - Preference key to reset
   * @returns {Promise} - Reset preference
   */
  resetPreference: async (key) => {
    try {
      const response = await apiClient.delete(`/auth/preferences/${key}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to reset preference');
    } catch (error) {
      console.error('Error resetting preference:', error);
      throw error;
    }
  },

  /**
   * Get notification settings
   * @returns {Promise} - Notification preferences object
   */
  getNotifications: async () => {
    try {
      const response = await apiClient.get('/auth/preferences/notifications');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to get notification settings');
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  /**
   * Update all notification settings at once
   * @param {object} notifications - Notification settings object
   * @returns {Promise} - Updated notification settings
   */
  updateNotifications: async (notifications) => {
    try {
      const response = await apiClient.put('/auth/preferences/notifications', notifications);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to update notifications');
    } catch (error) {
      console.error('Error updating notifications:', error);
      throw error;
    }
  },

  /**
   * Change user password
   * @param {object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @param {string} passwordData.confirmPassword - Password confirmation
   * @returns {Promise} - Success message
   */
  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.post('/auth/change-password', passwordData);
      if (response.data.success) {
        return response.data.message;
      }
      throw new Error(response.data.error || 'Failed to change password');
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  /**
   * Update user profile information
   * @param {object} profileData - Profile data to update
   * @param {string} profileData.name - User name (optional)
   * @param {number} profileData.age - User age (optional)
   * @param {string} profileData.phone - User phone (optional)
   * @returns {Promise} - Updated user profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.patch('/auth/profile', profileData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to update profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Get user profile information
   * @param {string} uid - User ID
   * @returns {Promise} - User profile
   */
  getProfile: async (uid) => {
    try {
      const response = await apiClient.get(`/auth/profile/${uid}`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to get profile');
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  },
};

export default preferencesService;
