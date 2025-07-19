// We only need axios for the API calls
import axios from "../config/axios";

export const fetchPendingOrdersCounts = async (): Promise<Record<string, number>> => {
  try {
    // Use the direct baseURL from environment variable to ensure we're hitting the correct endpoint
    const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    
    // First, try using axios instance with proper auth headers
    try {
      const response = await axios.get("/orders/pending-by-store");
      
      if (response.data && response.data.success && response.data.pendingOrdersByStore) {
        return response.data.pendingOrdersByStore;
      }
    } catch (error) {
      // Handle axios error properly with type checking
      const axiosError = error as { message?: string };
      console.warn("Could not fetch with axios instance, trying direct fetch:", axiosError.message || "Unknown error");
    }
    
    // Fallback to direct fetch without auth headers if axios fails
    const response = await fetch(`${baseURL}/orders/pending-by-store`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch pending orders: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.pendingOrdersByStore) {
      return data.pendingOrdersByStore;
    } else {
      console.warn("Unexpected response format:", data);
      return {};
    }
  } catch (error) {
    console.error("Error fetching pending orders counts:", error);
    return {};
  }
};
