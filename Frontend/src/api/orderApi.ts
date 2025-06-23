// Order APIs
import axios from "@/config/axios";
import { Order } from "@/types/order";

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const response = await axios.get("/orders");
    
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
