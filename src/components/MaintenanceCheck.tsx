import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import MaintenanceMode from './MaintenanceMode';
import { useAuth } from '@/contexts/AuthContext';

interface MaintenanceCheckProps {
  children: React.ReactNode;
}

const MaintenanceCheck: React.FC<MaintenanceCheckProps> = ({ children }) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/system/maintenance');
        setMaintenanceMode(response.data.enabled);
      } catch (error) {
        console.error('Error checking maintenance mode:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkMaintenanceMode();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Check if we're on the developer login page
  const isDevLoginPage = location.pathname === '/developer/login';
  
  // Check if we're on any developer page
  const isDevPage = location.pathname.startsWith('/developer');
  
  // Check if the user is a developer
  const isDeveloper = user?.role === 'developer';
  
  // If maintenance mode is enabled, only allow access to:
  // 1. Developer login page
  // 2. Any developer page if the user is a developer
  if (maintenanceMode && !(isDevLoginPage || (isDevPage && isDeveloper))) {
    return <MaintenanceMode />;
  }

  // Otherwise, render the children
  return <>{children}</>;
};

export default MaintenanceCheck;
