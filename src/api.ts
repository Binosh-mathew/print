import axios from 'axios';
import { Order } from '@/types/order';
import { Store } from '@/types/store';
import { User } from '@/types/user';
import { Message } from '@/types/message';
import { LoginActivity } from '@/types/loginActivity';

const API_BASE_URL = 'http://localhost:5000/api';

// Auth APIs
export const registerUser = async (name: string, email: string, password: string): Promise<any> => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, { username: name, email, password });
  return response.data;
};

export const loginUser = async (email: string, password: string, role: string = 'user'): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password, role });
    return response.data.user;
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 400) {
        // Check if the error message contains information about role mismatch
        const errorData = error.response.data;
        if (errorData && errorData.message && errorData.message.includes('role')) {
          if (role === 'user' && errorData.message.includes('admin')) {
            throw new Error('Admin credentials cannot be used on the user login page. Please use the admin login page.');
          } else if (role === 'admin' && errorData.message.includes('user')) {
            throw new Error('User credentials cannot be used on the admin login page. Please use the user login page.');
          } else if (role === 'user' && errorData.message.includes('developer')) {
            throw new Error('Developer credentials cannot be used on the user login page. Please use the developer login page.');
          } else {
            throw new Error('Invalid credentials for this login page. Please use the correct login page for your role.');
          }
        } else {
          throw new Error('Invalid username or password');
        }
      } else if (error.response.status === 401) {
        throw new Error('Unauthorized access');
      } else if (error.response.status === 403) {
        throw new Error('Access forbidden for this role');
      } else if (error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    // Network error or other issues
    throw new Error('Login failed. Please try again later.');
  }
};

// Order APIs
export const fetchOrders = async (): Promise<Order[]> => {
  const response = await axios.get(`${API_BASE_URL}/orders`);
  return response.data;
};

export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
  const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
  return response.data;
};

export const updateOrder = async (id: string, orderData: Partial<Order>): Promise<Order> => {
  const response = await axios.put(`${API_BASE_URL}/orders/${id}`, orderData);
  return response.data;
};

export const deleteOrder = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/orders/${id}`);
};

export const fetchOrderById = async (id: string): Promise<Order> => {
  const response = await axios.get(`${API_BASE_URL}/orders/${id}`);
  return response.data;
};

// API functions for stores
export const fetchStores = async (): Promise<Store[]> => {
  const response = await axios.get(`${API_BASE_URL}/stores`);
  return response.data;
};

// Fetch store profile for admin
export const fetchAdminStoreProfile = async (): Promise<any> => {
  try {
    // Get the user data from localStorage for authentication
    const storedUser = localStorage.getItem('printShopUser');
    let token = '';
    let userId = '';
    let userRole = '';
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      token = user.token || '';
      userId = user.id || '';
      userRole = user.role || '';
    }

    // Add authentication headers
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-User-ID': userId,
        'X-User-Role': userRole
      }
    };

    const response = await axios.get(`${API_BASE_URL}/stores/admin/profile`, config);
    return response.data;
  } catch (error) {
    console.log('Error fetching admin store profile:', error);
    // Return mock data for development
    return {
      id: 'mock-store-id',
      name: 'Sample Print Store',
      location: '123 Main St, City',
      email: 'admin@printstore.com',
      status: 'active'
    };
  }
};

export const createStore = async (storeData: Partial<Store>): Promise<Store> => {
  const response = await axios.post(`${API_BASE_URL}/stores`, storeData);
  return response.data;
};

export const updateStore = async (id: string, storeData: Partial<Store>): Promise<Store> => {
  const response = await axios.put(`${API_BASE_URL}/stores/${id}`, storeData);
  return response.data;
};

export const deleteStore = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/stores/${id}`);
};

export const fetchStoreById = async (id: string): Promise<Store> => {
  const response = await axios.get(`${API_BASE_URL}/stores/${id}`);
  return response.data;
};

export const fetchStorePricing = async (id: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stores/${id}`);
    return response.data.pricing || null;
  } catch (error) {
    console.error('Error fetching store pricing:', error);
    return null;
  }
};

// This function has been moved to the User APIs section

export const updateStorePricing = async (id: string, pricingData: any): Promise<any> => {
  // Get the user data from localStorage for authentication
  const storedUser = localStorage.getItem('printShopUser');
  let headers = {};
  
  if (storedUser) {
    const userData = JSON.parse(storedUser);
    headers = {
      'X-User-ID': userData.id,
      'X-User-Role': userData.role
    };
  }
  
  const response = await axios.put(
    `${API_BASE_URL}/stores/${id}/pricing`, 
    { pricing: pricingData },
    { headers }
  );
  return response.data;
};

// User APIs
export const fetchUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${API_BASE_URL}/users`);
  return response.data;
};

export const updateUserProfile = async (userId: string, userData: any): Promise<any> => {
  try {
    // Get the user data from localStorage for authentication
    const storedUser = localStorage.getItem('printShopUser');
    let token = '';
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      token = user.token || '';
    }

    // Add authentication headers
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-User-ID': userId,  // Fallback authentication
        'X-User-Role': 'user' // Fallback authentication
      }
    };

    // Make the API call to update the user profile
    const response = await axios.put(`${API_BASE_URL}/auth/update`, {
      userId,
      ...userData
    }, config);

    console.log('Profile update successful:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    
    // Simulate successful update even if the API fails
    // This is a temporary solution until the backend is updated
    const storedUser = localStorage.getItem('printShopUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return {
        ...user,
        ...userData
      };
    }
    
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/users/${userId}`);
};

// Message APIs
export const fetchMessages = async (): Promise<Message[]> => {
  const response = await axios.get(`${API_BASE_URL}/messages`);
  return response.data;
};

export const createMessage = async (messageData: Partial<Message>): Promise<Message> => {
  const response = await axios.post(`${API_BASE_URL}/messages`, messageData);
  return response.data;
};

export const updateMessage = async (id: string, messageData: Partial<Message>): Promise<Message> => {
  const response = await axios.put(`${API_BASE_URL}/messages/${id}`, messageData);
  return response.data;
};

export const deleteMessage = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/messages/${id}`);
};

// Stats APIs
export const fetchPlatformStats = async (): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/platform-stats`);
  return response.data;
};

export const fetchLoginActivity = async (): Promise<LoginActivity[]> => {
  const response = await axios.get(`${API_BASE_URL}/login-activity`);
  return response.data;
};

// Developer APIs
export const fetchSystemStatus = async (): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/system-status`);
  return response.data;
};

export const fetchDatabaseStats = async (): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/database-stats`);
  return response.data;
};

export const fetchLogs = async (): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/logs`);
  return response.data;
};

// Create Admin API (Developer only)
export const createAdmin = async (adminData: { username: string; email: string; password: string; storeName: string }): Promise<any> => {
  const response = await axios.post(`${API_BASE_URL}/create-admin`, adminData);
  return response.data;
};
