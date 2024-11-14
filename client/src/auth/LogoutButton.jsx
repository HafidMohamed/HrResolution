import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';

const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <Button onClick={logout}>
      Logout
    </Button>
  );
};

export default LogoutButton;