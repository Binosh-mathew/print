import { io, Socket } from "socket.io-client";
import { useRef, useEffect, useCallback, useState } from "react";
import { Order } from "@/types/order";

// Global socket instance shared between hook instances
let socket: Socket | null = null;
let globalIsConnected = false;
let globalLastError: string | null = null;
let reconnectAttempts = 0;
let isInitializing = false;
const MAX_RECONNECT_ATTEMPTS = 5;

// Use this to track connection status globally across hook instances
const updateGlobalConnectionStatus = (status: boolean) => {
  globalIsConnected = status;
};

const updateGlobalError = (error: string | null) => {
  globalLastError = error;
};

export const useSocket = () => {
  const initialized = useRef(false);
  const [isConnected, setIsConnected] = useState<boolean>(globalIsConnected);
  const [lastError, setLastError] = useState<string | null>(globalLastError);
  const [eventHandlers, setEventHandlers] = useState<{
    onNewOrder?: (order: Order) => void;
    onOrderUpdated?: (order: Order) => void;
    onOrderDeleted?: (orderId: string) => void;
    onOrdersUpdated?: () => void;
  }>({});

  const initializeSocket = useCallback(() => {
    // Prevent multiple initializations at the same time
    if (isInitializing) {
      return () => {};
    }
    
    // If we already have a socket instance, don't create a new one
    if (socket) {
      if (!socket.connected) {
        socket.connect();
      }
      initialized.current = true;
      return () => {};
    }
    
    isInitializing = true;
    
    // Use VITE_SOCKET_URL if available, otherwise fall back to VITE_API_URL
    const baseUrl = import.meta.env.VITE_SOCKET_URL || 
                   import.meta.env.VITE_API_URL || 
                   "http://localhost:5000";
    
    // Remove any trailing slashes from the URL and ensure no path is included
    const socketUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');
    
    setLastError(null);
    updateGlobalError(null);

    try {
      // Connect to the root namespace (no path) with maximum compatibility
      socket = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
        forceNew: true, // Use forceNew to ensure a clean connection
        path: '/socket.io' // Explicitly use default path
      });

      socket.on("connect", () => {
        initialized.current = true;
        reconnectAttempts = 0;
        isInitializing = false;
        updateGlobalConnectionStatus(true);
        setIsConnected(true);
        setLastError(null);
        updateGlobalError(null);
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);
        updateGlobalConnectionStatus(false);
        setIsConnected(false);
        const errorMsg = `Connection error: ${error.message}`;
        setLastError(errorMsg);
        updateGlobalError(errorMsg);
        
        // Track reconnection attempts
        reconnectAttempts++;
      });
    } catch (err) {
      console.error("Error initializing socket:", err);
      const errorMsg = err instanceof Error ? err.message : "Unknown error initializing socket";
      setLastError(errorMsg);
      updateGlobalError(errorMsg);
      isInitializing = false;
      return () => {};
    }

    socket.on("disconnect", (reason) => {
      updateGlobalConnectionStatus(false);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // The server disconnected us, we need to manually reconnect
        socket?.connect();
      }
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
      const errorMsg = typeof error === 'string' ? error : 'Socket error occurred';
      setLastError(errorMsg);
      updateGlobalError(errorMsg);
    });

    socket.io.on("reconnect", () => {
      reconnectAttempts = 0;
      updateGlobalConnectionStatus(true);
      setIsConnected(true);
      setLastError(null);
      updateGlobalError(null);
    });

    socket.io.on("reconnect_error", (error) => {
      console.error("Socket reconnection error:", error);
      const errorMsg = `Reconnection error: ${error.message}`;
      setLastError(errorMsg);
      updateGlobalError(errorMsg);
    });

    socket.io.on("reconnect_failed", () => {
      const errorMsg = "Failed to reconnect to server after multiple attempts";
      setLastError(errorMsg);
      updateGlobalError(errorMsg);
    });

    return () => {
      // This function will be called on component unmount
      // We no longer disconnect the socket on cleanup to maintain connection across components
      // Instead, we'll only reset the local state
      initialized.current = false;
      isInitializing = false;
    };
  }, []);

  // Only initialize socket once when the hook is first used
  useEffect(() => {
    // Skip initialization if it's already been done
    if (socket) {
      return () => {};
    }
    
    const cleanup = initializeSocket();
    return cleanup;
  }, [initializeSocket]);

  // Set up event listeners when socket or handlers change
  useEffect(() => {
    if (!socket) {
      return;
    }

    // Skip if there are no handlers registered
    const hasHandlers = Object.values(eventHandlers).some(handler => !!handler);
    if (!hasHandlers) {
      return;
    }

    // Listen for new orders
    const handleNewOrder = (order: Order) => {
      if (eventHandlers.onNewOrder) {
        eventHandlers.onNewOrder(order);
      }
    };

    // Listen for order updates
    const handleOrderUpdate = (updatedOrder: Order) => {
      if (eventHandlers.onOrderUpdated) {
        eventHandlers.onOrderUpdated(updatedOrder);
      }
    };

    // Listen for order deletions
    const handleOrderDelete = (orderId: string) => {
      if (eventHandlers.onOrderDeleted) {
        eventHandlers.onOrderDeleted(orderId);
      }
    };

    // Listen for general order updates
    const handleOrdersUpdate = () => {
      if (eventHandlers.onOrdersUpdated) {
        eventHandlers.onOrdersUpdated();
      }
    };

    // Register event listeners
    socket.on("order:new", handleNewOrder);
    socket.on("order:updated", handleOrderUpdate);
    socket.on("order:statusUpdated", handleOrderUpdate); // Legacy event name
    socket.on("order:deleted", handleOrderDelete);
    socket.on("orders:updated", handleOrdersUpdate);

    // Cleanup event listeners when component unmounts or handlers change
    return () => {
      // Important: Create a stable reference to socket that TypeScript knows won't be null
      const currentSocket = socket;
      if (!currentSocket) return;
      
      currentSocket.off("order:new", handleNewOrder);
      currentSocket.off("order:updated", handleOrderUpdate);
      currentSocket.off("order:statusUpdated", handleOrderUpdate); // Legacy event name
      currentSocket.off("order:deleted", handleOrderDelete);
      currentSocket.off("orders:updated", handleOrdersUpdate);
    };
  }, [
    // Only re-run this effect if the event handler REFERENCES change, not their contents
    eventHandlers.onNewOrder,
    eventHandlers.onOrderUpdated,
    eventHandlers.onOrderDeleted,
    eventHandlers.onOrdersUpdated
  ]);

  // Synchronize connection status periodically
  useEffect(() => {
    // This ensures the local state is synced with the actual socket connection state
    const syncConnectionStatus = () => {
      const actualStatus = socket?.connected || false;
      
      // Only update when status changes
      if (isConnected !== actualStatus) {
        setIsConnected(actualStatus);
        updateGlobalConnectionStatus(actualStatus);
        
        // If we've reconnected after being disconnected, try to rejoin rooms
        if (actualStatus && !isConnected) {
          if (!initialized.current) {
            initialized.current = true;
          }
        }
      }
    };

    // Initial sync
    syncConnectionStatus();

    // Set up interval to periodically check connection status
    const intervalId = setInterval(syncConnectionStatus, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isConnected]);

  // Manual reconnect function that can be called from components
  const reconnect = useCallback(() => {
    reconnectAttempts = 0;
    setLastError(null);
    updateGlobalError(null);
    
    if (socket) {
      if (socket.connected) {
        socket.disconnect();
      }
      
      socket.connect();
    } else {
      initializeSocket();
    }
  }, [initializeSocket]);

  // Join a store room to receive store-specific events
  const joinStore = useCallback((storeId: string) => {
    if (!storeId) {
      return;
    }

    if (socket?.connected) {
      socket.emit("join-store", storeId);
    } else {
      // Try to reconnect
      if (socket) {
        // Create a stable reference that TypeScript knows won't be null in callbacks
        const socketRef = socket;
        socketRef.connect();
        
        // After connection is established, join the store
        socketRef.once("connect", () => {
          socketRef.emit("join-store", storeId);
        });
      } else {
        initializeSocket();
        
        // Initialize socket and defer joining store until connected
        setTimeout(() => {
          // Create a local reference to the current socket inside the callback
          const currentSocket = socket;
          if (currentSocket?.connected) {
            currentSocket.emit("join-store", storeId);
          }
        }, 1000);
      }
    }
  }, [initializeSocket]);

  // Leave a store room when no longer needed
  const leaveStore = useCallback((storeId: string) => {
    if (!storeId) {
      return;
    }

    if (socket?.connected) {
      // Create a stable reference that TypeScript knows won't be null
      const socketRef = socket;
      socketRef.emit("leave-store", storeId);
    }
  }, []);

  // Register event handlers for real-time updates
  const registerEventHandlers = useCallback((handlers: {
    onNewOrder?: (order: Order) => void;
    onOrderUpdated?: (order: Order) => void;
    onOrderDeleted?: (orderId: string) => void;
    onOrdersUpdated?: () => void;
  }) => {
    // Perform a deep comparison to avoid unnecessary state updates
    const handlersChanged = 
      eventHandlers.onNewOrder !== handlers.onNewOrder ||
      eventHandlers.onOrderUpdated !== handlers.onOrderUpdated ||
      eventHandlers.onOrderDeleted !== handlers.onOrderDeleted ||
      eventHandlers.onOrdersUpdated !== handlers.onOrdersUpdated;
    
    if (handlersChanged) {
      setEventHandlers(handlers);
    }
  }, [eventHandlers]);

  // Expose a focused API
  return {
    isConnected,
    lastError,
    joinStore,
    leaveStore,
    reconnect,
    registerEventHandlers
  };
};
