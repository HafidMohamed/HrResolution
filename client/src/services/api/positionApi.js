import { ROUTES } from '@/config/apiConstant';
import axiosInstance from '../http/userAxios';

export const positionApi = { 
    savePositionProfile: async (formData) => {
    const response = await axiosInstance.post(ROUTES.CREATEPOSITION, {formData});
    return response;
  },
  getPositions: async (formData) => {
    const response = await axiosInstance.post(ROUTES.GETPOSITIONS, {formData});
    return response;
  },
  deletePosition: async (_id) => {
    const response = await axiosInstance.delete(`${ROUTES.DELETEPOSITION}/${_id}`);
    return response;
  },
};