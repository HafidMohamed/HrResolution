import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/ui/card";
import { Label } from "@/components/ui/label";
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/api/authApi';
import { storeUserProfile } from '@/store/slices/authSlice';
import { useDispatch  } from 'react-redux';



const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();  
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(false);



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setError('');
    try {
      const response = await authApi.register(username, email, password);
      dispatch(storeUserProfile(response));
      navigate(`/${language}/dashboard`);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'An error occurred during registration');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 dark:bg-gray-800 text-gray-900 dark:text-white ">
      <Card className="w-full max-w-md">
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to create your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" type="text" autoComplete="name"
                required
                placeholder="Full Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} />
                 <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" name="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} />
                <button
                type="button"
                className="absolute inset-y-11 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full">Register</Button>
          <div className="relative">
            <div className="relative flex justify-center text-xs uppercase   dark:text-white">
              <span >Or continue with</span>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            <FcGoogle className="mr-2 h-4 w-4" />
            Google
          </Button>
          {error && (
            <Alert variant={error.includes('successful') ? 'default' : 'destructive'}>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;