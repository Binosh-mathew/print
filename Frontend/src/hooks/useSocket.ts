import { useOrderStore } from "@/store/orderStore";
import { io, Socket } from "socket.io-client";
import { useRef, useEffect } from "react";
import { Order } from "@/types/order";

let socket: Socket | null = null;

export const useSocket = () => {
  const initialized = useRef(false);
  const { addOrder, updateOrderInStore } = useOrderStore();

  useEffect(() => {
    if (initialized.current || socket) return;

    socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
      initialized.current = true;
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket?.id);
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
      // You'll need to add a removeOrder method to your store
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
        initialized.current = false;
      }
    };
  }, [addOrder, updateOrderInStore]);

  // Return utility functions for components to use
  return {
    socket,
    isConnected: socket?.connected || false,
    joinStore: (storeId: string) => {
      if (socket?.connected) {
        socket.emit("join-store", storeId);
      }
    },
    leaveStore: (storeId: string) => {
      if (socket?.connected) {
        socket.emit("leave-store", storeId);
      }
    },
  };
};
