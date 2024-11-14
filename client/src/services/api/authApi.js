import axiosInstance from '../http/axiosInstance';
import { ROUTES } from '../../config/constants';

export const authApi = {
  login: async (email, password,rememberMe) => {
    const response = await axiosInstance.post(ROUTES.LOGIN,  { email, password, rememberMe });
    return response.data;
  },
  register: async (username, email, password) => {
    const response = await axiosInstance.post(ROUTES.REGISTER, {username, email, password});
    return response.data;
  },
  google: async ({email, name, picture, sub}) => {
    const response = await axiosInstance.post(ROUTES.GOOGLE,   { email, name, picture, sub });
    return response.data;
  },
  fetchUserProfile: async () => {
    const response = await axiosInstance.get(ROUTES.PROFILE);
    return response.data;
  },
  
  logout: async (token) => {
    // If your backend has a logout endpoint, you can call it here
    // For now, we'll just clear the local storage
    const response = await axiosInstance.post(ROUTES.LOGOUT ,{ token : token });
    return response.data;
  },
  refreshToken: async (refreshToken) => {
    const response = await axiosInstance.post(ROUTES.REFRESH_TOKEN, {refreshToken});
    return response;
  },
   verifyEmail : async (token) => {
    const response = await axiosInstance.get(ROUTES.VERIFY_EMAIL +`/${token}`)
    return response.data
  },
  
    verifyTwoFactor : async (email, code) => {
    const response = await axiosInstance.post(ROUTES.VERIFY_2FA, { email, code})
    return response.data
  },
  checkAuthStatus : async () => {
    const response = await axiosInstance.get(ROUTES.CHECKAUTH);
    return response
  },
  
};