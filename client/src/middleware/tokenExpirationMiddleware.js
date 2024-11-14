// tokenExpirationMiddleware.js
import { performLogout } from '../utils/logoutUtil';

export const tokenExpirationMiddleware = store => next => action => {
  if (action.type === 'auth/refreshToken/rejected') {
    // Token refresh failed, likely due to expiration
    performLogout();
  }
  return next(action);
};