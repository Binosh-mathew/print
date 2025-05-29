import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity } from 'lucide-react';
import DeveloperLayout from '@/components/layouts/DeveloperLayout';
import axios from 'axios';

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

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get all orders (since backend doesn't support date filtering)
        const ordersRes = await axios.get('http://localhost:5000/api/orders');
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Filter for today's and this month's orders
        const todaysOrders = [];
        const monthlyOrders = [];
        
        ordersRes.data.forEach((order: any) => {
          if (!order.createdAt) return;
          const orderDate = new Date(order.createdAt);
          
          if (orderDate >= today) {
            todaysOrders.push(order);
          }
          
          if (orderDate >= firstDayOfMonth) {
            monthlyOrders.push(order);
          }
        });
        
        // Calculate today's and monthly revenue
        const todayRevenue = todaysOrders.reduce((sum: number, order: any) => {
          return sum + (order.totalPrice || 0);
        }, 0);
        
        const monthRevenue = monthlyOrders.reduce((sum: number, order: any) => {
          return sum + (order.totalPrice || 0);
        }, 0);
        
        // Get active stores and admins
        const platformRes = await axios.get('http://localhost:5000/api/platform-stats');
        
        setStats({
          dailyOrders: todaysOrders.length,
          dailyRevenue: todayRevenue,
          monthlyOrders: monthlyOrders.length,
          monthlyRevenue: monthRevenue,
          activeStores: platformRes.data.activeStores || 0,
          activeAdmins: platformRes.data.activeAdmins || 0,
        });
      } catch (error) {
        console.error('Error fetching platform stats:', error);
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
                {stats.dailyOrders === 0 ? 'No orders' : stats.dailyOrders === 1 ? '1 order' : `${stats.dailyOrders} orders`} today
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Today's Revenue</h3>
              <p className="text-2xl">${stats.dailyRevenue?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-muted-foreground">
                {stats.dailyRevenue ? 'Generated today' : 'No revenue today'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Active Store</h3>
              <p className="text-2xl">
                {stats.activeStores} {stats.activeStores === 1 ? 'store' : 'stores'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Statistics</CardTitle>
            <CardDescription>Overview of this month's performance</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Total Orders</h3>
              <p className="text-2xl">{stats.monthlyOrders}</p>
              <p className="text-sm text-muted-foreground">
                {stats.monthlyOrders === 0 
                  ? 'No orders this month' 
                  : stats.monthlyOrders === 1 
                    ? '1 order this month' 
                    : `${stats.monthlyOrders} orders this month`}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Monthly Revenue</h3>
              <p className="text-2xl">${stats.monthlyRevenue?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-muted-foreground">
                {stats.monthlyRevenue ? 'Generated this month' : 'No revenue this month'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Login Activity Card with Link */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Login Activity
                </CardTitle>
                <CardDescription>View recent login attempts and user sessions</CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link to="/developer/login-activity">
                  View All Activity <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    </DeveloperLayout>
  );
};

export default DeveloperDashboard; 