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

    socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000/api", {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("socket connected:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected: ", socket?.id);
    });

    socket.on("order:new", (order: Order) => {
      console.log("New order received:", order);
      addOrder(order);
    });

    socket.on("order:statusUpdated", (order: Order) => {
      console.log("Order status updated:", order);
      updateOrderInStore(order);
    });
    initialized.current = true;
  }, []);
};
