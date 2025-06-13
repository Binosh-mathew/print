import axios from "./config/axios";

// --- Global 401 handler ---
import useAuthStore from "@/store/authStore";

// Only attach once (guards against hot reload)
if (!(window as any)._axios401InterceptorAttached) {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Clear auth and redirect to login
        try {
          // Clear auth store if available
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_data");
          }
        } catch {}
        // Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );
  (window as any)._axios401InterceptorAttached = true;
}

import { Order } from "@/types/order";
import { Store } from "@/types/store";
import { User } from "@/types/user";
import { Message } from "@/types/message";
import { LoginActivity } from "@/types/loginActivity";

// Auth APIs
export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<any> => {
  try {
    const response = await axios.post("/auth/register", {
      username: name,
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    console.error("Registration error:", error);
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error?.response?.data?.message || "Registration failed");
    }
    throw new Error("An unexpected error occurred during registration");
  }
};

export const loginUser = async (
  email: string,
  password: string,
  role: string = "user"
): Promise<any> => {
  try {
    const response = await axios.post("/auth/login", { email, password, role });
    return response.data.user;
  } catch (error: any) {
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Login failed");
    }
    throw new Error("An unexpected error occurred during login");
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await axios.post("/auth/logout");
  } catch (error: any) {
    console.error("Logout error:", error);
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Logout failed");
    }
    throw new Error("An unexpected error occurred during logout");
  }
};

// Order APIs
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const response = await axios.get("/orders");
    // Check both possible response structures
    if (response.data.orders && Array.isArray(response.data.orders)) {
      return response.data.orders;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error: any) {
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Failed to fetch orders");
    }
    throw new Error("An unexpected error occurred while fetching orders");
  }
};

export const createOrder = async (
  orderData: Partial<Order>
): Promise<Order> => {
  try {
    // Create a copy of orderData to avoid mutating the original
    const orderPayload = { ...orderData };

    // Handle file data formatting if needed
    if (orderPayload.files && Array.isArray(orderPayload.files)) {
      const formattedFiles = orderPayload.files.map((file) => {
        // Format the file data appropriately for the backend
        const formattedFile: any = {
          fileName: file.file ? (file.file as File).name : "",
          copies: file.copies,
          specialPaper: file.specialPaper,
          printType: file.printType,
          doubleSided: file.doubleSided,
          binding: {
            needed: file.binding.needed,
            type: file.binding.type,
          },
          specificRequirements: file.specificRequirements,
        };
        return formattedFile;
      });

      // Replace the files array with our formatted version
      orderPayload.files = formattedFiles as any;
    }

    console.log("Sending order to backend:", JSON.stringify(orderPayload));

    const response = await axios.post("/orders", orderPayload);
    return response.data;
  } catch (error: any) {
    console.error("Error creating order:", error);
    // Add more detailed error logging
    if (error.response) {
      console.error("Server response:", error.response.data);
    }
    throw error; // Re-throw to allow component to handle the error
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
    console.error("Error updating order:", error);
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
    console.error("Error deleting order:", error);
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
    console.error("Error fetching order:", error);
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Failed to fetch order");
    }
    throw new Error("An unexpected error occurred while fetching order");
  }
};

// API functions for stores
export const fetchStores = async (): Promise<Store[]> => {
  try {
    const response = await axios.get("/stores");
    // Extract the stores array from the response data
    return response.data.stores || [];
  } catch (error: any) {
    console.error("Error fetching stores:", error);
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Failed to fetch stores");
    }
    throw new Error("An unexpected error occurred while fetching stores");
  }
};

// Fetch store profile for admin
export const fetchAdminStoreProfile = async (): Promise<any> => {
  try {
    // Get the user data from localStorage for authentication
    const storedUser = localStorage.getItem("printShopUser");
    let token = "";
    let userId = "";
    let userRole = "";

    if (storedUser) {
      const user = JSON.parse(storedUser);
      token = user.token || "";
      userId = user.id || "";
      userRole = user.role || "";
    }

    // Add authentication headers
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-User-ID": userId,
        "X-User-Role": userRole,
      },
    };

    const response = await axios.get(`/stores/admin/profile`, config);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching admin store profile:", error);
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(
        error.response.data.message || "Failed to fetch admin store profile"
      );
    }
    throw new Error(
      "An unexpected error occurred while fetching admin store profile"
    );
  }
};

