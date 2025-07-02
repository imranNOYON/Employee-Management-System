// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();

  // 1. Not logged in → redirect to login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role restricted route → redirect if wrong role
  if (role && user.role !== role) {
    // you could redirect to a “not authorized” page or to their own dashboard
    return <Navigate to="/" replace />;
  }

  // 3. Authorized → render children
  return children;
}
