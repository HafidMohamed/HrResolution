import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { authApi } from '@/services/api/authApi';


const  VerifyEmailForm =() => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        await authApi.verifyEmail(token);
        alert('Email verified successfully. You can now log in.');
        navigate(`/${language}/login`);
      } catch (error) {
        console.error('Email verification error:', error);
      }
    }

    verify()
  }, [token, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen dark:bg-gray-800 text-gray-900 dark:text-white">

    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Verify Email</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Verifying your email...</p>
      </CardContent>
    </Card>
    </div>
  );
};
export default VerifyEmailForm;