export const createStore = async (
  storeData: Partial<Store>
): Promise<Store> => {
  try {
    const response = await axios.post(`/stores`, storeData);
    return response.data;
  } catch (error: any) {
    console.error("Error creating store:", error);
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Failed to create store");
    }
    throw new Error("An unexpected error occurred while creating store");
  }
};

export const updateStore = async (
  id: string,
  storeData: Partial<Store>
): Promise<Store> => {
  try {
    const response = await axios.put(`/stores/${id}`, storeData);
    return response.data;
  } catch (error: any) {
    console.error("Error updating store:", error);
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Failed to update store");
    }
    throw new Error("An unexpected error occurred while updating store");
  }
};

export const deleteStore = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/stores/${id}`);
  } catch (error: any) {
    console.error("Error deleting store:", error);
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Failed to delete store");
    }
    throw new Error("An unexpected error occurred while deleting store");
  }
};

export const fetchStoreById = async (id: string): Promise<Store> => {
  try {
    const response = await axios.get(`/stores/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching store:", error);
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Failed to fetch store");
    }
    throw new Error("An unexpected error occurred while fetching store");
  }
};

export const fetchStorePricing = async (id: string): Promise<any> => {
  try {
    const response = await axios.get(`/stores/${id}`);
    return response.data.pricing || null;
  } catch (error: any) {
    console.error("Error fetching store pricing:", error);
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(
        error.response.data.message || "Failed to fetch store pricing"
      );
    }
    throw new Error(
      "An unexpected error occurred while fetching store pricing"
    );
  }
};

// This function has been moved to the User APIs section

export const updateStorePricing = async (
  id: string,
  pricingData: any
): Promise<any> => {
  try {
    // Get the user data from localStorage for authentication
    const storedUser = localStorage.getItem("printShopUser");
    let headers = {};

    if (storedUser) {
      const userData = JSON.parse(storedUser);
      headers = {
        "X-User-ID": userData.id,
        "X-User-Role": userData.role,
      };
    }

    const response = await axios.put(
      `/stores/${id}/pricing`,
      { pricing: pricingData },
      { headers }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating store pricing:", error);
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(
        error.response.data.message || "Failed to update store pricing"
      );
    }
    throw new Error(
      "An unexpected error occurred while updating store pricing"
    );
  }
};

// User APIs
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get(`/users`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching users:", error);
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Failed to fetch users");
    }
    throw new Error("An unexpected error occurred while fetching users");
  }
};

export const updateUserProfile = async (
  userId: string,
  userData: any
): Promise<any> => {
  if (!userId || !userData) {
    throw new Error("User ID and user data are required for profile update");
  }
  try {
    // Make the API call to update the user profile
    const response = await axios.put("auth/update", {
      id: userId,
      ...userData, // Spread the userData to include all fields
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Profile update failed");
    }
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  await axios.delete(`}/users/${userId}`);
};

// Message APIs
export const fetchMessages = async (): Promise<Message[]> => {
  const response = await axios.get(`/messages`);
  return response.data;
};

export const createMessage = async (
  messageData: Partial<Message>
): Promise<Message> => {
  const response = await axios.post(`/messages`, messageData);
  return response.data;
};

export const updateMessage = async (
  id: string,
  messageData: Partial<Message>
): Promise<Message> => {
  const response = await axios.put(`/messages/${id}`, messageData);
  return response.data;
};

export const deleteMessage = async (id: string): Promise<void> => {
  await axios.delete(`/messages/${id}`);
};

// Stats APIs
export const fetchPlatformStats = async (): Promise<any> => {
  const response = await axios.get(`/platform-stats`);
  return response.data;
};

export const fetchLoginActivity = async (): Promise<LoginActivity[]> => {
  const response = await axios.get(`/login-activity`);
  return response.data;
};

// Developer APIs
export const fetchSystemStatus = async (): Promise<any> => {
  const response = await axios.get(`/system-status`);
  return response.data;
};

export const fetchDatabaseStats = async (): Promise<any> => {
  const response = await axios.get(`}/database-stats`);
  return response.data;
};

export const fetchLogs = async (): Promise<any> => {
  const response = await axios.get(`/logs`);
  return response.data;
};

// Create Admin API (Developer only)
export const createAdmin = async (adminData: {
  username: string;
  email: string;
  password: string;
  storeName: string;
}): Promise<any> => {
  const response = await axios.post(`/create-admin`, adminData);
  return response.data;
};
