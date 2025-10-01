import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isTokenValid } from "../utils/tokenService";
import { logout } from '../utils/authService';

export const ProtectedRoute = () => {
  if (isTokenValid()) {
    return <Outlet />; 
  } else {
    logout();
    return <Navigate to="/login" replace />;  
  }
};