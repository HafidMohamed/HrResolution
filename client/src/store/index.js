import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import empReducer from './slices/empSlice';
import { setupInterceptors } from '../services/http/axiosInstance';
import { setupInterceptorsUser } from '../services/http/userAxios';


const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    init: empReducer,
  },
});

setupInterceptors(store);
setupInterceptorsUser(store);

export default store;