// components/GoogleLoginButton.jsx
import { Button } from './ui/button';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

export const GoogleLoginButton = () => {
  const { googleLogin, isLoading, error } = useGoogleAuth();

  return (
    <>
      <Button
        onClick={() => googleLogin()}
        disabled={isLoading}
        variant="outline"
        className="w-full"
      >
        {isLoading ? (
          <span className="loading loading-spinner" />
        ) : (
          <>
            <FcGoogle className="mr-2 h-4 w-4" />
            Continue with Google
          </>
        )}
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </>
  );
};