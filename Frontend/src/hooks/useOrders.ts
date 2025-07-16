import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { fetchOrders } from '@/api';
import { toast } from '@/components/ui/use-toast';
import { Order } from '@/types/order';
import { debounce, sortOrdersByDate } from '@/utils/orderUtils';

interface UseOrdersOptions {
  userId?: string;
}

export function useOrders({ userId }: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const socket = useSocket();
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadStarted = useRef(false);
  const isMountedRef = useRef(true);
  
  // Create a debounced version of loadOrders to prevent rapid firing from socket events
  const debouncedRefresh = useRef(debounce(() => {
    loadOrders();
  }, 800));

  // Load orders from API
  const loadOrders = useCallback(async () => {
    // Avoid triggering a load if we're already loading
    if (isLoading) {
      return;
    }
    
    // Skip if component is unmounted
    if (!isMountedRef.current) {
      return;
    }
    
    // Clear any existing loading guard timer
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    // Set a guard timeout to ensure loading state is eventually reset
    loadingTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }, 15000); // 15 seconds max loading time
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      const data = await fetchOrders();

      if (!isMountedRef.current) return;

      // Handle different response formats
      let ordersList: Order[] = [];
      
      if (Array.isArray(data)) {
        ordersList = data;
      } else if (data && typeof data === 'object') {
        // Cast data to any to handle unknown structure
        const responseData = data as any;
        
        // Check if the response has an orders array property
        if (Array.isArray(responseData.orders)) {
          ordersList = responseData.orders;
        } else {
          // Search for any property that might be an array of orders
          for (const key in responseData) {
            if (Array.isArray(responseData[key])) {
              if (responseData[key].length > 0 && 
                  (responseData[key][0].orderId || responseData[key][0]._id || responseData[key][0].status)) {
                ordersList = responseData[key];
                break;
              }
            }
          }
        }
      }

      // Filter orders by userId if provided
      if (userId) {
        ordersList = ordersList.filter(order => 
          order.userId === userId
        );
      }
      
      // Sort orders by creation date
      const sortedOrders = sortOrdersByDate(ordersList);
      
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (!isMountedRef.current) return;
      
      setHasError(true);
      toast({
        title: "Couldn't load orders",
        description: "There was a problem connecting to the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      if (!isMountedRef.current) return;
      
      setIsLoading(false);
      
      // Clear the guard timeout since we're done loading
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    }
  }, [isLoading, userId, toast]);

  // Socket event handlers
  const handleNewOrder = useCallback((newOrder: Order) => {
    if (!isMountedRef.current) return;
    
    setOrders(prevOrders => sortOrdersByDate([newOrder, ...prevOrders]));
    
    toast({
      title: "New Order",
      description: `Your order for ${newOrder.documentName || 'document'} has been created.`,
    });
  }, [toast]);

  const handleOrderUpdate = useCallback((updatedOrder: Order) => {
    if (!isMountedRef.current) return;
    
    setOrders(prevOrders => prevOrders.map(
      order => (order._id === updatedOrder._id || order.id === updatedOrder.id) 
        ? updatedOrder 
        : order
    ));
    
    toast({
      title: "Order Updated",
      description: `Your order status has changed to ${updatedOrder.status}.`,
    });
  }, [toast]);

  const handleOrderDelete = useCallback((orderId: string) => {
    if (!isMountedRef.current) return;
    
    setOrders(prevOrders => prevOrders.filter(
      order => order._id !== orderId && order.id !== orderId
    ));
    
    toast({
      title: "Order Removed",
      description: "An order has been removed from your history.",
      variant: "destructive"
    });
  }, [toast]);

  const handleOrdersUpdate = useCallback(() => {
    if (!isMountedRef.current) return;
    
    debouncedRefresh.current();
  }, []);

  // Load orders and set up socket events on mount
  useEffect(() => {
    isMountedRef.current = true;
    
    // Define an async function to load orders safely
    const fetchInitialOrders = async () => {
      // Prevent duplicate initial loads
      if (initialLoadStarted.current) {
        return;
      }
      
      initialLoadStarted.current = true;
      
      try {
        await loadOrders();
      } catch (error) {
        console.error("Error in initial order fetch:", error);
        if (isMountedRef.current) setIsLoading(false);
      }
    };
    
    // Execute the initial fetch
    fetchInitialOrders();
    
    // Register socket event handlers
    if (userId) {
      socket.registerEventHandlers({
        onNewOrder: handleNewOrder,
        onOrderUpdated: handleOrderUpdate,
        onOrderDeleted: handleOrderDelete,
        onOrdersUpdated: handleOrdersUpdate
      });
    }
    
    // Clean up on unmount
    return () => {
      isMountedRef.current = false;
      
      socket.registerEventHandlers({});
      
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
  }, [
    userId, 
    socket, 
    loadOrders, 
    handleNewOrder, 
    handleOrderUpdate, 
    handleOrderDelete, 
    handleOrdersUpdate
  ]);

  return {
    orders,
    isLoading,
    hasError,
    loadOrders,
    socket
  };
}
