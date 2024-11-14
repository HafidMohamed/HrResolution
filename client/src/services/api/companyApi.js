import { ROUTES } from '@/config/apiConstant';
import axiosInstance from '../http/userAxios';

export const companyApi = { 
    saveCompanyProfile: async (formData) => {
    const response = await axiosInstance.post(ROUTES.CREATECOMPANY, {formData});
    return response;
  },
  getCompanies: async (user) => {
    console.log(ROUTES.GETCOMPANIES);
    const response = await axiosInstance.post(ROUTES.GETCOMPANIES, {user});
    return response.data;
  },
};