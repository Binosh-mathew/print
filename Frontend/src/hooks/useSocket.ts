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
      console.log("Socket is already being initialized, skipping");
      return () => {};
    }
    
    // If we already have a socket instance, don't create a new one
    if (socket) {
      console.log("Socket already exists, ensuring it's connected");
      if (!socket.connected) {
        console.log("Reconnecting existing socket");
        socket.connect();
      } else {
        console.log("Socket is already connected");
      }
      initialized.current = true;
      return () => {};
    }
    
    isInitializing = true;
    console.log("Initializing new socket connection");
    
    // Use VITE_SOCKET_URL if available, otherwise fall back to VITE_API_URL
    const baseUrl = import.meta.env.VITE_SOCKET_URL || 
                   import.meta.env.VITE_API_URL || 
                   "http://localhost:5000";
    
    // Remove any trailing slashes from the URL and ensure no path is included
    const socketUrl = baseUrl.replace(/\/api$/, '').replace(/\/$/, '');
    
    console.log(`Connecting to socket at: ${socketUrl}`);
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
        console.log("Socket connected:", socket?.id);
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
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.error(`Failed to connect after ${MAX_RECONNECT_ATTEMPTS} attempts`);
        }
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
      console.log(`Socket disconnected, reason: ${reason}`);
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

    socket.io.on("reconnect_attempt", (attempt) => {
      console.log(`Socket reconnection attempt #${attempt}`);
    });

    socket.io.on("reconnect", (attempt) => {
      console.log(`Socket reconnected after ${attempt} attempts`);
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
      console.error("Socket reconnection failed after multiple attempts");
      const errorMsg = "Failed to reconnect to server after multiple attempts";
      setLastError(errorMsg);
      updateGlobalError(errorMsg);
    });

    return () => {
      // This function will be called on component unmount
      console.log("Cleanup function called, but keeping socket alive");
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
      console.log("Socket already exists, skipping initialization");
      return () => {};
    }
    
    const cleanup = initializeSocket();
    return cleanup;
  }, [initializeSocket]);

  // Set up event listeners when socket or handlers change
  useEffect(() => {
    if (!socket) {
      console.log("No socket available to register event handlers");
      return;
    }

    // Skip if there are no handlers registered
    const hasHandlers = Object.values(eventHandlers).some(handler => !!handler);
    if (!hasHandlers) {
      console.log("No event handlers registered, skipping listener setup");
      return;
    }

    console.log("Setting up socket event listeners for orders");

    // Listen for new orders
    const handleNewOrder = (order: Order) => {
      console.log("New order received:", order);
      if (eventHandlers.onNewOrder) {
        eventHandlers.onNewOrder(order);
      }
    };

    // Listen for order updates
    const handleOrderUpdate = (updatedOrder: Order) => {
      console.log("Order updated:", updatedOrder);
      if (eventHandlers.onOrderUpdated) {
        eventHandlers.onOrderUpdated(updatedOrder);
      }
    };

    // Listen for order deletions
    const handleOrderDelete = (orderId: string) => {
      console.log("Order deleted:", orderId);
      if (eventHandlers.onOrderDeleted) {
        eventHandlers.onOrderDeleted(orderId);
      }
    };

    // Listen for general order updates
    const handleOrdersUpdate = () => {
      console.log("Orders updated - refreshing data");
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
      
      console.log("Removing socket event listeners");
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
      
      // Only log when status changes to avoid console spam
      if (isConnected !== actualStatus) {
        console.log(`Syncing socket connection status: ${actualStatus ? 'Connected' : 'Disconnected'}`);
        setIsConnected(actualStatus);
        updateGlobalConnectionStatus(actualStatus);
        
        // If we've reconnected after being disconnected, try to rejoin rooms
        if (actualStatus && !isConnected) {
          console.log("Reconnected after being disconnected, reinitializing if needed");
          if (!initialized.current) {
            initialized.current = true;
          }
        }
      }
    };

    // Initial sync
    syncConnectionStatus();

    // Set up interval to periodically check connection status - less frequent to reduce spam
    const intervalId = setInterval(syncConnectionStatus, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isConnected]);

  // Manual reconnect function that can be called from components
  const reconnect = useCallback(() => {
    console.log("Manually reconnecting socket...");
    reconnectAttempts = 0;
    setLastError(null);
    updateGlobalError(null);
    
    if (socket) {
      if (socket.connected) {
        console.log("Socket already connected, disconnecting first");
        socket.disconnect();
      }
      
      console.log("Reconnecting existing socket");
      socket.connect();
    } else {
      console.log("No socket instance exists, initializing new one");
      initializeSocket();
    }
  }, [initializeSocket]);

  // Join a store room to receive store-specific events
  const joinStore = useCallback((storeId: string) => {
    if (!storeId) {
      console.warn("Cannot join store - invalid storeId");
      return;
    }

    if (socket?.connected) {
      console.log(`Joining store room: store:${storeId}`);
      socket.emit("join-store", storeId);
    } else {
      console.warn(`Cannot join store - socket not connected (connected: ${socket?.connected})`);
      // Try to reconnect
      if (socket) {
        // Create a stable reference that TypeScript knows won't be null in callbacks
        const socketRef = socket;
        console.log("Reconnecting socket to join store");
        socketRef.connect();
        
        // After connection is established, join the store
        socketRef.once("connect", () => {
          console.log(`Connected, now joining store: ${storeId}`);
          socketRef.emit("join-store", storeId);
        });
      } else {
        console.log("Initializing socket to join store");
        initializeSocket();
        
        // Initialize socket and defer joining store until connected
        setTimeout(() => {
          // Create a local reference to the current socket inside the callback
          const currentSocket = socket;
          if (currentSocket?.connected) {
            console.log(`Socket initialized, joining store: ${storeId}`);
            currentSocket.emit("join-store", storeId);
          } else {
            console.error("Failed to establish socket connection to join store");
          }
        }, 1000);
      }
    }
  }, [initializeSocket]);

  // Leave a store room when no longer needed
  const leaveStore = useCallback((storeId: string) => {
    if (!storeId) {
      console.warn("Cannot leave store - invalid storeId");
      return;
    }

    if (socket?.connected) {
      // Create a stable reference that TypeScript knows won't be null
      const socketRef = socket;
      console.log(`Leaving store room: store:${storeId}`);
      socketRef.emit("leave-store", storeId);
    } else {
      console.warn("Cannot leave store - socket not connected");
    }
  }, []);

  // Register event handlers for real-time updates
  const registerEventHandlers = useCallback((handlers: {
    onNewOrder?: (order: Order) => void;
    onOrderUpdated?: (order: Order) => void;
    onOrderDeleted?: (orderId: string) => void;
    onOrdersUpdated?: () => void;
  }) => {
    console.log("Registering event handlers");
    
    // Perform a deep comparison to avoid unnecessary state updates
    const handlersChanged = 
      eventHandlers.onNewOrder !== handlers.onNewOrder ||
      eventHandlers.onOrderUpdated !== handlers.onOrderUpdated ||
      eventHandlers.onOrderDeleted !== handlers.onOrderDeleted ||
      eventHandlers.onOrdersUpdated !== handlers.onOrdersUpdated;
    
    if (handlersChanged) {
      setEventHandlers(handlers);
    } else {
      console.log("Event handlers unchanged, skipping update");
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
