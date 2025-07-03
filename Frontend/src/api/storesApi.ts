// API functions for stores
import { Store } from "@/types/store";
import axios from "../config/axios";

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

export const fetchStoreFeatures = async (id: string): Promise<any> => {
  try {
    const response = await axios.get(`/stores/${id}`);
    return response.data.features;
  } catch (error: any) {
    if (error?.response?.data) {
      throw new Error(
        error.response.data.message || "Failed to fetch store features"
      );
    }
    throw new Error(
      "An unexpected error occurred while fetching store features"
    );
  }
};

export const updateStoreFeatures = async (
  id: string,
  featuresData: any,
  status?: string
): Promise<any> => {
  try {
    const updateData: any = { features: featuresData };
    if (status !== undefined) {
      updateData.status = status;
    }
    
    const response = await axios.put(
      `/stores/${id}/features`,
      updateData
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      throw new Error(
        error.response.data.message || "Failed to update store features"
      );
    }
    throw new Error(
      "An unexpected error occurred while updating store features"
    );
  }
};

export const fetchPendingOrdersCount = async (): Promise<Record<string, number>> => {
  // Always use the endpoint that returns real data
  const endpoints = [
    "/orders/pending-by-store", // Our primary endpoint in orders.js
    "/stores/pending-orders-alt" // Fallback endpoint
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint, { 
        // Set a shorter timeout to avoid long waits if the server is having issues
        timeout: 3000
      });
      
      // Check if the response has the expected structure
      if (response.data && response.data.pendingOrdersByStore) {
        return response.data.pendingOrdersByStore;
      } else {
        console.warn(`Unexpected response format from ${endpoint}:`, response.data);
      }
    } catch (error: any) {
      console.warn(`Error fetching pending orders count from ${endpoint}:`, error);
      // Log additional details about the error for debugging
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.warn(`Server responded with error from ${endpoint}:`, {
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.warn(`No response received from ${endpoint}`);
      } else {
        // Something else caused the error
        console.warn(`Error setting up request to ${endpoint}:`, error.message);
      }
      
      // Continue to the next endpoint
      continue;
    }
  }
  
  console.warn("All endpoints failed, returning empty pending orders count");
  // Return an empty object if all endpoints fail
  return {};
};
