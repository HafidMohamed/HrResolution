import { ROUTES } from '@/config/apiConstant';
import axiosInstance from '../http/userAxios';

export const scheduleApi = { 
    getSchedules: async (formData) => {
    const response = await axiosInstance.post(ROUTES.GETDEPARTMENTSCHEDULES, {formData});
    return response;
  },
  getSchedule: async (scheduleId) => {
    const response = await axiosInstance.post(ROUTES.GETDEPARTMENTSCHEDULE, {scheduleId});
    return response;
  },
  deleteSchedule: async (scheduleId) => {
    const response = await axiosInstance.delete(`${ROUTES.DELETEDEPARTMENTSCHEDULE}/${scheduleId}`);
    return response;
  },updateSchedule: async (updatedFormData) => {
    const response = await axiosInstance.put(ROUTES.UPDATESCHEDULE, {updatedFormData});
    return response;
  },
};