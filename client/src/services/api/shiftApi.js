import { ROUTES } from '@/config/apiConstant';
import axiosInstance from '../http/userAxios';

export const shiftApi = { 
    getShifts: async (_id) => {
        const response = await axiosInstance.get(`${ROUTES.GETSHIFTS}/${_id}`);
        return response.data;
      },
};