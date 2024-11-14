import React, {  useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch  } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/ui/card";
import { storeUserProfile } from '../store/slices/authSlice';
import { authApi } from '@/services/api/authApi';

const OTP_LENGTH = 6;

const  TwoFactorForm =() => {
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef([]);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const email = location.state?.email;
  const rememberMe=location.state?.rememberMe;
  const [error, setError] = useState('');


  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = async (element, index) => {
    if (isNaN(Number(element.value))) return false

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value !== '') {
      if (index < OTP_LENGTH ) {
        inputRefs.current[index + 1]?.focus();
      } else {
        handleSubmit();
      }
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
        inputRefs.current[index - 1]?.focus();
    }
};
const handleSubmit = async () => {
  try {
    setError('');
    const otpString = otp.join('');
    const response = await authApi.verifyTwoFactor( email,otpString );
    if (response) {
      dispatch(storeUserProfile({response,rememberMe}));
      navigate(`/${language}/dashboard`)
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Two-factor verification error:', error);
    setError(error.response?.data?.message || 'An error occurred during verification');
    // Reset OTP inputs on error
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus()
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};


  return (
    <div className="flex justify-center items-center min-h-screen dark:bg-gray-800 text-gray-900 dark:text-white">

<Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>Enter the 6-digit code sent to your device</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          {otp.map((data, index) => (
            <Input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              ref={el => inputRefs.current[index] = el}
              value={data}
              onChange={e => handleChange(e.target, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              className="w-12 h-12 text-center text-2xl"
            />
          ))}
        </div>
        <Button onClick={handleSubmit} className="w-full">Verify</Button>
      </CardContent>
    </Card>
    </div>
  );
};
export default TwoFactorForm;