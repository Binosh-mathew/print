import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  endTime: string | null;
}

const MaintenanceMode: React.FC = () => {
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus>({
    enabled: true,
    message: 'System is currently under maintenance. Please try again later.',
    endTime: null
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/system/maintenance');
        setMaintenanceStatus(response.data);
      } catch (error) {
        console.error('Error fetching maintenance status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!maintenanceStatus.enabled) {
    // If maintenance mode is not enabled, redirect to home
    navigate('/');
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>System Maintenance</CardTitle>
          <CardDescription>We're currently performing maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-yellow-500"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <p className="text-center">{maintenanceStatus.message}</p>
            {maintenanceStatus.endTime && (
              <p className="text-center text-sm text-muted-foreground">
                Expected to be back online: {new Date(maintenanceStatus.endTime).toLocaleString()}
              </p>
            )}
          </div>
        </CardContent>
        {/* CardFooter removed as requested */}
      </Card>
    </div>
  );
};

export default MaintenanceMode;
