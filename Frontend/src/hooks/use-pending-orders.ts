import { useState, useEffect } from 'react';
import { fetchPendingOrdersCount } from '@/api/storesApi';
import type { Store } from '@/types/store';

/**
 * Custom hook to fetch pending orders for stores
 * This is a more resilient approach that handles network errors gracefully
 */
export function usePendingOrders(stores: Store[]) {
  const [pendingOrders, setPendingOrders] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPendingOrders = async () => {
      if (stores.length === 0) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchPendingOrdersCount();
        setPendingOrders(data);
      } catch (err) {
        console.error('Error in usePendingOrders hook:', err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching pending orders'));
        // Still keep the empty pendingOrders object so UI doesn't break
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPendingOrders();
  }, [stores]);
  
  // Apply pending orders to the store list
  const storesWithPendingOrders = stores.map(store => {
    const storeId = store._id?.toString() || store.id?.toString() || "";
    return {
      ...store,
      pendingOrdersCount: pendingOrders[storeId] || 0
    };
  });
  
  return {
    storesWithPendingOrders,
    isLoading,
    error,
    rawPendingOrdersData: pendingOrders
  };
}
