// components/ProtectedPage.jsx
import React from 'react';
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedPage = ({ children, roles }) => {
  const { user } = useAuth();

  if (!roles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedPage;