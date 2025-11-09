import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FileText, Clock, CreditCard, TrendingUp } from "lucide-react";
import StatCard from "@/components/StatCard";
import OrderStatusBadge from "@/components/OrderStatusBadge";
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
  Legend,
} from "recharts";
import { fetchDashboardData } from "@/api/orderApi";

const AdminDashboard = () => {
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState({
    revenueData: [] as Array<{ name: string; revenue: number }>,
    ordersData: [] as Array<{
      name: string;
      completed: number;
      pending: number;
      total: number;
    }>,
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    dailyOrders: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    fetchDashboardData(setRecentOrders, setStats, setChartData);
    const intervalId = setInterval(
      () => fetchDashboardData(setRecentOrders, setStats, setChartData),
      30000
    );
    return () => clearInterval(intervalId);
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Overview of print shop operations and metrics
          </p>
        </div>

        {/* Statistics Overview */}
        <Card key="dashboard-overview">
          <CardHeader>
            <CardTitle>Dashboard Overview</CardTitle>
            <CardDescription>Key metrics and statistics</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            key="total-orders"
            title="Total Orders"
            value={stats.totalOrders}
            icon={<FileText size={24} />}
            trend={{ value: 12, isPositive: true }}
          />

          <StatCard
            key="pending-orders"
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={<Clock size={24} />}
            trend={{ value: 5, isPositive: false }}
          />

          <StatCard
            key="total-revenue"
            title="Total Revenue"
            value={`₹${stats.totalRevenue}`}
            icon={<CreditCard size={24} />}
            trend={{ value: 18, isPositive: true }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card key="revenue-chart">
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
                    data={chartData.revenueData}
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
                    <Tooltip
                      formatter={(value: number) => [
                        `₹${value.toFixed(2)}`,
                        "Revenue",
                      ]}
                      labelFormatter={(label) =>
                        `${label} ${new Date().getFullYear()}`
                      }
                    />
                    <Legend />
                    <Line
                      key="revenue-line"
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue (₹)"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Orders Chart */}
          <Card key="orders-chart">
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
                    data={chartData.ordersData}
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
                    <Tooltip
                      formatter={(value: number, name: string) => [value, name]}
                      labelFormatter={(label) =>
                        `${label} ${new Date().getFullYear()}`
                      }
                    />
                    <Legend />
                    <Bar
                      key="completed-bar"
                      dataKey="completed"
                      name="Completed"
                      fill="#82ca9d"
                      stackId="a"
                    />
                    <Bar
                      key="pending-bar"
                      dataKey="pending"
                      name="Pending"
                      fill="#ffc658"
                      stackId="a"
                    />
                    <Bar
                      key="other-bar"
                      dataKey={(data) =>
                        data.total - data.completed - data.pending
                      }
                      name="Other Status"
                      fill="#8884d8"
                      stackId="a"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ... */}

        {/* Recent Orders */}
        <Card key="recent-orders">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-xl">
              <Clock className="h-5 w-5 mr-2" />
              Recent Orders
            </CardTitle>
            <Link to="/admin/orders">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Order ID
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Customer
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Document
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order, index) => {
                      // Ensure we have a unique key for each row
                      const rowKey = order?.id || `order-${index}`;
                      // Provide default values to prevent undefined errors
                      const orderWithDefaults = {
                        id: order?.id || `order-${index}`,
                        customerName:
                          order?.customerName ||
                          order?.userName ||
                          "Unknown User",
                        documentName:
                          order?.documentName || "Untitled Document",
                        createdAt: order?.createdAt || new Date().toISOString(),
                        totalPrice: order?.totalPrice || 0,
                        status: order?.status || "pending",
                      };

                      return (
                        <tr
                          key={rowKey}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle font-medium">
                            #{orderWithDefaults.id}
                          </td>
                          <td className="p-4 align-middle">
                            {orderWithDefaults.customerName}
                          </td>
                          <td className="p-4 align-middle truncate max-w-[200px]">
                            {orderWithDefaults.documentName}
                          </td>
                          <td className="p-4 align-middle text-gray-600">
                            {new Date(
                              orderWithDefaults.createdAt
                            ).toLocaleDateString()}
                          </td>
                          <td className="p-4 align-middle font-medium">
                            ₹{orderWithDefaults.totalPrice}
                          </td>
                          <td className="p-4 align-middle">
                            <OrderStatusBadge
                              status={orderWithDefaults.status}
                            />
                          </td>
                          <td className="p-4 align-middle text-right">
                            <Link
                              to={`/admin/orders?id=${orderWithDefaults.id}`}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary h-8"
                              >
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr
                      key="no-orders-row"
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td
                        colSpan={7}
                        className="p-4 align-middle h-24 text-center"
                      >
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No orders found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Activity Calendar section removed */}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
