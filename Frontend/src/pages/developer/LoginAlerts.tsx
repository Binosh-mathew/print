import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, CheckCircle, Trash2 } from 'lucide-react';
import DeveloperLayout from '@/components/layouts/DeveloperLayout';
import { fetchLoginAlerts, resolveLoginAlert, clearResolvedAlerts } from '@/api';
import { LoginAlert } from '@/types/loginAlert';
import { toast } from '@/hooks/use-toast';

export default function LoginAlerts() {
  const [alerts, setAlerts] = useState<LoginAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedCount, setResolvedCount] = useState(0);
  const navigate = useNavigate();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchLoginAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching login alerts:', error);
      toast({
        title: "Error",
        description: "Failed to load login alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = async (alertId: string) => {
    try {
      await resolveLoginAlert(alertId);
      setAlerts(alerts.filter(alert => alert._id !== alertId));
      setResolvedCount(prev => prev + 1);
      toast({
        title: "Success",
        description: "Alert marked as resolved",
        variant: "default",
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  };

  const handleClearResolved = async () => {
    if (resolvedCount === 0) return;
    
    try {
      await clearResolvedAlerts();
      setResolvedCount(0);
      toast({
        title: "Success",
        description: `${resolvedCount} resolved alerts cleared`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error clearing resolved alerts:', error);
      toast({
        title: "Error",
        description: "Failed to clear resolved alerts",
        variant: "destructive",
      });
    }
  };

  return (
    <DeveloperLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Login Security Alerts</h1>
            <p className="text-gray-600">Track failed admin login attempts</p>
          </div>
          
          {resolvedCount > 0 && (
            <Button 
              variant="outline" 
              onClick={handleClearResolved}
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear {resolvedCount} Resolved
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              <CardTitle>Failed Admin Login Attempts</CardTitle>
            </div>
            <CardDescription>
              Review suspicious login activity and take action
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading alerts...</span>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Last Attempt</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No suspicious login activity detected
                        </TableCell>
                      </TableRow>
                    ) : (
                      alerts.map((alert) => (
                        <TableRow key={alert._id} className={alert.attemptCount >= 5 ? 'bg-red-50' : ''}>
                          <TableCell className="font-medium">{alert.email}</TableCell>
                          <TableCell>{alert.ipAddress}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              alert.attemptCount >= 5 
                                ? 'bg-red-100 text-red-800' 
                                : alert.attemptCount >= 3
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {alert.attemptCount}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(alert.lastAttempt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleResolve(alert._id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DeveloperLayout>
  );
}
