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
  const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password, role });
  return response.data.user;
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

// Store APIs
export const fetchStores = async (): Promise<Store[]> => {
  const response = await axios.get(`${API_BASE_URL}/stores`);
  return response.data;
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

// User APIs
export const fetchUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${API_BASE_URL}/users`);
  return response.data;
};

export const updateUserProfile = async (userId: string, userData: Partial<User>): Promise<User> => {
  const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData);
  return response.data;
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
