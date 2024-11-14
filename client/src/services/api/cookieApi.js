import { ROUTES } from '@/config/apiConstant';
import axiosInstance from '../http/userAxios';

export const coockieApi = { 
    sendCoockies: async (userPreferences) => {
    const response = await axiosInstance.post(ROUTES.SENDCOOKIES, userPreferences);
    return response;
  },
  }