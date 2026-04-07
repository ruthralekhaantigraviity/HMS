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
    console.log('Attaching Authorization Header:', config.headers.Authorization);
  }
  return config;
});

// Add a response interceptor for debugging
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default instance;
