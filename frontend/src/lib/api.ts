import axios from 'axios';

// Create axios instance pointing to your backend
const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Changed back to port 5001 to match .env
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the Token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;