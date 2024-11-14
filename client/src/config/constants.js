import { API_BASE_URL as url } from './apiConstant';
export const API_BASE_URL = `${url}auth`; // Replace with your actual API URL
export const GOOGLE_AUTH_URL = `${API_BASE_URL}google`;
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  GOOGLE: '/google',
  LOGOUT: '/logout',
  REFRESH_TOKEN:'/refresh-token',
  VERIFY_EMAIL:'/verify-email',
  VERIFY_2FA:'/verify-2fa',
  CHECKAUTH:'/check-auth'
};
