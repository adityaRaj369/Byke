import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/env';

// Note: In production, use proper SSL certificates. This is only for development.
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // For development - ignore SSL certificate errors
  // Remove this in production and use proper HTTPS
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('riderToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('riderToken');
    }
    return Promise.reject(error);
  }
);

export default api;
