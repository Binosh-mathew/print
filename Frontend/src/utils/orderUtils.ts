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

/**
 * Gets the appropriate color class for order status badges
 */
export const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'processing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'ready':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'completed':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'shipped':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'delivered':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Sorts orders based on the given key and direction
 */
export const sortOrders = (orders: Order[], key: keyof Order, direction: 'asc' | 'desc'): Order[] => {
  return [...orders].sort((a, b) => {
    let aValue = a[key];
    let bValue = b[key];

    // Handle undefined values
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return direction === 'asc' ? 1 : -1;
    if (bValue === undefined) return direction === 'asc' ? -1 : 1;

    // Handle special cases for sorting
    if (key === 'createdAt' || key === 'updatedAt') {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

/**
 * Filters orders based on search query and status
 */
export const filterOrders = (
  orders: Order[], 
  searchQuery: string, 
  statusFilter: string = ''
): Order[] => {
  return orders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.documentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || 
      order.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });
};

/**
 * Calculates total amount with updated charges
 */
export const calculateTotalWithCharges = (
  order: Order,
  printCharges: number = 0,
  bindingCharges: number = 0
): number => {
  // Use existing totalPrice if no custom charges provided
  if (printCharges === 0 && bindingCharges === 0) {
    return order.totalPrice || 0;
  }
  
  return printCharges + bindingCharges;
};

/**
 * Formats date for display
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

/**
 * Gets display name for customer
 */
export const getCustomerName = (order: Order): string => {
  return order.customerName || order.userName || 'Unknown User';
};

/**
 * Checks if order is recent (within last 24 hours)
 */
export const isRecentOrder = (order: Order): boolean => {
  const orderDate = new Date(order.createdAt);
  const now = new Date();
  const timeDiff = now.getTime() - orderDate.getTime();
  const hoursDiff = timeDiff / (1000 * 3600);
  
  return hoursDiff <= 24;
};