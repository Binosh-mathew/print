import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { fetchOrders, updateOrder } from "@/api";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/contexts/AuthContext";
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
  }, [orderId, orders.length]);

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

  useEffect(() => {
    // Initial fetch when component mounts
    refreshOrders();
  }, [orderId]);

  useEffect(() => {
    let result = [...orders];

    // Filter by today's orders if showAllOrders is false
    if (!showAllOrders) {
      result = result.filter(isOrderFromToday);
    }

    if (statusFilter !== "all") {
      const filterValue = statusFilter.toLowerCase();
      result = result.filter((order) => {
        // Handle case where order.status might be undefined
        if (!order.status) return false;

        // Normalize the status for comparison
        const orderStatus = order.status.toLowerCase().replace(/\s+/g, "");
        const normalizedFilterValue = filterValue.replace(/\s+/g, "");

        return orderStatus === normalizedFilterValue;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((order) => {
        // Search in multiple fields
        const searchFields = [
          order.id?.toString() || "",
          order._id?.toString() || "",
          order.customerName || "",
          order.userName || "",
          order.phoneNumber || "",
          order.orderDetails || "",
          order.status || "",
          ...(order.files || []).map((file: any) => file.originalName || ""),
        ];

        return searchFields.some((field) =>
          field.toLowerCase().includes(query)
        );
      });
    }

    // Sort orders
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle date fields
        if (sortConfig.key === "createdAt" || sortConfig.key === "updatedAt") {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        // Handle numeric fields
        if (sortConfig.key === "totalPrice") {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        }

        // Handle string fields
        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
        }
        if (typeof bValue === "string") {
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredOrders(result);
  }, [orders, searchQuery, statusFilter, showAllOrders, sortConfig, isOrderFromToday]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      setStatusChangeCompleted(false);

      await updateOrder(orderId, { status: newStatus as any });

      // Update local state immediately for better UX
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId || order.id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

      // Update selected order if it's the one being viewed
      if (
        selectedOrder &&
        (selectedOrder._id === orderId || selectedOrder.id === orderId)
      ) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }

      setStatusChangeCompleted(true);
      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error updating status",
        description: "There was a problem updating the order status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "descending"
          ? "ascending"
          : "descending",
    }));
  };

  const handleOrderSelect = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
    setSelectedFileIdx(0);
  };

  const handleDialogClose = () => {
    setIsDetailsOpen(false);
    setSelectedOrder(null);
    setSelectedFileIdx(0);
  };

  const handlePrintOrder = () => {
    if (!selectedOrder) return;

    // Create a dedicated print stylesheet for this specific order
    const style = document.createElement("style");
    style.type = "text/css";
    style.id = "temp-print-style";
    style.media = "print";
    style.innerHTML = `
      @page { size: auto; margin: 15mm; }
      body * { visibility: hidden; }
      .dialog-content-print, .dialog-content-print * { visibility: visible; }
      .dialog-content-print { position: absolute; left: 0; top: 0; width: 100%; }
      .no-print { display: none !important; }
      .print-only { display: block !important; }
    `;
    document.head.appendChild(style);

    // Trigger print dialog
    window.print();

    // Remove the temporary style after printing
    setTimeout(() => {
      const tempStyle = document.getElementById("temp-print-style");
      if (tempStyle) tempStyle.remove();
    }, 2000);

    toast({
      title: "Print dialog opened",
      description: `Printing order #${selectedOrder.id} details.`,
    });
  };

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

    // Actions
    setSearchQuery,
    setStatusFilter,
    setShowAllOrders,
    setSelectedFileIdx,
    handleStatusChange,
    handleSort,
    handleOrderSelect,
    handleDialogClose,
    handlePrintOrder,
    refreshOrders,

    // Utilities
    isOrderFromToday,
  };
};
