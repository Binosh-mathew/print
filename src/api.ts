import { Order } from "@/types/order";
import { Store } from "@/types/store";
import { User } from "@/types/user";
import { Message } from "@/types/message";
import { LoginActivity } from "@/types/loginActivity";
import axios from "./config/axios"


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
    
    // Check for existing user error
    if (error?.response?.status === 400 && 
        error?.response?.data?.message?.includes("User already exists")) {
      throw new Error("User already exists");
    }
    
    // Handle other error messages
    if (error?.response?.data) {
      const errorMessage = error?.response?.data?.message || "Registration failed";
      throw new Error(errorMessage);
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
    // Return both user and token
    return {
      ...response.data.user,
      token: response.data.token
    };
  } catch (error: any) {
    // Handle specific error messages including email verification errors
    if (error?.response?.data) {
      // Check if this is a verification error
      if (error.response.data.needsVerification) {
        const verificationError = new Error(error.response.data.message || "Email verification required");
        // Add a custom property to indicate verification is needed
        (verificationError as any).needsVerification = true;
        throw verificationError;
      }
      throw new Error(error.response.data.message || "Login failed");
    }
    throw new Error("An unexpected error occurred during login");
  }
};

export const googleAuthLogin = async (
  userData: { email: string; name: string; photoURL?: string; uid: string }
): Promise<any> => {
  try {
    // Send refresh option to indicate if profile should be refreshed with latest Google data
    const response = await axios.post("/auth/google-auth", {
      ...userData,
      syncProfile: true // Always sync profile data on login
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Google authentication failed");
    }
    throw new Error("An unexpected error occurred during Google authentication");
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await axios.post("/auth/logout");
  } catch (error: any) {
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Logout failed");
    }
    throw new Error("An unexpected error occurred during logout");
  }
};


export const verifyAuth = async ():Promise<any> =>{
  try{
    const response = await axios.get("/auth/verify");
    return response.data;
  }catch(error:any){
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Verification failed");
    }
    throw new Error("An unexpected error occurred during verification");
  }
}

// Order APIs
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

// API functions for stores
export const fetchStores = async (): Promise<Store[]> => {
  try {
    const response = await axios.get("/stores");
    // Extract the stores array from the response data
    return response.data.stores || [];
  } catch (error: any) {
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
    const response = await axios.get(`/stores/admin/profile`);
    return response.data;
  } catch (error: any) {
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
    return response.data.pricing ;
  } catch (error: any) {
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
    const response = await axios.put(
      `/stores/${id}/pricing`,
      { pricing: pricingData }
    );
    return response.data;
  } catch (error: any) {
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
    throw new Error("An unexpected error occurred during profile update");
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  await axios.delete(`}/users/${userId}`);
};

// Message APIs
export const fetchMessages = async (): Promise<Message[]> => {
  try {
    const response = await axios.get(`/messages`);
    
    // Check different possible response structures
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.messages && Array.isArray(response.data.messages)) {
      return response.data.messages;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    return [];
  } catch (error: any) {
    // Handle specific error messages
    if (error?.response?.data) {
      throw new Error(error.response.data.message || "Failed to fetch messages");
    }
    throw new Error("An unexpected error occurred while fetching messages");
  }
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

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const response = await axios.post("/auth/check-email", { email });
    return response.data.exists;
  } catch (error) {
    return false;
  }
};
