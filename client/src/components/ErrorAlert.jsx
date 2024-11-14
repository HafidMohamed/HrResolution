import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import useTranslation from '../hooks/useTranslation';

const ErrorAlert = ({ error }) => {
  const { e } = useTranslation();
  const [translatedError, setTranslatedError] = useState('');

  useEffect(() => {
    const translateError = async () => {
      if (error) {
        const translated = await e(error);
        setTranslatedError(translated);
      }
    };

    translateError();
  }, [error, e]);

  if (!error) return null;

  return (
    <Alert variant="destructive">
      <AlertDescription>{translatedError}</AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;