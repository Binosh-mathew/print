import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react";
import { Order } from "@/types/order";

interface OrderStatusButtonsProps {
  orders: Order[];
  selectedOrderId: string | null;
  onStatusChange: (orderId: string, newStatus: string) => void;
  getStatusColor: (status: string) => string;
}

export const OrderStatusButtons: React.FC<OrderStatusButtonsProps> = ({
  orders,
  selectedOrderId,
  onStatusChange,
  getStatusColor,
}) => {
  const selectedOrder = orders.find(order => 
    order._id === selectedOrderId || order.id === selectedOrderId
  );

  if (!selectedOrder) return null;

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-500 hover:bg-yellow-600' },
    { value: 'processing', label: 'Processing', icon: Package, color: 'bg-blue-500 hover:bg-blue-600' },
    { value: 'ready', label: 'Ready', icon: CheckCircle, color: 'bg-green-500 hover:bg-green-600' },
    { value: 'completed', label: 'Completed', icon: Truck, color: 'bg-purple-500 hover:bg-purple-600' },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-500 hover:bg-red-600' },
  ];

  const handleStatusUpdate = (newStatus: string) => {
    if (selectedOrder && newStatus !== selectedOrder.status) {
      onStatusChange(selectedOrder._id || selectedOrder.id, newStatus);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Current Status</h3>
        <Badge className={getStatusColor(selectedOrder.status)}>
          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
        </Badge>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Update Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {statusOptions.map((status) => {
            const Icon = status.icon;
            const isCurrentStatus = selectedOrder.status.toLowerCase() === status.value;
            
            return (
              <Button
                key={status.value}
                onClick={() => handleStatusUpdate(status.value)}
                disabled={isCurrentStatus}
                variant={isCurrentStatus ? "secondary" : "outline"}
                className={`flex items-center gap-2 ${
                  isCurrentStatus 
                    ? 'opacity-50 cursor-not-allowed' 
                    : `hover:text-white ${status.color}`
                }`}
                size="sm"
              >
                <Icon className="w-4 h-4" />
                {status.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p>Order ID: {selectedOrder._id || selectedOrder.id}</p>
        <p>Created: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
};
