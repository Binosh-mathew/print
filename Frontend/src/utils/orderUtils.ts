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
 * Always returns false since we're not using mock data
 */
export const shouldUseMockData = (): boolean => {
  return false;
}; 

/**
 * Helper function to create a debounced version of a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Parse and sort orders by creation date
 */
export function sortOrdersByDate(orders: Order[]): Order[] {
  if (!orders || !Array.isArray(orders) || orders.length === 0) return [];
  
  return [...orders].sort(
    (a, b) =>
      new Date(b.createdAt || "").getTime() -
      new Date(a.createdAt || "").getTime()
  );
}

/**
 * Extract paper and binding information from an order
 */
export function getPaperAndBindingInfo(order: Order) {
  if (!order.files || order.files.length === 0)
    return { paper: "Normal A4", binding: "None" };

  const specialPapers = order.files
    .filter((file) => file.specialPaper !== "none")
    .map((file) => file.specialPaper);

  const bindingTypes = order.files
    .filter((file) => file.binding.needed && file.binding.type !== "none")
    .map((file) => file.binding.type);

  return {
    paper: specialPapers.length > 0 ? specialPapers.join(", ") : "Normal A4",
    binding:
      bindingTypes.length > 0
        ? bindingTypes.map((type) => type.replace("Binding", "")).join(", ")
        : "None",
  };
}