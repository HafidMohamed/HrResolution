// logoutUtil.js
import store from '../store';
import { logout } from '../store/slices/authSlice';

export const performLogout = async (navigate, language) => {
  try {
    await store.dispatch(logout()).unwrap();
    if (navigate && language) {
      navigate(`/${language}/login`);
    }
  } catch (error) {
    console.error('Failed to logout:', error);
  }
};