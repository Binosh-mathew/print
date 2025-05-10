import React from 'react';
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
import {
  platformStats,
  loginActivity,
} from '@/services/mockData';
import DeveloperLayout from '@/components/layouts/DeveloperLayout';

const DeveloperDashboard = () => {
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
              <p className="text-2xl">{platformStats.dailyOrders} today</p>
              <p className="text-sm text-muted-foreground">
                {platformStats.monthlyOrders} this month
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Revenue</h3>
              <p className="text-2xl">${platformStats.monthlyRevenue}</p>
              <p className="text-sm text-muted-foreground">This month</p>
            </div>
            <div>
              <h3 className="font-semibold">Active Users</h3>
              <p className="text-2xl">{platformStats.activeStores} stores</p>
              <p className="text-sm text-muted-foreground">
                {platformStats.activeAdmins} admins
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
                {loginActivity.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.userName}</TableCell>
                    <TableCell>{log.userRole}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.ipAddress}</TableCell>
                    <TableCell>{log.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DeveloperLayout>
  );
};

export default DeveloperDashboard; 