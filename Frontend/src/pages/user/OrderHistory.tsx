import React, { useEffect, useRef } from "react";
import UserLayout from "@/components/layouts/UserLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderTable from "@/components/OrderTable";
import LoadingErrorState from "@/components/LoadingErrorState";
import OrderHeader from "@/components/OrderHeader";
import { toast } from "@/components/ui/use-toast";
import useAuthStore from "@/store/authStore";
import { useOrders } from "@/hooks/useOrders";

const OrderHistory: React.FC = () => {
  const { user } = useAuthStore();
  const prevConnected = useRef<boolean>(false);
  
  // Use our custom hook to manage orders and socket events
  const { 
    orders, 
    isLoading, 
    hasError, 
    loadOrders, 
    socket 
  } = useOrders({ 
    userId: user?.id
  });

  // Handle socket connection status changes
  useEffect(() => {
    // Only show warnings if we're not connected and have an error
    if (!socket.isConnected && socket.lastError) {
      // Don't spam toast messages - only show when an error is first detected
      if (socket.lastError !== "Connection error: xhr poll error") {
        toast({
          title: "Connection Issue",
          description: "Live updates may be unavailable. Orders will still be processed.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
    
    // If we reconnect, show a success message
    if (socket.isConnected && prevConnected.current === false) {
      toast({
        title: "Connected",
        description: "Live updates are now active.",
        duration: 3000,
      });
    }
    
    // Track connection state changes
    prevConnected.current = socket.isConnected;
  }, [socket.isConnected, socket.lastError, toast]);

  // Make sure user is in the correct socket room
  useEffect(() => {
    if (user?.id && socket.isConnected) {
      // Join user room to ensure we get updates for this specific user
      
      // For user-specific updates, we typically use the joinStore method
      // This ensures the backend knows which user is connected
      socket.joinStore(`user-${user.id}`);
      
      // Try reconnecting if there were connection issues
      if (socket.lastError) {
        socket.reconnect();
      }
    }
  }, [user?.id, socket.isConnected, socket.lastError, socket]);
  
  return (
    <UserLayout>
      <div className="space-y-6">
        <OrderHeader 
          isLoading={isLoading}
          onRefresh={loadOrders}
        />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingErrorState 
              isLoading={isLoading}
              hasError={hasError}
              onRetry={loadOrders}
            />
            
            {!isLoading && !hasError && (
              <OrderTable orders={orders} />
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default OrderHistory;
