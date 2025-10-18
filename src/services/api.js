import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL - Replace with your actual backend URL
const API_BASE_URL = 'https://your-api-backend.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      AsyncStorage.removeItem('@auth_token');
      AsyncStorage.removeItem('@user_data');
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: async (email, password, captchaToken) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        captchaToken,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  register: async (userData, captchaToken) => {
    try {
      const response = await api.post('/auth/register', {
        ...userData,
        captchaToken,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  resetPassword: async (email, captchaToken) => {
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        captchaToken,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  verifyCaptcha: async (captchaToken) => {
    try {
      const response = await api.post('/auth/verify-captcha', {
        captchaToken,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Health Data API endpoints
export const healthAPI = {
  getHealthMetrics: async () => {
    try {
      const response = await api.get('/health/metrics');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getHeartRateData: async (period = '7d') => {
    try {
      const response = await api.get(`/health/heart-rate?period=${period}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getStepsData: async (period = '7d') => {
    try {
      const response = await api.get(`/health/steps?period=${period}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getSleepData: async (period = '7d') => {
    try {
      const response = await api.get(`/health/sleep?period=${period}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getCaloriesData: async (period = '7d') => {
    try {
      const response = await api.get(`/health/calories?period=${period}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateHealthMetric: async (metricType, value) => {
    try {
      const response = await api.post('/health/metrics', {
        metricType,
        value,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default api;
