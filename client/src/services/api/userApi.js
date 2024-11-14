import { ROUTES } from '@/config/apiConstant';
import axiosInstance from '../http/userAxios';

export const userApi = {
  updateProfile: async (userData) => {
    const response = await axiosInstance.put('/users/profile', userData);
    return response.data;
  }, 
  
  getSetUpData: async (_id) => {
    const response = await axiosInstance.post(`${ROUTES.CREATEUSER}/${_id}`);
    return response.data;
  },
  saveUserProfile: async (formData,role) => {
    const response = await axiosInstance.post(ROUTES.CREATEUSERPROFILE, {formData,role});
    return response;
  },
  getUsers: async (formData) => {
    const response = await axiosInstance.post(ROUTES.GETUSERS, {formData});
    return response;
  },
  getProfile: async (_id) => {
    const response = await axiosInstance.get(`${ROUTES.PROFILE}/${_id}`);
    return response.data;
  },
  searchQuery: async ({query,company}) => {
    const response = await axiosInstance.post(ROUTES.SEARCHQUERY, {query,company});
    return response;
  },
  getStats: async (userId) => {
    const response = await axiosInstance.get(`${ROUTES.GETSTATS}/${userId}`);
    return response;
  },
};