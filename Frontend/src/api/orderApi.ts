// Order APIs
import axios from "@/config/axios";
import { Order } from "@/types/order";
import { getCurrentYearData } from "@/utils/ordersStats";

export const fetchOrders = async (storeId?: string): Promise<Order[]> => {
  try {
    const url = storeId ? `/orders?storeId=${storeId}` : "/orders";
    const response = await axios.get(url);

    // Check if we got orders in the response
    if (response.data.orders && Array.isArray(response.data.orders)) {
      return response.data.orders;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }

    // If we got a successful response but no orders property or it's not an array,
    // return empty array as the proper way to represent "no orders"
    return [];
  } catch (error: any) {
    // For backward compatibility, still handle 404 "No orders found" as a non-error case
    if (error?.response?.status === 404) {
      return []; // Return empty array for 404 responses
    }

    // Check for authentication issues
    if (error?.response?.status === 401) {
      throw new Error("Authentication error - please log in again");
    }

    // Return empty array for any error to prevent breaking the UI
    return [];
  }
};

export const createOrder = async (
  orderData: Partial<Order>
): Promise<Order> => {
  const formData = new FormData();

  // Append files and their details
  if (orderData.files && orderData.files.length > 0) {
    const fileDetails = orderData.files.map((file) => ({
      originalName: (file as any).file.name,
      copies: file.copies || 1,
      specialPaper: file.specialPaper || "none",
      printType: file.printType || "blackAndWhite",
      doubleSided: file.doubleSided || false,
      binding: file.binding || { needed: false, type: "none" },
      specificRequirements: file.specificRequirements || "",
    }));

    // Append each file to the form data
    orderData.files.forEach((file) => {
      formData.append("files", (file as any).file);
    });

    // Append file details as a JSON string
    formData.append("fileDetails", JSON.stringify(fileDetails));

    // Remove files from orderData to avoid sending it twice
    delete orderData.files;
  }

  // Append other order fields
  Object.keys(orderData).forEach((key) => {
    const value = orderData[key as keyof typeof orderData];
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  try {
    const response = await axios.post("/orders", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.order;
  } catch (error: any) {
    throw error.response?.data || new Error("Failed to create order");
  }
};

export const updateOrder = async (
  id: string,
  orderData: Partial<Order>
): Promise<Order> => {
  try {
    const response = await axios.put(`/orders/${id}`, orderData);
    return response.data;
  } catch (error: any) {
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Failed to update order");
    }
    throw new Error("An unexpected error occurred while updating order");
  }
};

export const deleteOrder = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/orders/${id}`);
  } catch (error: any) {
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Failed to delete order");
    }
    throw new Error("An unexpected error occurred while deleting order");
  }
};

export const fetchOrderById = async (id: string): Promise<Order> => {
  try {
    const response = await axios.get(`/orders/${id}`);
    return response.data;
  } catch (error: any) {
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Failed to fetch order");
    }
    throw new Error("An unexpected error occurred while fetching order");
  }
};

export const fetchDashboardData = async (
  setRecentOrders: (orders: Order[]) => void,
  setStats: (stats: any) => void,
  setChartData: (data: any) => void
) => {
  try {
    const ordersResponse = await axios.get("/orders");
    const orders: Order[] = Array.isArray(ordersResponse.data.orders)
      ? ordersResponse.data.orders
      : [];

    const sortedOrders = [...orders].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    setRecentOrders(sortedOrders.slice(0, 5));

    const currentYearData = getCurrentYearData(orders);
    setChartData(currentYearData);

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const todayOrders = orders.filter((order: any) => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    });

    const monthlyOrders = orders.filter((order: any) => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    });

    const totalRevenue = orders.reduce((total: number, order: any) => {
      const price = order.totalPrice || 0;
      return (
        total + (typeof price === "number" ? price : parseFloat(price) || 0)
      );
    }, 0);

    const monthlyRevenue = monthlyOrders.reduce((total: number, order: any) => {
      const price = order.totalPrice || 0;
      return (
        total + (typeof price === "number" ? price : parseFloat(price) || 0)
      );
    }, 0);

    const statusCounts = orders.reduce((acc: any, order: any) => {
      if (!order.status) return acc;
      const status = order.status.toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    setStats({
      totalOrders: orders.length,
      pendingOrders: statusCounts.pending || 0,
      completedOrders: statusCounts.completed || 0,
      totalRevenue,
      dailyOrders: todayOrders.length,
      monthlyOrders: monthlyOrders.length,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
};
