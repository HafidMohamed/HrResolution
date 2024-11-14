import axios from 'axios';
import { API_BASE_URL } from '../../config/constants';
import { logout, refreshToken } from '@/store/slices/authSlice';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    
  },
  withCredentials: true, // Add this line

});

export const setupInterceptors = (store) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await store.dispatch(refreshToken());
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          if (error.response.data.code === 'TOKEN_EXPIRED') {
            store.dispatch(logout());
            return Promise.reject(error);
          }
          console.error('Token refresh failed:', refreshError);
          await store.dispatch(logout());
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};

export default axiosInstance;