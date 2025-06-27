import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";
import DeveloperLayout from "@/components/layouts/DeveloperLayout";
import axios from "../../config/axios";
import type { Order } from "@/types/order";
import { fetchLoginAlerts } from "@/api";
import type { LoginAlert } from "@/types/loginAlert";

const DeveloperDashboard = () => {
  const [stats, setStats] = useState({
    dailyOrders: 0,
    dailyRevenue: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0,
    activeStores: 0,
    activeAdmins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState<LoginAlert[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch login alerts
        try {
          const alertsData = await fetchLoginAlerts();
          setLoginAlerts(alertsData);
        } catch (error) {
          console.error('Error fetching login alerts:', error);
          // Non-critical, continue with other data
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);        // Get all orders
        const ordersRes = await axios.get("/orders");

        // Extract the orders array from the response
        // Check for common response patterns
        const orders =
          ordersRes.data.orders || // If orders are in a property called "orders"
          (Array.isArray(ordersRes.data) ? ordersRes.data : []); // Or if directly in data

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Filter for today's and this month's orders
        const todaysOrders: Order[] = [];
        const monthlyOrders: Order[] = [];

        // Make sure we're iterating over an array
        if (Array.isArray(orders)) {
          orders.forEach((order: any) => {
            if (!order.createdAt) return;
            const orderDate = new Date(order.createdAt);

            if (orderDate >= today) {
              todaysOrders.push(order);
            }

            if (orderDate >= firstDayOfMonth) {
              monthlyOrders.push(order);
            }
          });        } else {
          // If orders data is not an array, we'll just use an empty array
        }

        // Calculate today's and monthly revenue
        const todayRevenue = todaysOrders.reduce((sum: number, order: any) => {
          return sum + (order.totalPrice || 0);
        }, 0);

        const monthRevenue = monthlyOrders.reduce((sum: number, order: any) => {
          return sum + (order.totalPrice || 0);
        }, 0);

        // Get active stores and admins
        const platformRes = await axios.get("/platform-stats");

        setStats({
          dailyOrders: todaysOrders.length,
          dailyRevenue: todayRevenue,
          monthlyOrders: monthlyOrders.length,
          monthlyRevenue: monthRevenue,
          activeStores: platformRes.data.activeStores || 0,
          activeAdmins: platformRes.data.activeAdmins || 0,
        });      } catch (error) {
        // Handle error by setting default values
        // Set default values on error
        setStats({
          dailyOrders: 0,
          dailyRevenue: 0,
          monthlyOrders: 0,
          monthlyRevenue: 0,
          activeStores: 0,
          activeAdmins: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

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
              <h3 className="font-semibold">Today's Orders</h3>
              <p className="text-2xl">{stats.dailyOrders}</p>
              <p className="text-sm text-muted-foreground">
                {stats.dailyOrders === 0
                  ? "No orders"
                  : stats.dailyOrders === 1
                  ? "1 order"
                  : `${stats.dailyOrders} orders`}{" "}
                today
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Today's Revenue</h3>
              <p className="text-2xl">
                ${stats.dailyRevenue?.toFixed(2) || "0.00"}
              </p>
              <p className="text-sm text-muted-foreground">
                {stats.dailyRevenue ? "Generated today" : "No revenue today"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Active Store</h3>
              <p className="text-2xl">
                {stats.activeStores}{" "}
                {stats.activeStores === 1 ? "store" : "stores"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Statistics</CardTitle>
            <CardDescription>
              Overview of this month's performance
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Total Orders</h3>
              <p className="text-2xl">{stats.monthlyOrders}</p>
              <p className="text-sm text-muted-foreground">
                {stats.monthlyOrders === 0
                  ? "No orders this month"
                  : stats.monthlyOrders === 1
                  ? "1 order this month"
                  : `${stats.monthlyOrders} orders this month`}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Monthly Revenue</h3>
              <p className="text-2xl">
                ${stats.monthlyRevenue?.toFixed(2) || "0.00"}
              </p>
              <p className="text-sm text-muted-foreground">
                {stats.monthlyRevenue
                  ? "Generated this month"
                  : "No revenue this month"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Login Security Alerts Card */}
        {loginAlerts.length > 0 && (
          <Card className="border-amber-200 shadow-amber-100 hover:shadow-md transition-shadow">
            <CardHeader className="bg-amber-50 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                  <div>
                    <CardTitle>Security Alert</CardTitle>
                    <CardDescription className="text-amber-700">
                      {loginAlerts.length === 1 
                        ? '1 suspicious admin login attempt detected' 
                        : `${loginAlerts.length} suspicious admin login attempts detected`}
                    </CardDescription>
                  </div>
                </div>
                <Button asChild variant="outline" className="border-amber-400 bg-amber-50 hover:bg-amber-100">
                  <Link to="/developer/login-alerts">
                    View Alerts <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {loginAlerts.slice(0, 3).map(alert => (
                  <li key={alert._id} className="flex items-center text-sm">
                    <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mr-3 font-medium">
                      {alert.attemptCount}
                    </span>
                    <div>
                      <span className="font-medium">{alert.email}</span>
                      <span className="text-gray-500 ml-2">
                        from {alert.ipAddress} at {new Date(alert.lastAttempt).toLocaleTimeString()}
                      </span>
                    </div>
                  </li>
                ))}
                {loginAlerts.length > 3 && (
                  <li className="text-sm text-gray-500 pl-11">
                    and {loginAlerts.length - 3} more...
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </DeveloperLayout>
  );
};

export default DeveloperDashboard;
