import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { fetchOrders, updateOrder } from "@/api";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import type { Order } from "@/types/order";

export const useOrderManagement = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("id");
  const { user } = useAuth();
  const socket = useSocket();

  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "descending",
  });
  const [statusChangeCompleted, setStatusChangeCompleted] = useState(false);
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);

  const refreshOrders = useCallback(async () => {
    try {
      setIsUpdating(true);
      if (orders.length === 0) {
        setIsLoading(true);
      }
      const response = await fetchOrders();
      // Process the orders to ensure customer names are properly set
      const processedOrders = response.map((order: any) => {
        // Ensure customerName is set, falling back to userName if needed
        if (!order.customerName && order.userName) {
          order.customerName = order.userName;
        }
        // If neither customerName nor userName is available, set a default
        if (!order.customerName && !order.userName) {
          order.customerName = "Unknown User";
        }
        return order;
      });

      setOrders(processedOrders);
      setIsUpdating(false);
      setIsLoading(false);

      if (orderId) {
        const sortedOrders = [...processedOrders].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const order = sortedOrders.find(
          (o) => o.id === orderId || o._id === orderId
        );
        if (order) {
          setSelectedOrder(order);
          setIsDetailsOpen(true);
          setSelectedFileIdx(0);
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error loading orders",
        description: "There was a problem fetching the orders.",
        variant: "destructive",
      });
      setIsUpdating(false);
      setIsLoading(false);
    }
  }, [orders.length, orderId]);

  // Helper function to check if an order is from today
  const isOrderFromToday = useCallback((order: any) => {
    if (!order.createdAt) return false;
    const orderDate = new Date(order.createdAt);
    const today = new Date();

    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  }, []);

  // Socket.IO integration for real-time updates
  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;

    // Try to connect after a short delay to ensure auth is ready
    const timer = setTimeout(() => {
      if (user?.id) {
        if (socket.isConnected) {
          socket.joinStore(user.id);
          toast({
            title: "Live Updates Active",
            description: "You will receive real-time order updates",
            duration: 3000,
          });
        } else {
          socket.reconnect();
          // Try again after reconnection attempt
          reconnectTimer = setTimeout(() => {
            if (socket.isConnected) {
              socket.joinStore(user.id);
              toast({
                title: "Live Updates Active",
                description: "Reconnected successfully",
                duration: 3000,
              });
            } else {
              toast({
                title: "Connection Issue",
                description:
                  socket.lastError || "Could not connect to real-time updates",
                variant: "destructive",
                duration: 5000,
              });
            }
          }, 2000);
        }
      }
    }, 1000);

    // Cleanup: leave the room when component unmounts or user changes
    return () => {
      clearTimeout(timer);
      clearTimeout(reconnectTimer);
      if (user?.id && socket.isConnected) {
        socket.leaveStore(user.id);
      }
    };
  }, [user?.id, socket]);

  // Listen for real-time order updates via Socket.IO
  useEffect(() => {
    const handleNewOrder = (newOrder: Order) => {
      // Process the order to ensure customer name is set
      const processedOrder = {
        ...newOrder,
        customerName:
          newOrder.customerName || newOrder.userName || "Unknown User",
      };

      setOrders((prevOrders) => [processedOrder, ...prevOrders]);

      toast({
        title: "New Order",
        description: `New order #${newOrder.id} received from ${processedOrder.customerName}`,
      });
    };

    const handleOrderUpdate = (updatedOrder: Order) => {
      // Process the order to ensure customer name is set
      const processedOrder = {
        ...updatedOrder,
        customerName:
          updatedOrder.customerName || updatedOrder.userName || "Unknown User",
      };

      // Update orders list
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id || order.id === updatedOrder.id
            ? processedOrder
            : order
        )
      );

      // Update selected order if it's the one being viewed
      if (
        selectedOrder &&
        (selectedOrder._id === updatedOrder._id ||
          selectedOrder.id === updatedOrder.id)
      ) {
        // Create a new object to ensure React detects the change
        const updatedSelectedOrder = {
          ...selectedOrder,
          ...processedOrder,
        };
        setSelectedOrder(updatedSelectedOrder);

        // Add a small delay and force update again to ensure UI reflects changes
        setTimeout(() => {
          setSelectedOrder((current: Order | null) =>
            current ? { ...current } : null
          );
        }, 50);
      }

      toast({
        title: "Order Updated",
        description: `Order #${updatedOrder.id} status changed to ${updatedOrder.status}`,
      });
    };

    const handleOrderDelete = (orderId: string) => {
      setOrders((prevOrders) =>
        prevOrders.filter(
          (order) => order._id !== orderId && order.id !== orderId
        )
      );

      // Close dialog if viewing deleted order
      if (
        selectedOrder &&
        (selectedOrder._id === orderId || selectedOrder.id === orderId)
      ) {
        setIsDetailsOpen(false);
        setSelectedOrder(null);
      }

      toast({
        title: "Order Deleted",
        description: `Order #${orderId} has been deleted`,
        variant: "destructive",
      });
    };

    const handleOrdersUpdate = () => {
      refreshOrders();
    };

    // Register event handlers
    socket.registerEventHandlers({
      onNewOrder: handleNewOrder,
      onOrderUpdated: handleOrderUpdate,
      onOrderDeleted: handleOrderDelete,
      onOrdersUpdated: handleOrdersUpdate,
    });
  }, [selectedOrder, socket, refreshOrders]);

  const handleStatusChange = useCallback(async (orderId: string, newStatus: string) => {
    if (isUpdating || !orderId) {
      console.error("Invalid order ID or update in progress");
      return;
    }

    setIsUpdating(true);

    try {
      // Validate the status is one of the allowed values
      const validStatuses = [
        "pending", // Use lowercase for backend consistency
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "completed",
      ];

      // Convert to lowercase for backend consistency
      const normalizedStatus = newStatus.toLowerCase();

      if (!validStatuses.includes(normalizedStatus)) {
        throw new Error(`Invalid status: ${normalizedStatus}`);
      }

      // Convert lowercase status to proper case for frontend compatibility
      const displayStatus = (normalizedStatus.charAt(0).toUpperCase() +
        normalizedStatus.slice(1)) as
        | "Pending"
        | "Processing"
        | "Shipped"
        | "Delivered"
        | "Cancelled"
        | "Completed";

      const updateData = { status: displayStatus };

      await updateOrder(orderId, updateData);

      // Immediately update the selected order locally
      if (
        selectedOrder &&
        (selectedOrder._id === orderId || selectedOrder.id === orderId)
      ) {
        // Create a new object to ensure React detects the change
        const updatedSelectedOrder = {
          ...selectedOrder,
          status: displayStatus,
        };
        setSelectedOrder(updatedSelectedOrder);
      }

      // NOTE: Socket event handlers will also receive the updated order and update the UI

      // Show immediate feedback to the user
      toast({
        title: "Processing update",
        description: `Changing order #${orderId} status to ${normalizedStatus}...`,
      });

      // Briefly set statusChangeCompleted to true to trigger any UI feedback
      setStatusChangeCompleted(true);

      // Reset after a short delay, but keep the dialog open
      setTimeout(() => {
        setStatusChangeCompleted(false);
      }, 1000);
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast({
        title: "Update failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "There was a problem updating the order status.",
        variant: "destructive",
      });

      // Refresh orders in case of error to ensure UI is in sync
      refreshOrders();
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, selectedOrder, refreshOrders]);

  const handleOrderClick = useCallback((order: Order) => {
    setStatusChangeCompleted(false);
    setSelectedOrder(order);
    setIsDetailsOpen(true);
    setSelectedFileIdx(0);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open && !isUpdating) {
      setIsDetailsOpen(false);

      // Reset status change completed flag if dialog is closed
      if (statusChangeCompleted) {
        setStatusChangeCompleted(false);
      }
    }
  }, [isUpdating, statusChangeCompleted]);

  return {
    // State
    orders,
    filteredOrders,
    selectedOrder,
    isDetailsOpen,
    isUpdating,
    isLoading,
    searchQuery,
    statusFilter,
    showAllOrders,
    sortConfig,
    statusChangeCompleted,
    selectedFileIdx,
    
    // Setters
    setOrders,
    setFilteredOrders,
    setSelectedOrder,
    setIsDetailsOpen,
    setIsUpdating,
    setIsLoading,
    setSearchQuery,
    setStatusFilter,
    setShowAllOrders,
    setSortConfig,
    setStatusChangeCompleted,
    setSelectedFileIdx,
    
    // Functions
    refreshOrders,
    isOrderFromToday,
    handleStatusChange,
    handleOrderClick,
    handleDialogOpenChange,
  };
};
