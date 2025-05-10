import { Order } from '@/types/order';
import { orders as mockOrders } from '@/services/mockData';

export const fetchOrders = async (): Promise<Order[]> => {
  console.log('Using mock data for orders');
  return mockOrders;
};

export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
  console.log('Creating mock order with data:', orderData);
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
  
  mockOrders.push(mockOrder as any);
  return mockOrder;
};

export const updateOrder = async (id: string, orderData: Partial<Order>): Promise<Order> => {
  console.log('Updating mock order:', id);
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
};

export const deleteOrder = async (id: string): Promise<void> => {
  console.log('Deleting mock order:', id);
  const orderIndex = mockOrders.findIndex(o => o.id === id || o._id === id);
  
  if (orderIndex !== -1) {
    mockOrders.splice(orderIndex, 1);
  }
};

export const fetchOrderById = async (id: string): Promise<Order> => {
  console.log('Fetching mock order:', id);
  const mockOrder = mockOrders.find(o => o.id === id || o._id === id);
  
  if (mockOrder) {
    return mockOrder as Order;
  }

  throw new Error(`Order with ID ${id} not found`);
};

export const registerUser = async (name: string, email: string, password: string): Promise<any> => {
  console.log('Registering mock user:', name, email);
  return {
    id: `mock-${Date.now()}`,
    name,
    email,
    role: 'user',
  };
};

export const loginUser = async (email: string, password: string, role: string = 'user'): Promise<any> => {
  console.log('Logging in mock user:', email);
  
  // For mock data, we'll check against hardcoded values
  if (role === 'developer' && email === 'developer@system.com' && password === 'dev123') {
    return {
      id: 'dev1',
      name: 'System Developer',
      email: 'developer@system.com',
      role: 'developer'
    };
  } else if (role === 'admin' && email === 'admin@example.com' && password === 'admin123') {
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
};

export const updateUserProfile = async (userId: string, userData: any): Promise<any> => {
  console.log('Updating mock user profile:', userId);
  return {
    id: userId,
    ...userData,
    updatedAt: new Date().toISOString()
  };
};
