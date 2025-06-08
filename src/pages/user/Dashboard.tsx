import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserLayout from "@/components/layouts/UserLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus, File, Clock, CheckCircle } from "lucide-react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import type { Order } from "@/types/order";
import { hasStatus } from "@/utils/orderUtils";
import axios from "../../config/axios";

const UserDashboard = () => {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/orders");
        setOrders(response.data);
      } catch (error: any) {
        if (error.response) {
          console.error("Error fetching orders:", error.response.data);
        }
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    // Simulate API call
    if (user) {
      // Get user orders
      const userOrders: Order[] = orders.filter(
        (order) => order?.userId === user.id
      );

      // Set recent orders (last 5)
      setRecentOrders(
        userOrders
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5)
      );

      // Calculate stats using case-insensitive status check
      setStats({
        totalOrders: userOrders.length,
        pendingOrders: userOrders.filter(
          (order) =>
            hasStatus(order, "Pending") || hasStatus(order, "Processing")
        ).length,
        completedOrders: userOrders.filter((order) =>
          hasStatus(order, "Completed")
        ).length,
      });
    }
  }, [user, orders]);

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Welcome section */}
        <section>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600">
            Here's an overview of your printing activities
          </p>
        </section>

        {/* Stats cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Orders
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {stats.totalOrders}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary">
                  <File size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Pending Orders
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {stats.pendingOrders}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                  <Clock size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Completed Orders
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {stats.completedOrders}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                  <CheckCircle size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick actions */}
        <section>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/new-order">
              <Button className="bg-primary hover:bg-primary-500 flex items-center space-x-2 w-full sm:w-auto">
                <FilePlus size={18} />
                <span>New Print Order</span>
              </Button>
            </Link>
            <Link to="/orders">
              <Button
                variant="outline"
                className="flex items-center space-x-2 w-full sm:w-auto"
              >
                <File size={18} />
                <span>View All Orders</span>
              </Button>
            </Link>
          </div>
        </section>

        {/* Recent orders */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Document
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Copies
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Price
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Status
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order, index) => {
                        const orderId =
                          order._id || order.id || `order-${index}`;
                        const documentName =
                          order.documentName || "Untitled Document";
                        const copies = order.copies || 1;
                        const colorType =
                          order.colorType === "color" ? "Color" : "B&W";
                        const doubleSided = order.doubleSided
                          ? ", Double-sided"
                          : "";
                        const totalPrice = order.totalPrice || 0;
                        const status = order.status || "pending";
                        const createdAt = order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A";

                        return (
                          <tr
                            key={orderId}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <File
                                  size={16}
                                  className="text-gray-400 mr-2"
                                />
                                <span
                                  className="text-sm font-medium text-gray-700 truncate max-w-[200px]"
                                  title={documentName}
                                >
                                  {documentName}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {createdAt}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {copies}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {colorType}
                              {doubleSided}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium">
                              ₹{totalPrice}
                            </td>
                            <td className="py-3 px-4">
                              <OrderStatusBadge status={status} />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Link to={`/orders/${orderId}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary h-8"
                                  aria-label={`View order ${orderId}`}
                                >
                                  View
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    You don't have any orders yet.
                  </p>
                  <Link to="/new-order">
                    <Button className="mt-4 bg-primary hover:bg-primary-500">
                      Create your first order
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </UserLayout>
  );
};

export default UserDashboard;
