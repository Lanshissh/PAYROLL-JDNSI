import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function RequireAuth({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}