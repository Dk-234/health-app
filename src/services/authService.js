// MongoDB Authentication Service
// Communicates with backend Express API

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// API Base URL - Update this to match your backend server
// IMPORTANT: Use your actual machine IP for Expo Go testing!
// Your Machine IP: 10.50.69.225
// 
// For different environments:
// - Web (localhost): http://localhost:3000/api
// - Android Emulator: http://10.0.2.2:3000/api
// - Physical device/Expo Go: http://10.50.69.225:3000/api (YOUR IP)
const API_BASE_URL = 'http://10.50.69.225:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for network calls
});

export const authService = {
  // Register new user
  register: async (email, password, name) => {
    try {
      console.log('📤 Registering user:', { email, name, apiUrl: API_BASE_URL });
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        name,
      });

      console.log('✅ Registration successful:', response.data);
      return {
        uid: response.data.uid,
        email: response.data.email,
        name: response.data.name,
        profileCompleted: response.data.profileCompleted,
      };
    } catch (error) {
      console.error('❌ Registration error:', error.message);
      console.error('Error details:', error.response?.data || error);
      throw new Error(error.response?.data?.error || error.message || 'Registration failed');
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      console.log('📤 Logging in user:', { email });
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      console.log('✅ Login successful:', response.data);
      return {
        uid: response.data.uid,
        email: response.data.email,
        name: response.data.name,
        age: response.data.age,
        phone: response.data.phone,
        avatar: response.data.avatar,
        createdAt: response.data.createdAt,
        profileCompleted: response.data.profileCompleted,
        token: response.data.token,
      };
    } catch (error) {
      console.error('❌ Login error:', error.message);
      console.error('Error details:', error.response?.data || error);
      throw new Error(error.response?.data?.error || error.message || 'Login failed');
    }
  },

  // Get security questions
  getSecurityQuestions: async () => {
    try {
      const response = await apiClient.get('/auth/security-questions');
      return response.data.questions;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch security questions');
    }
  },

  // Complete profile setup with security questions
  completeProfile: async (uid, age, phone, avatar, securityQuestions) => {
    try {
      const response = await apiClient.post('/auth/complete-profile', {
        uid,
        age,
        phone,
        avatar,
        securityQuestions,
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to complete profile');
    }
  },

  // Update user profile
  updateProfile: async (uid, updates) => {
    try {
      const response = await apiClient.post('/auth/update-profile', {
        uid,
        ...updates,
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update profile');
    }
  },

  // Reset password using security questions
  resetPassword: async (email, answers, newPassword) => {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        email,
        answers,
        newPassword,
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to reset password');
    }
  },

  // Get user profile
  getProfile: async (uid) => {
    try {
      const response = await apiClient.get(`/auth/profile/${uid}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch profile');
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@user_data');
      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  // Load users from storage (initialize)
  loadUsers: async () => {
    try {
      // Placeholder for compatibility - MongoDB is persistent on backend
      console.log('MongoDB is the source of truth - no local loading needed');
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }
};

// Health data service (mock)
export const healthService = {
  getTodaySummary: async (userId) => {
    try {
      // Return mock health data
      return {
        steps: Math.floor(Math.random() * 10000) + 2000,
        calories: Math.floor(Math.random() * 1000) + 500,
        heartRate: Math.floor(Math.random() * 40) + 60,
        sleepHours: Math.floor(Math.random() * 4) + 6
      };
    } catch (error) {
      throw error;
    }
  },

  getHealthHistory: async (userId, days = 7) => {
    try {
      // Return mock historical data
      const data = [];
      for (let i = 0; i < days; i++) {
        data.push({
          date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
          steps: Math.floor(Math.random() * 10000) + 2000,
          calories: Math.floor(Math.random() * 1000) + 500,
          heartRate: Math.floor(Math.random() * 40) + 60,
          sleepHours: Math.floor(Math.random() * 4) + 6
        });
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  saveHealthData: async (userId, data) => {
    try {
      // Mock save
      console.log('Saving health data:', data);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
};
