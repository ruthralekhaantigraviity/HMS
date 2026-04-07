import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000'),
});

console.log('Axios Initialized with baseURL:', instance.defaults.baseURL);

// Add a request interceptor to include the token if it exists
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('hms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
