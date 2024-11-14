import React, {useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/ui/card";
import { Label } from "@/components/ui/label";
import { FcGoogle } from 'react-icons/fc';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { googleLogin, storeUserProfile } from '../store/slices/authSlice';
import { useDispatch , useSelector } from 'react-redux';
import { authApi } from '@/services/api/authApi';
import { useGoogleLogin } from '@react-oauth/google';
import useTranslation from '@/hooks/useTranslation';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';


const LoginPage = () => {
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState('');
  const { t,getTranslations,language } = useTranslation();
  const [translations, setTranslations] = useState({});
  useEffect(() => {
    const updateTranslations = async () => {
      const newTranslations = {
        //signIn: await t('signIn','Sign In'),
        
      };
      setTranslations(prev => ({
        ...prev,
        ...newTranslations
      }));
    console.log(localStorage.getItem('refreshToken'),sessionStorage.getItem('refreshToken'));
    };

    updateTranslations();
  }, [language, t]);
  useEffect(() => {
    const fetchTranslations = async () => {
      const keys = ['notifications', 'profile', 'logout', 'profileUpdateSuccessful','newMessage','signUp','signIn'];
      const newTranslations = await getTranslations(keys);
      setTranslations(newTranslations);
    };
    fetchTranslations();
  }, [language, getTranslations]);


  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await authApi.login(email,password,rememberMe);
      if (response.requiresTwoFactor) {
        navigate(`/${language}/two-factor`, { state: { email,rememberMe } });
      } else {
      dispatch(storeUserProfile({response,rememberMe}));
      navigate(`/${language}/dashboard`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login');
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      console.log('Google Login Response:', response.access_token);  // Log entire response
  
      try {
    
        // Send the ID token to your backend
        const res = await authApi.google({token:response.access_token});
  
        // Dispatch action to update Redux store
        dispatch(storeUserProfile({res,rememberMe}));
        navigate(`/${language}/dashboard`);
      } catch (error) {
        console.error('Google authentication failed:', error);
        // Handle error (e.g., show error message to user)
      }
    },
    onError: () => {
      console.error('Google login failed');
      // Handle error (e.g., show error message to user)
    }
  });
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 dark:bg-gray-800 text-gray-900 dark:text-white">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form  onSubmit={handleSubmit}>
        <CardContent className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
            id="email" 
            type="email" 
            autoComplete="email" 
            placeholder="Email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required />
          </div>
          <div className="space-y-2 relative ">
            <Label htmlFor="password">Password</Label>
            <Input 
                autoComplete="current-password"
                required 
                type={showPassword ? 'text' : 'password'} 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                 />
            <button
                type="button"
                className="absolute inset-y-11 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
              </Label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot your password?
              </a>
            </div>
          </div>
         <Button type="submit" className="w-full">Login</Button>
         
        </CardContent>
        </form>
        <CardFooter className="flex flex-col space-y-4">
          <GoogleLoginButton />
        </CardFooter>
        {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        
      </Card>
    </div>
  );
};

export default LoginPage;