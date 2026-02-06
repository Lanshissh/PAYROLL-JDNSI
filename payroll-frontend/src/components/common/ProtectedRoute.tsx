import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import React from 'react';

type Props = {
  allow: string[];
  children: React.ReactNode;
};

export default function ProtectedRoute({ allow, children }: Props) {
  const { role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!role || !allow.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}