import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://agrofund.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required to send and receive cookies (JWT)
});

// Since backend uses HTTP-only cookies, we don't need to manually attach the Bearer token.
// The browser will automatically include the 'Authentication' cookie in every request.
api.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error?.response?.data || error);
  }
);

export default api;
