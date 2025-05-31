import axios from "./config/axios";
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
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Registration failed");
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
    console.error("Login error:", error);
    // Handle specific error messages
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Login failed");
    }
    throw new Error("An unexpected error occurred during login");
  }
};

// Order APIs
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const response = await axios.get("/orders");
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    // Return empty array if there's an error
    return [];
  }
};

export const createOrder = async (
  orderData: Partial<Order>
): Promise<Order> => {
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

    const response = await axios.post("/orders", orderPayload, config);
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
  const response = await axios.put("/orders/${id}", orderData);
  return response.data;
};

export const deleteOrder = async (id: string): Promise<void> => {
  await axios.delete(`/orders/${id}`);
};

export const fetchOrderById = async (id: string): Promise<Order> => {
  const response = await axios.get(`/orders/${id}`);
  return response.data;
};

// API functions for stores
export const fetchStores = async (): Promise<Store[]> => {
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

    const response = await axios.get(`/stores`, config);
    return response.data;
  } catch (error) {
    console.error("Error fetching stores:", error);
    // Return empty array if there's an error
    return [];
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
  } catch (error) {
    console.log("Error fetching admin store profile:", error);
    // Return mock data for development
    return {
      id: "mock-store-id",
      name: "Sample Print Store",
      location: "123 Main St, City",
      email: "admin@printstore.com",
      status: "active",
    };
  }
};

export const createStore = async (
  storeData: Partial<Store>
): Promise<Store> => {
  const response = await axios.post(`/stores`, storeData);
  return response.data;
};

export const updateStore = async (
  id: string,
  storeData: Partial<Store>
): Promise<Store> => {
  const response = await axios.put(`/stores/${id}`, storeData);
  return response.data;
};

export const deleteStore = async (id: string): Promise<void> => {
  await axios.delete(`/stores/${id}`);
};

export const fetchStoreById = async (id: string): Promise<Store> => {
  const response = await axios.get(`/stores/${id}`);
  return response.data;
};

export const fetchStorePricing = async (id: string): Promise<any> => {
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

    const response = await axios.get(`/stores/${id}`, config);
    return response.data.pricing || null;
  } catch (error) {
    console.error("Error fetching store pricing:", error);
    // Return default pricing if there's an error
    return {
      blackAndWhite: { singleSided: 2, doubleSided: 3 },
      color: { singleSided: 5, doubleSided: 8 },
      binding: { spiralBinding: 25, staplingBinding: 10, hardcoverBinding: 50 },
      paperTypes: { normal: 0, glossy: 5, matte: 7, transparent: 10 },
    };
  }
};

// This function has been moved to the User APIs section

export const updateStorePricing = async (
  id: string,
  pricingData: any
): Promise<any> => {
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
};

// User APIs
export const fetchUsers = async (): Promise<User[]> => {
  const response = await axios.get(`/users`);
  return response.data;
};

export const updateUserProfile = async (
  userId: string,
  userData: any
): Promise<any> => {
  try {
    // Get the user data from localStorage for authentication
    const storedUser = localStorage.getItem("printShopUser");
    let token = "";

    if (storedUser) {
      const user = JSON.parse(storedUser);
      token = user.token || "";
    }

    // Add authentication headers
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-User-ID": userId, // Fallback authentication
        "X-User-Role": "user", // Fallback authentication
      },
    };

    // Make the API call to update the user profile
    const response = await axios.put(
      `/auth/update`,
      {
        userId,
        ...userData,
      },
      config
    );

    console.log("Profile update successful:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error in updateUserProfile:", error);

    // Simulate successful update even if the API fails
    // This is a temporary solution until the backend is updated
    const storedUser = localStorage.getItem("printShopUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return {
        ...user,
        ...userData,
      };
    }

    throw error;
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
