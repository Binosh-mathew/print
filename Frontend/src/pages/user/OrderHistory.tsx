import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserLayout from "@/components/layouts/UserLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { fetchOrders } from "@/api";
import { type Order } from "@/types/order";
import { toast } from "@/components/ui/use-toast";
import useAuthStore from "@/store/authStore";
import { useSocket } from "@/hooks/useSocket";

const OrderHistory = () => {
  const { user } = useAuthStore();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const socket = useSocket();

  // Load orders from API
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await fetchOrders();

      if (user) {
        // The backend already filters orders for the current user based on the auth token
        // Just ensure we have an array to work with
        const userOrdersList: Order[] = Array.isArray(data) ? data : [];

        // Sort orders by creation date (newest first)
        const sortedOrders = userOrdersList.sort(
          (a, b) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
        );

        setUserOrders(sortedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Couldn't load orders",
        description:
          "There was a problem connecting to the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and real-time updates
  useEffect(() => {
    loadOrders();
    
    // Set up real-time updates when user changes or component mounts
    if (user?.id) {
      console.log(`Setting up real-time updates for user: ${user.id}`);
      
      // Register event handlers for order updates
      socket.registerEventHandlers({
        onNewOrder: (newOrder) => {
          console.log("New order received:", newOrder);
          setUserOrders(prevOrders => [newOrder, ...prevOrders].sort(
            (a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
          ));
          
          toast({
            title: "New Order",
            description: `Your order for ${newOrder.documentName || 'document'} has been created.`,
          });
        },
        onOrderUpdated: (updatedOrder) => {
          console.log("Order updated:", updatedOrder);
          setUserOrders(prevOrders => prevOrders.map(
            order => (order._id === updatedOrder._id || order.id === updatedOrder.id) 
              ? updatedOrder 
              : order
          ));
          
          toast({
            title: "Order Updated",
            description: `Your order status has changed to ${updatedOrder.status}.`,
          });
        },
        onOrderDeleted: (orderId) => {
          console.log("Order deleted:", orderId);
          setUserOrders(prevOrders => prevOrders.filter(
            order => order._id !== orderId && order.id !== orderId
          ));
          
          toast({
            title: "Order Removed",
            description: "An order has been removed from your history.",
            variant: "destructive"
          });
        },
        onOrdersUpdated: () => {
          console.log("Orders updated globally, refreshing");
          loadOrders();
        }
      });
    }
    
    return () => {
      // Clean up event handlers when component unmounts
      socket.registerEventHandlers({});
    };
  }, [user?.id, socket]);

  // Connection status indicator
  useEffect(() => {
    if (!socket.isConnected && socket.lastError) {
      console.warn("Socket connection issue:", socket.lastError);
      toast({
        title: "Connection Issue",
        description: "Live updates may be unavailable. Orders will still be processed.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [socket.isConnected, socket.lastError]);

  // Function to get special paper info from files
  const getPaperAndBindingInfo = (order: Order) => {
    if (!order.files || order.files.length === 0)
      return { paper: "Normal A4", binding: "None" };

    const specialPapers = order.files
      .filter((file) => file.specialPaper !== "none")
      .map((file) => file.specialPaper);

    const bindingTypes = order.files
      .filter((file) => file.binding.needed && file.binding.type !== "none")
      .map((file) => file.binding.type);

    return {
      paper: specialPapers.length > 0 ? specialPapers.join(", ") : "Normal A4",
      binding:
        bindingTypes.length > 0
          ? bindingTypes.map((type) => type.replace("Binding", "")).join(", ")
          : "None",
    };
  };
  
  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Order History</h1>
            <p className="text-gray-600 mt-1">
              View and track your print orders
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Socket connection indicator */}
            <div className="flex items-center mr-2 text-xs text-gray-600 gap-1">
              <div className={`w-2 h-2 rounded-full ${socket.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span>{socket.isConnected ? 'Live updates on' : 'Offline'}</span>
            </div>
            <Link to="/new-order">
              <Button className="bg-primary hover:bg-primary-500">
                New Order
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading your orders...</p>
              </div>
            ) : userOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Order ID
                      </th>
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
                        Paper
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
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userOrders.map((order) => {
                      const { paper } = getPaperAndBindingInfo(order);
                      return (
                        <tr
                          key={order._id || order.id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm text-gray-600">
                            #{order.orderId}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <FileText
                                size={16}
                                className="text-gray-400 mr-2"
                              />
                              <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                                {order.documentName || order.customerName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(
                              order.orderDate || order.createdAt || ""
                            ).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {order.copies || 1}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {paper}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {order.colorType === "color" ? "Color" : "B&W"}
                            {order.doubleSided ? ", Double-sided" : ""}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">
                            ₹{order.totalPrice || 0}
                          </td>
                          <td className="py-3 px-4">
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link to={`/orders/${order._id || order.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary h-8"
                                >
                                  View
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No orders found</p>
                <Link to="/new-order">
                  <Button className="mt-4 bg-primary hover:bg-primary-500">
                    Create your first order
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default OrderHistory;
