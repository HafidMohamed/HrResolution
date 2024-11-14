import { ROUTES } from '@/config/apiConstant';
import axiosInstance from '../http/userAxios';

export const notiApi = { 
    getAllNotifications: async () => {
    const response = await axiosInstance.get(ROUTES.GETALLNOTIFICATIONS);
    return response;
  },
  getUnreadNotifications: async (userId) => {
    const response = await axiosInstance.post(ROUTES.GETUNREADNOTIFICATIONS, {userId});
    return response;
  },
  markNotificationRead: async (notificationId) => {
    const response = await axiosInstance.post(`/notifications/${notificationId}/read`);
    return response;
  },
};