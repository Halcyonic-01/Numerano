import axios from 'axios';

// Create axios instance pointing to your backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Matches your backend port
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