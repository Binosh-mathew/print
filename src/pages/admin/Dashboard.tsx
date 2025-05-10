import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  CreditCard, 
  TrendingUp,
  Calendar
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sample chart data (would come from API in real app)
const revenueData = [
  { name: 'Jan', revenue: 1200 },
  { name: 'Feb', revenue: 1900 },
  { name: 'Mar', revenue: 1500 },
  { name: 'Apr', revenue: 2400 },
  { name: 'May', revenue: 2800 },
  { name: 'Jun', revenue: 2300 },
  { name: 'Jul', revenue: 3100 },
];

const ordersData = [
  { name: 'Jan', completed: 40, pending: 24 },
  { name: 'Feb', completed: 30, pending: 13 },
  { name: 'Mar', completed: 20, pending: 8 },
  { name: 'Apr', completed: 27, pending: 15 },
  { name: 'May', completed: 18, pending: 12 },
  { name: 'Jun', completed: 23, pending: 7 },
  { name: 'Jul', completed: 34, pending: 10 },
];

const AdminDashboard = () => {
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    dailyOrders: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0,
    activeStores: 0,
    activeAdmins: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const ordersResponse = await axios.get('http://localhost:5000/api/orders');
        const orders = ordersResponse.data;
        const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentOrders(sortedOrders.slice(0, 5));
        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter((order: any) => order.status === 'Pending').length,
          completedOrders: orders.filter((order: any) => order.status === 'Completed').length,
          totalRevenue: orders.reduce((total: number, order: any) => total + (order.totalPrice || 0), 0),
          dailyOrders: orders.filter((order: any) => order.createdAt.toDateString() === new Date().toDateString()).length,
          monthlyOrders: orders.filter((order: any) => order.createdAt.toDateString().startsWith(new Date().toDateString().split(' ')[3])).length,
          monthlyRevenue: orders.reduce((total: number, order: any) => total + (order.totalPrice || 0), 0),
          activeStores: orders.filter((order: any) => order.store.status === 'active').length,
          activeAdmins: orders.filter((order: any) => order.store.admin.status === 'active').length,
          totalUsers: orders.filter((order: any) => order.user.status === 'active').length,
        });
      } catch (error) {
        // handle error
      }
    };
    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of print shop operations and metrics</p>
        </div>
        
        {/* Statistics Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Overview</CardTitle>
            <CardDescription>Key metrics and statistics</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold">Today's Orders</h3>
              <p className="text-2xl">{stats.dailyOrders}</p>
              <p className="text-sm text-muted-foreground">
                {stats.monthlyOrders} this month
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Revenue</h3>
              <p className="text-2xl">${stats.monthlyRevenue}</p>
              <p className="text-sm text-muted-foreground">Monthly revenue</p>
            </div>
            <div>
              <h3 className="font-semibold">Active Stores</h3>
              <p className="text-2xl">{stats.activeStores}</p>
              <p className="text-sm text-muted-foreground">
                {stats.activeStores} stores online
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders}
            icon={<FileText size={24} />}
            trend={{ value: 12, isPositive: true }}
          />
          
          <StatCard 
            title="Pending Orders" 
            value={stats.pendingOrders}
            icon={<Clock size={24} />}
            trend={{ value: 5, isPositive: false }}
          />
          
          <StatCard 
            title="Total Revenue" 
            value={`₹${stats.totalRevenue}`}
            icon={<CreditCard size={24} />}
            trend={{ value: 18, isPositive: true }}
          />
          
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers}
            icon={<Users size={24} />}
            trend={{ value: 7, isPositive: true }}
          />
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <TrendingUp className="h-5 w-5 mr-2" />
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#9b87f5"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <FileText className="h-5 w-5 mr-2" />
                Orders by Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ordersData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-xl">
              <Clock className="h-5 w-5 mr-2" />
              Recent Orders
            </CardTitle>
            <Link to="/admin/orders">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.userName}</TableCell>
                        <TableCell className="truncate max-w-[200px]">{order.documentName}</TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">₹{order.totalPrice}</TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/admin/orders?id=${order.id}`}>
                            <Button variant="ghost" size="sm" className="text-primary h-8">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No orders found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {/* Activity Calendar Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Calendar className="h-5 w-5 mr-2" />
              Activity Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 italic text-center py-6">
              Activity calendar will be implemented in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
