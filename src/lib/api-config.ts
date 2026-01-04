// API configuration for local backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};
