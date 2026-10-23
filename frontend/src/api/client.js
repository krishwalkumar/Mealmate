import axios from 'axios';

// Create pre-configured Axios client instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor to automatically attach JWT token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mealmate_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error processing
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error message extraction
    const customError = {
      message: error.response?.data?.error?.message || error.message || 'Network Error',
      status: error.response?.status || 500,
      data: error.response?.data || null
    };
    return Promise.reject(customError);
  }
);

export default apiClient;

