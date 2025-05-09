import { Order } from '@/types/order';
import { orders as mockOrders } from '@/services/mockData';
import { shouldUseMockData } from '@/utils/orderUtils';

// Define the base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; 

// Helper to determine if we should use mock data
const useMockData = shouldUseMockData();

export const fetchOrders = async (): Promise<Order[]> => {
  // If we're in an environment where the API is likely unavailable, use mock data immediately
  if (useMockData) {
    console.log('Using mock data for orders (API likely unavailable in this environment)');
    return mockOrders;
  }
  
  console.log('Fetching orders from:', `${API_BASE_URL}/api/orders`);
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      // Add a timeout to prevent long waiting times
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Orders data received:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchOrders:', error);
    
    // Return mock data when API is unreachable
    console.log('Using mock data instead of API');
    return mockOrders;
  }
};

export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
  // If we're in an environment where the API is likely unavailable, use mock data immediately
  if (useMockData) {
    console.log('Using mock data for order creation (API likely unavailable in this environment)');
    const orderId = `ORD${(mockOrders.length + 1001).toString()}`;
    const mockOrder: Order = {
      ...orderData as any,
      _id: `mock-${Date.now()}`,
      id: `mock-${Date.now()}`,
      orderId: orderId,
      status: orderData.status || 'Pending',
      customerName: orderData.customerName || 'Mock Customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add the mock order to the mock data
    mockOrders.push(mockOrder as any);
    
    return mockOrder;
  }
  
  console.log('Creating order with data:', orderData);
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create order error:', errorText);
      throw new Error('Failed to create order');
    }
    
    const data = await response.json();
    console.log('Order created:', data);
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    
    // Create a mock order when API is unreachable
    console.log('Using mock data for created order');
    const orderId = `ORD${(mockOrders.length + 1001).toString()}`;
    const mockOrder: Order = {
      ...orderData as any,
      _id: `mock-${Date.now()}`,
      id: `mock-${Date.now()}`,
      orderId: orderId,
      status: orderData.status || 'Pending',
      customerName: orderData.customerName || 'Mock Customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add the mock order to the mock data
    mockOrders.push(mockOrder as any);
    
    return mockOrder;
  }
};

export const updateOrder = async (id: string, orderData: Partial<Order>): Promise<Order> => {
  // If we're in an environment where the API is likely unavailable, use mock data immediately
  if (useMockData) {
    console.log('Using mock data for order update (API likely unavailable in this environment)');
    const orderIndex = mockOrders.findIndex(o => o.id === id || o._id === id);
    
    if (orderIndex !== -1) {
      mockOrders[orderIndex] = {
        ...mockOrders[orderIndex],
        ...orderData as any,
        updatedAt: new Date().toISOString()
      };
      return mockOrders[orderIndex] as Order;
    }

    throw new Error(`Order with ID ${id} not found`);
  }
  
  console.log(`Updating order ${id} with:`, orderData);
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update order error:', errorText);
      throw new Error('Failed to update order');
    }
    
    const data = await response.json();
    console.log('Order updated:', data);
    return data;
  } catch (error) {
    console.error('Error updating order:', error);
    
    // Update mock data when API is unreachable
    console.log('Using mock data for updating order');
    const orderIndex = mockOrders.findIndex(o => o.id === id || o._id === id);
    
    if (orderIndex !== -1) {
      mockOrders[orderIndex] = {
        ...mockOrders[orderIndex],
        ...orderData as any,
        updatedAt: new Date().toISOString()
      };
      return mockOrders[orderIndex] as Order;
    }

    throw new Error(`Order with ID ${id} not found`);
  }
};

