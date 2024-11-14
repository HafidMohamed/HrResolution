// hooks/useGoogleAuth.js
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api/authApi';
import { useGoogleLogin } from '@react-oauth/google';
import { storeUserProfile } from '@/store/slices/authSlice';
import useTranslation from './useTranslation';

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { language } = useTranslation();

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get user info from Google
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${response.access_token}` },
          }
        );
        
        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info from Google');
        }

        const userInfo = await userInfoResponse.json();
        
        // Send to your backend
        const res = await authApi.google({
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          sub: userInfo.sub
        });

        dispatch(storeUserProfile({response:res,rememberMe:true}));
        navigate(`/${language}/dashboard`);

        
      } catch (err) {
        setError(err.message || 'Failed to authenticate with Google');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Google login failed');
      setIsLoading(false);
    }
  });

  return { googleLogin, isLoading, error };
};

