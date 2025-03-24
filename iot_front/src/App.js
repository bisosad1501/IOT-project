// Main.js

import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import UserProvider, { UserState } from 'contexts/UserContext'; 
import { ChakraProvider } from '@chakra-ui/react';
import initialTheme from './theme/theme';
import { useState, useEffect } from 'react';

function ProtectedRoute({ isLoggedIn, children }) {
  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

export default function Main() {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <ChakraProvider theme={currentTheme}>
      <UserProvider> 
        <Routes>
          <Route path="auth/*" element={<AuthLayout />} />
          <Route
            path="admin/*"
            element={
              <ProtectedRouteWrapper>
                <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
              </ProtectedRouteWrapper>
            }
          />
          <Route path="/" element={<Navigate to="/admin" replace />} />
        </Routes>
      </UserProvider>
    </ChakraProvider>
  );
}

function ProtectedRouteWrapper({ children }) {
  const { user } = UserState();  
  
  const isLoggedIn = !!user;  
  
  return <ProtectedRoute isLoggedIn={isLoggedIn}>{children}</ProtectedRoute>;
}
