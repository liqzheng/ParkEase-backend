import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true, // Important: Allow sending cookies (session)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Can add token here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      // Server returned an error status code
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized, redirect to login page
        window.location.href = '/login';
      }
      
      // Return error message
      return Promise.reject(data || error);
    }
    
    return Promise.reject(error);
  }
);

export default api;
