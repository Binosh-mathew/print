import { Order } from '@/types/order';

/**
 * Normalizes the order status string to a consistent format
 */
export const normalizeStatus = (status: string): string => {
  return status.toLowerCase().replace(/\s+/g, '');
};

/**
 * Checks if an order has a specific status
 */
export const hasStatus = (order: Order, status: string): boolean => {
  return normalizeStatus(order.status) === normalizeStatus(status);
};

/**
 * Always returns true since we're using mock data
 */
export const shouldUseMockData = (): boolean => {
  return true;
}; 