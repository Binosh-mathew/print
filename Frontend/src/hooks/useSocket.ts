import { useOrderStore } from "@/store/orderStore";
import { io, Socket } from "socket.io-client";
import { useRef, useEffect, useCallback } from "react";
import { Order } from "@/types/order";

let socket: Socket | null = null;

export const useSocket = () => {
  const initialized = useRef(false);
  const { addOrder, updateOrderInStore, removeOrder, fetchAllOrders } = useOrderStore();

  useEffect(() => {
    if (initialized.current || socket) return;

    socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
      initialized.current = true;
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // Listen for new orders
    socket.on("order:new", (order: Order) => {
      console.log("New order received:", order);
      addOrder(order);
    });

    // Listen for order updates
    socket.on("order:updated", (updatedOrder: Order) => {
      console.log("Order updated:", updatedOrder);
      updateOrderInStore(updatedOrder);
    });

    // Listen for order deletions
    socket.on("order:deleted", (orderId: string) => {
      console.log("Order deleted:", orderId);
      removeOrder(orderId);
    });

    // Listen for general order updates (refresh pending counts)
    socket.on("orders:updated", () => {
      console.log("Orders updated - refreshing data");
      // Refresh the orders list
      fetchAllOrders();
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
        initialized.current = false;
      }
    };
  }, [addOrder, updateOrderInStore, removeOrder, fetchAllOrders]);

  const joinStore = useCallback((storeId: string) => {
    if (socket?.connected) {
      console.log(`Joining store room: store:${storeId}`);
      socket.emit("join-store", storeId);
    }
  }, []);

  const leaveStore = useCallback((storeId: string) => {
    if (socket?.connected) {
      console.log(`Leaving store room: store:${storeId}`);
      socket.emit("leave-store", storeId);
    }
  }, []);

  return {
    socket,
    isConnected: socket?.connected || false,
    joinStore,
    leaveStore
  };
};
