import React, { useEffect } from 'react';
import {useSelector, useDispatch } from 'react-redux';
import { checkAuthStatus } from '../store/slices/authSlice';

function AuthCheck({ children }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
    const interval = setInterval(() => {
      dispatch(checkAuthStatus());
    }, 7 * 24 * 60 * 60 * 1000); // Check every 7

    return () => clearInterval(interval);
    }
}, [dispatch, isAuthenticated]);

  return <>{children}</>;
};

export default AuthCheck;