export const deleteOrder = async (id: string): Promise<void> => {
  // If we're in an environment where the API is likely unavailable, use mock data immediately
  if (useMockData) {
    console.log('Using mock data for order deletion (API likely unavailable in this environment)');
    const orderIndex = mockOrders.findIndex(o => o.id === id || o._id === id);
    
    if (orderIndex !== -1) {
      mockOrders.splice(orderIndex, 1);
    }
    return;
  }
  
  console.log(`Deleting order: ${id}`);
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete order error:', errorText);
      throw new Error('Failed to delete order');
    }
    
    console.log('Order deleted successfully');
  } catch (error) {
    console.error('Error deleting order:', error);
    
    // Remove from mock data when API is unreachable
    console.log('Using mock data for deleting order');
    const orderIndex = mockOrders.findIndex(o => o.id === id || o._id === id);
    
    if (orderIndex !== -1) {
      mockOrders.splice(orderIndex, 1);
    }
  }
};

export const fetchOrderById = async (id: string): Promise<Order> => {
  // If we're in an environment where the API is likely unavailable, use mock data immediately
  if (useMockData) {
    console.log('Using mock data for order details (API likely unavailable in this environment)');
    const mockOrder = mockOrders.find(o => o.id === id || o._id === id);
    
    if (mockOrder) {
      return mockOrder as Order;
    }

    throw new Error(`Order with ID ${id} not found`);
  }
  
  console.log(`Fetching order: ${id}`);
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fetch order by ID error:', errorText);
      throw new Error('Failed to fetch order');
    }
    
    const data = await response.json();
    console.log('Order details retrieved:', data);
    return data;
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    
    // Return mock data when API is unreachable
    console.log('Using mock data for order details');
    const mockOrder = mockOrders.find(o => o.id === id || o._id === id);
    
    if (mockOrder) {
      return mockOrder as Order;
    }

    throw new Error(`Order with ID ${id} not found`);
  }
};

export const registerUser = async (name: string, email: string, password: string): Promise<any> => {
  // If we're in an environment where the API is likely unavailable, use mock data immediately
  if (useMockData) {
    console.log('Using mock data for user registration (API likely unavailable in this environment)');
    // Return a mock user response
    return {
      id: `mock-${Date.now()}`,
      name,
      email,
      role: 'user',
    };
  }
  
  console.log('Registering user:', name, email);
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Register user error:', errorData);
      throw new Error(errorData.message || 'Failed to register user');
    }
    
    const data = await response.json();
    console.log('User registered:', data);
    return data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string, role: string = 'user'): Promise<any> => {
  // If we're in an environment where the API is likely unavailable, use mock data immediately
  if (useMockData) {
    console.log('Using mock data for user login (API likely unavailable in this environment)');
    
    // For mock data, we'll check against hardcoded values
    if (role === 'admin' && email === 'admin@example.com' && password === 'admin123') {
      return {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      };
    } else if (role === 'user' && email === 'user@example.com' && password === 'user123') {
      return {
        id: '2',
        name: 'John Doe',
        email: 'user@example.com',
        role: 'user'
      };
    } else {
      throw new Error('Invalid email or password');
    }
  }
  
  console.log('Logging in user:', email);
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Login user error:', errorData);
      throw new Error(errorData.message || 'Failed to login');
    }
    
    const data = await response.json();
    console.log('User logged in:', data);
    
    // Verify role matches requested role
    if (role && data.role !== role) {
      throw new Error(`User does not have ${role} privileges`);
    }
    
    return data;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, userData: any): Promise<any> => {
  // If we're in an environment where the API is likely unavailable, use mock data immediately
  if (useMockData) {
    console.log('Using mock data for user profile update (API likely unavailable in this environment)');
    
    // In a real app, this would update the user in the database
    // For now, we just return the updated data
    return {
      id: userId,
      ...userData
    };
  }
  
  console.log(`Updating user ${userId} with:`, userData);
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update user error:', errorText);
      throw new Error('Failed to update user profile');
    }
    
    const data = await response.json();
    console.log('User profile updated:', data);
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    // Return mock data when API is unreachable
    console.log('Using mock data for user profile update');
    return {
      id: userId,
      ...userData
    };
  }
};
