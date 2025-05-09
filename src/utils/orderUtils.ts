/**
 * Utility functions for order-related operations
 */

import { Order } from '@/types/order';

/**
 * Checks if an order has a specific status in a case-insensitive way
 * This helps avoid TypeScript errors from case mismatches
 */
export const hasStatus = (order: Partial<Order>, statusToCheck: string): boolean => {
  if (!order?.status) return false;
  return order.status.toLowerCase() === statusToCheck.toLowerCase();
};

/**
 * Converts any status string to the proper case as defined in the Order type
 * This helps ensure we're always using the correct case when updating status
 */
export const normalizeStatus = (status: string): Order['status'] => {
  const statusMap: Record<string, Order['status']> = {
    'pending': 'Pending',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'completed': 'Completed'
  };
  
  const normalizedStatus = statusMap[status.toLowerCase()];
  if (!normalizedStatus) {
    console.warn(`Unknown status: ${status}, defaulting to Pending`);
    return 'Pending';
  }
  
  return normalizedStatus;
};

/**
 * Determines if we should use mock data instead of real API
 * This helps avoid unnecessary network requests in environments where the API is unavailable
 */
export const shouldUseMockData = (): boolean => {
  // In development mode or in Lovable environment, use mock data
  const isLovableEnv = window.location.hostname.includes('lovable.app');
  const isDev = import.meta.env.MODE === 'development';
  
  return isDev || isLovableEnv;
};
