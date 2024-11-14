import { ROUTES } from '@/config/apiConstant';
import axiosInstance from '../http/userAxios';

export const departmentApi = { 
    saveDepartmentProfile: async (formData) => {
    const response = await axiosInstance.post(ROUTES.CREATEDEPARTMENT, {formData});
    return response;
  },
    getCompanyDepartment: async (formData) => {
      const response = await axiosInstance.post(ROUTES.GETCOMPANYDEPARTMENT, {formData});
      return response.data;
    },
  getDepartments: async (user) => {
    const response = await axiosInstance.post(ROUTES.GETDEPARTMENTS, {user});
    return response;
  },
  getDepartmentData: async (formData) => {
    const response = await axiosInstance.post(ROUTES.GETDEPARTMENTDATA, {formData});
    return response;
  },
  saveSchedule: async (formData) => {
    const response = await axiosInstance.post(ROUTES.SAVESCHEDULE, {formData});
    return response;
  },
  getSchedules: async (formData) => {
    const response = await axiosInstance.post(ROUTES.GETSCHEDULES, {formData});
    return response;
  },
};
