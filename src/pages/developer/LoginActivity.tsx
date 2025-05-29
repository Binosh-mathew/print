import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
import { ArrowLeft } from 'lucide-react';
import DeveloperLayout from '@/components/layouts/DeveloperLayout';

export default function LoginActivity() {
  const [loginActivity, setLoginActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLoginActivity = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/login-activity');
        setLoginActivity(response.data);
      } catch (error) {
        console.error('Error fetching login activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoginActivity();
  }, []);

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
            <h1 className="text-3xl font-bold">Login Activity</h1>
            <p className="text-gray-600">View recent login attempts and user sessions</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Login Activity</CardTitle>
            <CardDescription>Track all login attempts and user sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading activity...</span>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginActivity.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No login activity found
                        </TableCell>
                      </TableRow>
                    ) : (
                      loginActivity.map((log) => (
                        <TableRow key={log._id || log.id}>
                          <TableCell className="font-medium">{log.userName || 'N/A'}</TableCell>
                          <TableCell>{log.userRole || 'N/A'}</TableCell>
                          <TableCell>
                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                          </TableCell>
                          <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              log.action === 'login' 
                                ? 'bg-green-100 text-green-800' 
                                : log.action === 'logout'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {log.action || 'N/A'}
                            </span>
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
