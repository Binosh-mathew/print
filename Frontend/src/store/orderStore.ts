import { create } from "zustand";
import { Order, orderState } from "@/types/order";
import {
  createOrder,
  fetchOrderById,
  fetchOrders,
  deleteOrder,
  updateOrder,
} from "@/api/orderApi";

export const useOrderStore = create<orderState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async (storeId: string) => {
    set({ loading: true, error: null });
    try {
      const order: Order = await fetchOrderById(storeId);
      set({ loading: false, orders: [order], error: null });
      return order;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch orders",
      });
    }
  },
  fetchAllOrders: async () => {
    set({ loading: true, error: null });
    try {
      const orders: Order[] = await fetchOrders();
      set({ loading: false, orders, error: null });
      return orders;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch all orders",
      });
    }
  },
  createOrder: async (orderData: Partial<Order>) => {
    set({ loading: true, error: null });
    try {
      const order = await createOrder(orderData);
      set({ loading: false, error: null });
      return order;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to create order",
      });
    }
  },
  updateOrder: async (id: string, orderData: Partial<Order>) => {
    set({ loading: true, error: null });
    try {
      const updatedOrder = await updateOrder(id, orderData);
      set({ loading: false, error: null });
      return updatedOrder;
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to update order",
      });
      return undefined;
    }
  },
  deleteOrder: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await deleteOrder(id);
     set({ loading: false, error: null });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to delete order",
      });
    }
  },
addOrder: (order: Order) =>
    set((state) => ({ 
      orders: [order, ...state.orders] 
    })),

  updateOrderInStore: (updated: Order) =>
    set((state) => ({
      orders: state.orders.map((o) => 
        o._id === updated._id ? updated : o
      ),
    })),
    removeOrder: (orderId: string) =>
    set((state) => ({
      orders: state.orders.filter((o) => o._id !== orderId)
    })),
}));
