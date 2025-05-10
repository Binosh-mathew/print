import axios from 'axios';
import { Order } from '@/types/order';

const API_BASE_URL = 'http://localhost:5000/api';

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

export const registerUser = async (name: string, email: string, password: string): Promise<any> => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, { username: name, email, password });
  return response.data;
};

export const loginUser = async (email: string, password: string, role: string = 'user'): Promise<any> => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password, role });
  return response.data.user;
};

export const updateUserProfile = async (userId: string, userData: any): Promise<any> => {
  const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData);
  return response.data;
};
