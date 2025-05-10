import React, { useState, useEffect } from 'react';
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
import DeveloperLayout from '@/components/layouts/DeveloperLayout';
import axios from 'axios';

const DeveloperDashboard = () => {
  const [stats, setStats] = useState({
    dailyOrders: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0,
    activeStores: 0,
    activeAdmins: 0,
  });
  const [loginActivity, setLoginActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatsAndActivity = async () => {
      setLoading(true);
      try {
        const statsRes = await axios.get('http://localhost:5000/api/platform-stats');
        setStats(statsRes.data);
        const activityRes = await axios.get('http://localhost:5000/api/login-activity');
        setLoginActivity(activityRes.data);
      } catch (error) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchStatsAndActivity();
  }, []);

  return (
    <DeveloperLayout>
      <div className="space-y-6">
        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Statistics</CardTitle>
            <CardDescription>Overview of platform performance</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold">Orders</h3>
              <p className="text-2xl">{stats.dailyOrders} today</p>
              <p className="text-sm text-muted-foreground">
                {stats.monthlyOrders} this month
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Revenue</h3>
              <p className="text-2xl">${stats.monthlyRevenue}</p>
              <p className="text-sm text-muted-foreground">This month</p>
            </div>
            <div>
              <h3 className="font-semibold">Active Users</h3>
              <p className="text-2xl">{stats.activeStores} stores</p>
              <p className="text-sm text-muted-foreground">
                {stats.activeAdmins} admins
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Login Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Login Activity</CardTitle>
            <CardDescription>Recent login attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
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
                      <TableCell colSpan={5} className="text-center">No activity found</TableCell>
                    </TableRow>
                  ) : (
                    loginActivity.map((log) => (
                      <TableRow key={log._id || log.id}>
                        <TableCell>{log.userName}</TableCell>
                        <TableCell>{log.userRole}</TableCell>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{log.ipAddress}</TableCell>
                        <TableCell>{log.action}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DeveloperLayout>
  );
};

export default DeveloperDashboard; 