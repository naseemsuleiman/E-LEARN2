// utils/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh');
        const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
          refresh: refreshToken
        });
        
        localStorage.setItem('access', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return axios(originalRequest);
      } catch (err) {
        console.error('Refresh token failed', err);
        // Handle logout here if needed
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;